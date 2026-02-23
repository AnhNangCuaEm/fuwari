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
    const [isLoaded, setIsLoaded] = useState(false)
    const { data: session, status: sessionStatus } = useSession()
    // Track whether we have already merged the DB cart for this session
    const dbMergedRef = useRef(false)

    // ── Step 1: Load cart from localStorage on mount ──────────────────────────
    useEffect(() => {
        try {
            let savedCart = localStorage.getItem('fuwari-cart')

            // Restore backup cart created during language switching
            const backupCart = localStorage.getItem('fuwari-cart-backup')
            if (backupCart && (!savedCart || savedCart === '[]')) {
                savedCart = backupCart
                localStorage.setItem('fuwari-cart', backupCart)
                localStorage.removeItem('fuwari-cart-backup')
            }

            if (savedCart) {
                const parsedCart = JSON.parse(savedCart)
                setCartItems(parsedCart)
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error)
            localStorage.removeItem('fuwari-cart')
            localStorage.removeItem('fuwari-cart-backup')
        }
        setIsLoaded(true)
    }, [])

    // ── Step 2: When user logs in, merge localStorage cart with DB cart ───────
    useEffect(() => {
        if (!isLoaded) return
        if (sessionStatus === 'loading') return
        if (!session?.user?.id) {
            // User logged out — reset merge flag so it runs again on next login
            dbMergedRef.current = false
            return
        }
        if (dbMergedRef.current) return // already merged for this session

        dbMergedRef.current = true

        fetch('/api/user/cart')
            .then(res => (res.ok ? res.json() : { items: [] }))
            .then(async ({ items: dbItems }: { items: { product_id: number; quantity: number }[] }) => {
                // Determine which product IDs are missing from localStorage
                setCartItems(prev => {
                    const missingIds = dbItems
                        .filter(d => !prev.some(p => p.id === d.product_id))
                        .map(d => d.product_id)

                    if (missingIds.length === 0) {
                        // All items already have full metadata locally — just merge quantities
                        const merged: CartItem[] = prev.map(localItem => {
                            const remote = dbItems.find(d => d.product_id === localItem.id)
                            if (remote && remote.quantity !== localItem.quantity) {
                                return { ...localItem, quantity: Math.max(localItem.quantity, remote.quantity) }
                            }
                            return localItem
                        })
                        syncCartToDB(merged)
                        return merged
                    }

                    // There are remote-only items — we need to fetch their product info.
                    // Return merged cart with stubs for now; a follow-up effect will
                    // hydrate the stubs once the product fetch completes.
                    const remoteStubs: CartItem[] = dbItems
                        .filter(d => !prev.some(p => p.id === d.product_id))
                        .map(d => ({
                            id: d.product_id,
                            name: '',
                            description: '',
                            price: 0,
                            image: '',
                            quantity: d.quantity,
                        }))

                    const merged: CartItem[] = prev.map(localItem => {
                        const remote = dbItems.find(d => d.product_id === localItem.id)
                        if (remote && remote.quantity !== localItem.quantity) {
                            return { ...localItem, quantity: Math.max(localItem.quantity, remote.quantity) }
                        }
                        return localItem
                    })

                    const cartWithStubs = [...merged, ...remoteStubs]

                    // Fetch full product info for the missing items and hydrate the stubs.
                    // We do NOT return cartWithStubs yet — instead we wait for the product
                    // fetch to complete so we never persist empty stubs to localStorage.
                    fetch('/api/products')
                        .then(r => (r.ok ? r.json() : []))
                        .then((allProducts: { id: number; name: string; engName: string; description: string; engDescription: string; price: number; image: string }[]) => {
                            const productMap = new Map(allProducts.map(p => [p.id, p]))
                            // Replace stubs with fully-hydrated items in one atomic update
                            const hydratedCart = cartWithStubs.map(item => {
                                if (item.name !== '' && item.price !== 0) return item // already has metadata
                                const product = productMap.get(item.id)
                                if (!product) return item // unknown product id — leave as-is
                                return {
                                    ...item,
                                    name: product.name,
                                    description: product.description,
                                    price: product.price,
                                    image: product.image,
                                }
                            })
                            // De-duplicate by id just in case (safety net)
                            const seen = new Set<number>()
                            const deduped = hydratedCart.filter(item => {
                                if (seen.has(item.id)) return false
                                seen.add(item.id)
                                return true
                            })
                            setCartItems(deduped)
                            syncCartToDB(deduped)
                        })
                        .catch(err => console.error('Failed to hydrate cart item metadata:', err))

                    // Return merged+stubs so UI can show the items (quantity visible)
                    // while the name/price/image are being fetched.
                    return cartWithStubs
                })
            })
            .catch(err => console.error('Failed to fetch DB cart:', err))
    }, [isLoaded, session?.user?.id, sessionStatus])

    // ── Step 3: Save cart to localStorage whenever it changes ────────────────
    useEffect(() => {
        if (!isLoaded) return
        try {
            localStorage.setItem('fuwari-cart', JSON.stringify(cartItems))
        } catch (error) {
            console.error('Error saving cart to localStorage:', error)
        }
    }, [cartItems, isLoaded])

    // ── Step 4: Persist to DB on changes (only when logged in) ───────────────
    // We use a debounce-like approach: only sync after the cart settles to avoid
    // hammering the API on every keystroke.
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    useEffect(() => {
        if (!isLoaded) return
        if (!session?.user?.id) return
        if (!dbMergedRef.current) return // don't sync before the initial merge

        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = setTimeout(() => {
            syncCartToDB(cartItems)
        }, 1000)

        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
        }
    }, [cartItems, isLoaded, session?.user?.id])

    // ── Step 5: Cross-tab sync via storage events ─────────────────────────────
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'fuwari-cart' && e.newValue !== null) {
                try {
                    const newCartItems = JSON.parse(e.newValue)
                    setCartItems(newCartItems)
                } catch (error) {
                    console.error('Error parsing cart from storage event:', error)
                }
            }
        }

        const handleBeforeUnload = () => {
            try {
                localStorage.setItem('fuwari-cart', JSON.stringify(cartItems))
            } catch (error) {
                console.error('Error saving cart before unload:', error)
            }
        }

        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [cartItems])

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
