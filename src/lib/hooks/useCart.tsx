'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
    id: number
    name: string
    description: string
    price: number
    quantity: number
    image: string
}

interface CartContextType {
    cartItems: CartItem[]
    addToCart: (item: Omit<CartItem, 'quantity'>) => void
    updateQuantity: (id: number, quantity: number) => void
    removeFromCart: (id: number) => void
    clearCart: () => void
    getTotalItems: () => number
    getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const LS_CART_KEY = 'fuwari-cart'
const LS_CART_BACKUP_KEY = 'fuwari-cart-backup'
const LS_CART_USER_KEY = 'fuwari-cart-user'

// ─── Helper: read guest cart from localStorage (returns [] on error) ──────────
function readGuestCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(LS_CART_KEY)
        if (!raw) return []
        return JSON.parse(raw) as CartItem[]
    } catch {
        return []
    }
}

// ─── Helper: clear guest cart from localStorage ───────────────────────────────
function clearLocalStorageCart() {
    localStorage.removeItem(LS_CART_KEY)
    localStorage.removeItem(LS_CART_BACKUP_KEY)
    localStorage.removeItem(LS_CART_USER_KEY)
}

// ─── Helper: persist cart to DB (fire-and-forget) ─────────────────────────────
function syncCartToDB(items: CartItem[]) {
    fetch('/api/user/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        }),
    }).catch(err => console.error('Failed to sync cart to DB:', err))
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    // isLoaded: true once the initial cart (guest or user) has been resolved
    const [isLoaded, setIsLoaded] = useState(false)
    const { data: session, status: sessionStatus } = useSession()
    // Track the userId whose DB cart has already been loaded into state
    const loadedUserIdRef = useRef<string | null>(null)
    // Ref mirror of isLoaded — avoids stale closure in the auth effect since
    // that effect intentionally omits isLoaded from its dependency array.
    const isLoadedRef = useRef(false)
    // Prevent DB syncs while the initial merge is still in-flight
    const mergeInProgressRef = useRef(false)
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Helper that keeps both the React state and the ref in sync
    const markLoaded = () => {
        isLoadedRef.current = true
        setIsLoaded(true)
    }

    // ── Effect: React to auth state changes ───────────────────────────────────
    useEffect(() => {
        if (sessionStatus === 'loading') return

        const userId = session?.user?.id ?? null

        // ── Case A: User logged out ────────────────────────────────────────────
        if (!userId) {
            if (loadedUserIdRef.current !== null) {
                // Previously logged in — clear everything so the next user starts fresh
                loadedUserIdRef.current = null
                clearLocalStorageCart()
                setCartItems([])
                markLoaded()
            } else if (!isLoadedRef.current) {
                // Very first render and no session — load guest cart from localStorage
                try {
                    // Restore backup cart created during language switching
                    let savedCart = localStorage.getItem(LS_CART_KEY)
                    const backupCart = localStorage.getItem(LS_CART_BACKUP_KEY)
                    if (backupCart && (!savedCart || savedCart === '[]')) {
                        savedCart = backupCart
                        localStorage.setItem(LS_CART_KEY, backupCart)
                        localStorage.removeItem(LS_CART_BACKUP_KEY)
                    }
                    if (savedCart) setCartItems(JSON.parse(savedCart))
                } catch {
                    localStorage.removeItem(LS_CART_KEY)
                }
                markLoaded()
            }
            return
        }

        // ── Case B: Same user already loaded — nothing to do ──────────────────
        if (loadedUserIdRef.current === userId) return

        // ── Case C: New user logging in (fresh login or account switch) ───────
        // Capture guest cart *before* we overwrite anything. If this is an account
        // switch the "guest cart" is actually the previous user's cart — we must NOT
        // merge it into the new user's DB. We detect this by checking whether the
        // localStorage cart was owned by a different user.
        const previousOwnerId = localStorage.getItem(LS_CART_USER_KEY)
        const guestCart: CartItem[] =
            previousOwnerId === null  // cart was built while not logged in → treat as guest
                ? readGuestCart()
                : []                  // cart belonged to a different user → discard

        // Mark that we're loading this user's cart
        loadedUserIdRef.current = userId
        mergeInProgressRef.current = true

        fetch('/api/user/cart')
            .then(res => (res.ok ? res.json() : { items: [] }))
            .then(async ({ items: dbItems }: { items: { product_id: number; quantity: number }[] }) => {

                // Fetch all active products once — used to hydrate DB-only items AND
                // to validate that guest cart items still exist in the catalogue.
                const productsRes = await fetch('/api/products')
                const allProducts: {
                    id: number; name: string; description: string; price: number; image: string
                }[] = productsRes.ok ? await productsRes.json() : []
                const productMap = new Map(allProducts.map(p => [p.id, p]))

                // Drop any guest cart items for products that no longer exist
                const validatedGuestCart = guestCart.filter(item => productMap.has(item.id))

                // Find which DB item IDs are not present in the (validated) guest cart
                const dbOnlyItems = dbItems
                    .filter(d => !validatedGuestCart.some(g => g.id === d.product_id))
                    .map(d => ({ id: d.product_id, quantity: d.quantity }))

                // Hydrate DB-only items using the already-fetched product map
                const hydratedDbOnly: CartItem[] = dbOnlyItems
                    .map(item => {
                        const p = productMap.get(item.id)
                        if (!p) return null
                        return { id: p.id, name: p.name, description: p.description, price: p.price, image: p.image, quantity: item.quantity }
                    })
                    .filter((item): item is CartItem => item !== null)

                // Build merged cart:
                //   • For items in both: DB quantity wins (DB is the source of truth for logged-in users)
                //   • Guest-only items: keep them (user added while browsing before login)
                //   • DB-only items: add them (fully hydrated)
                const mergedMap = new Map<number, CartItem>()

                // Start with validated guest cart items as base
                for (const item of validatedGuestCart) {
                    mergedMap.set(item.id, item)
                }

                // Override/add with DB items (DB quantity wins for conflicts)
                for (const dbItem of dbItems) {
                    const existing = mergedMap.get(dbItem.product_id)
                    if (existing) {
                        // Item exists in both: use DB quantity as the authoritative value
                        mergedMap.set(dbItem.product_id, { ...existing, quantity: dbItem.quantity })
                    }
                }

                // Add DB-only hydrated items
                for (const item of hydratedDbOnly) {
                    mergedMap.set(item.id, item)
                }

                const finalCart = Array.from(mergedMap.values())

                // Persist merged result to DB (makes guest-only items permanent)
                syncCartToDB(finalCart)

                // Save to localStorage and tag it with the current user id
                try {
                    localStorage.setItem(LS_CART_KEY, JSON.stringify(finalCart))
                    localStorage.setItem(LS_CART_USER_KEY, userId)
                } catch { /* ignore */ }

                mergeInProgressRef.current = false
                setCartItems(finalCart)
                markLoaded()
            })
            .catch(err => {
                console.error('Failed to load cart from DB:', err)
                // Fallback: use whatever we have locally (only if it was a true guest cart)
                mergeInProgressRef.current = false
                setCartItems(guestCart)
                markLoaded()
            })

    }, [session?.user?.id, sessionStatus])

    // ── Save cart to localStorage whenever it changes (logged-in users only) ──
    useEffect(() => {
        if (!isLoaded) return
        if (!session?.user?.id) return   // guest cart is saved separately below
        try {
            localStorage.setItem(LS_CART_KEY, JSON.stringify(cartItems))
            localStorage.setItem(LS_CART_USER_KEY, session.user.id)
        } catch { /* ignore */ }
    }, [cartItems, isLoaded, session?.user?.id])

    // ── Save guest cart to localStorage whenever it changes ──────────────────
    useEffect(() => {
        if (!isLoaded) return
        if (session?.user?.id) return   // handled above
        try {
            localStorage.setItem(LS_CART_KEY, JSON.stringify(cartItems))
            localStorage.removeItem(LS_CART_USER_KEY)
        } catch { /* ignore */ }
    }, [cartItems, isLoaded, session?.user?.id])

    // ── Debounced DB sync on cart changes (only when logged in & merge done) ──
    useEffect(() => {
        if (!isLoaded) return
        if (!session?.user?.id) return
        if (mergeInProgressRef.current) return

        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = setTimeout(() => {
            syncCartToDB(cartItems)
        }, 1000)

        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
        }
    }, [cartItems, isLoaded, session?.user?.id])

    // ── Cross-tab sync via storage events ─────────────────────────────────────
    // Only accept cart updates from tabs running under the same user (or both guest)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key !== LS_CART_KEY || e.newValue === null) return
            // Validate that the tab which wrote the cart belongs to the same user
            const ownerInOtherTab = localStorage.getItem(LS_CART_USER_KEY)
            const currentUserId = loadedUserIdRef.current
            if (ownerInOtherTab !== currentUserId) return  // different user — ignore
            try {
                setCartItems(JSON.parse(e.newValue))
            } catch { /* ignore */ }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    // ─── Cart mutation helpers ────────────────────────────────────────────────

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(cartItem => cartItem.id === item.id)

            if (existingItem) {
                return prevItems.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            } else {
                return [...prevItems, { ...item, quantity: 1 }]
            }
        })
    }

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id)
            return
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        )
    }

    const removeFromCart = (id: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id))
    }

    const clearCart = () => {
        setCartItems([])
        // Immediately wipe DB so a closed tab can't resurrect a completed cart
        if (session?.user?.id) {
            syncCartToDB([])
        }
    }

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0)
    }

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    const value: CartContextType = {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
