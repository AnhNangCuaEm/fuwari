'use client'

import { Link } from "@/i18n/navigation"
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCart } from '@/lib/hooks/useCart'
import AlertModal from "@/components/ui/AlertModal";
import { useState } from "react"
interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart()
    const t = useTranslations();
    const [showRemoveAlert, setShowRemoveAlert] = useState(false);
    const [itemToRemove, setItemToRemove] = useState<number | null>(null);



    // Handle remove confirmation
    const handleRemoveClick = (itemId: number) => {
        setItemToRemove(itemId);
        setShowRemoveAlert(true);
    };

    const handleConfirmRemove = () => {
        if (itemToRemove !== null) {
            removeFromCart(itemToRemove);
            setItemToRemove(null);
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#03030354] z-40"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`
                fixed top-0 right-0 h-full w-96 bg-almond-1 shadow-xl z-50 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-almond-1 flex-shrink-0">
                    <h2 className="text-xl font-bold">{t('shopping.cart.title')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-gray-500 mt-20">
                            <div className="text-6xl mb-4">🛒</div>
                            <p className="text-lg">{t('cart.emptyMessage')}</p>
                            <p className="text-sm mt-2 text-gray-400">{t('cart.emptySuggestion')}</p>
                            <Link href="/products">
                                <button className="mt-6 px-4 py-2 bg-almond-6 text-white rounded-lg hover:bg-almond-5 transition-colors">
                                    {t('cart.continueShopping')}
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Link href={`/products/${item.id}`}>
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={70}
                                            height={70}
                                            className="w-24 h-24 rounded-lg object-cover"
                                        />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                            <p className="text-green-600 font-bold text-lg">¥{item.price.toLocaleString()}</p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold disabled:bg-gray-100 disabled:text-gray-400"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveClick(item.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            >
                                                {t('cart.remove')}
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
                    <div className="border-t bg-almond-1 p-4 space-y-4 flex-shrink-0">
                        {/* Summary */}
                        <div className="space-y-2">
                            <div className="flex justify-between font-bold text-xl">
                                <span>{t('cart.subtotal')} ({getTotalItems()})</span>
                                <span className="text-green-600">¥{getTotalPrice().toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <Link
                            href="/cart"
                            className="block w-full bg-almond-6 hover:bg-almond-5 text-white text-center py-4 rounded-lg font-semibold transition-colors text-lg"
                            onClick={onClose}
                        >
                            {t('shopping.cart.viewCart')}
                        </Link>
                        <Link
                            href="/products"
                            className="block w-full text-center border border-gray-300 hover:border-gray-500 p-3 rounded-lg font-semibold transition-colors"
                        >
                            {t("cart.continueShopping")}
                        </Link>
                    </div>
                )}

                {/* Remove Item Alert Modal */}
                <AlertModal
                    isOpen={showRemoveAlert}
                    onClose={() => setShowRemoveAlert(false)}
                    title={t("cart.removeConfirmTitle")}
                    message={t("cart.removeConfirmMsg")}
                    type="warning"
                    confirmText={t("cart.removeConfirm")}
                    cancelText={t("cart.cancel")}
                    onConfirm={handleConfirmRemove}
                    showCancel={true}
                />
            </div>
        </>
    )
}
