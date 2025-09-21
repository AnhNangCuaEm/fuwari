'use client'

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import {Link} from '@/i18n/navigation';
import {useTranslations, useLocale} from 'next-intl';
import { useCart } from "@/lib/hooks/useCart";
import { getProductById } from "@/lib/products";

export default function CartPage() {
    const t = useTranslations();
    const locale = useLocale();
    const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart()

    // Helper function to get localized product name and description
    const getLocalizedProductInfo = (item: { id: number; name: string; description: string }) => {
        const product = getProductById(item.id);
        if (product) {
            return {
                name: locale === 'en' ? product.engName : product.name,
                description: locale === 'en' ? product.engDescription : product.description
            };
        }
        // Fallback to item data if product not found
        return {
            name: item.name,
            description: item.description
        };
    };

    const getSubtotal = () => {
        return getTotalPrice()
    }

    const getTax = () => {
        return Math.round(getSubtotal() * 0.1) // 10% tax
    }

    const getShipping = () => {
        return getSubtotal() >= 2000 ? 0 : 550 // Free shipping over ¥2000
    }

    const getTotal = () => {
        return getSubtotal() + getTax() + getShipping()
    }

    const getItems = () => {
        return getTotalItems()
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl text-center font-bold text-gray-900 mb-8">{t("cart.title")}</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-semibold text-gray-600 mb-2">{t("cart.emptyMessage")}</h2>
                        <p className="text-gray-500 mb-6">{t("cart.continueShopping")}</p>
                        <Link
                            href="/products"
                            className="inline-block bg-[#D6B884] hover:bg-[#CC8409] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            {t("cart.viewProducts")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Left Column - Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-semibold">{t("cart.cartItems")} ({cartItems.length})</h2>
                                </div>

                                <div className="divide-y divide-black border-b">
                                    {cartItems.map((item) => {
                                        const localizedInfo = getLocalizedProductInfo(item);
                                        return (
                                            <div key={item.id} className="p-6 flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <Link href={`/products/${item.id}`}>
                                                        <Image
                                                            src={item.image}
                                                            alt={localizedInfo.name}
                                                            width={100}
                                                            height={100}
                                                            className="rounded-lg object-cover"
                                                        />
                                                    </Link>
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">{localizedInfo.name}</h3>
                                                    <p className="text-gray-600 text-sm mt-1">{localizedInfo.description}</p>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center space-x-3">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center space-x-4">
                                                            <span className="text-lg font-bold text-orange-600">
                                                                ¥{item.price}
                                                            </span>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                                                            >
                                                                {t("cart.remove")}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-6 border-t">
                                        <span>{t("cart.freeShippingNotice")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#FAF3E0] shadow-sm sticky top-8">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-semibold">{t("cart.orderDetails")}</h2>
                                </div>

                                <div className="p-6 space-y-4">

                                    <div className="flex justify-between">
                                        <span>{t("cart.totalItems")}</span>
                                        <span>{getItems()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>{t("cart.subtotal")}</span>
                                        <span>¥{getSubtotal()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>{t("cart.tax")}</span>
                                        <span>¥{getTax()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>{t("cart.shipping")}</span>
                                        <span>{getShipping() === 0 ? t("cart.free") : `¥${getShipping()}`}</span>
                                    </div>

                                    {getSubtotal() >= 2000 && (
                                        <div className="text-sm text-green-600">
                                            {t("cart.freeDeliverMsg")}
                                        </div>
                                    )}

                                    <hr className="my-4" />

                                    <div className="flex justify-between text-lg font-bold">
                                        <span>{t("cart.total")}</span>
                                        <span className="text-orange-600">¥{getTotal()}</span>
                                    </div>

                                    <button className="w-full bg-[#D6B884] hover:bg-[#CC8409] text-white p-3 rounded-lg font-semibold transition-colors cursor-pointer">
                                        {t("cart.checkout")}
                                    </button>

                                    <Link
                                        href="/products"
                                        className="block w-full text-center border border-gray-300 hover:border-gray-500 p-3 rounded-lg font-semibold transition-colors cursor-pointer"
                                    >
                                        {t("cart.continueShopping")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
