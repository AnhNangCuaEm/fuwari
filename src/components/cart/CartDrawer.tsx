'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/hooks/useCart'

interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart()

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-30 z-40"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`
                fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">カート</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* Cart Content */}
                <div className="flex flex-col h-full">
                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cartItems.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                <div className="text-4xl mb-4">🛒</div>
                                <p>まだカートにアイテムがありません</p>
                                <p className="text-sm mt-2">美味しいお菓子を追加しましょう！</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={60}
                                            height={60}
                                            className="rounded-md object-cover"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm">{item.name}</h4>
                                            <p className="text-orange-600 font-bold">¥{item.price}</p>
                                            
                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-2 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-2 text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="border-t bg-white p-4 space-y-4">
                            {/* Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Items ({getTotalItems()})</span>
                                    <span>¥{getTotalPrice()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>合計</span>
                                    <span className="text-orange-600">¥{getTotalPrice()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Link
                                    href="/cart"
                                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                                    onClick={onClose}
                                >
                                    カートを見る
                                </Link>
                                <button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-semibold transition-colors">
                                    購入手続き
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
