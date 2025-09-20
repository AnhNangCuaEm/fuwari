'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
    debugCartState: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            let savedCart = localStorage.getItem('fuwari-cart')
            
            // Check for backup cart data (from language switching)
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

    // Save cart to localStorage whenever it changes (only after initial load)
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('fuwari-cart', JSON.stringify(cartItems))
            } catch (error) {
                console.error('Error saving cart to localStorage:', error)
            }
        }
    }, [cartItems, isLoaded])

    // Listen for storage events to sync cart across tabs and handle external changes
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
            // Ensure cart is saved before page unloads
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

    const debugCartState = () => {
        console.log('Cart Debug Info:', {
            cartItems,
            itemCount: cartItems.length,
            totalItems: getTotalItems(),
            totalPrice: getTotalPrice(),
            localStorage: localStorage.getItem('fuwari-cart'),
            backup: localStorage.getItem('fuwari-cart-backup')
        })
    }

    const value: CartContextType = {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
        debugCartState
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
