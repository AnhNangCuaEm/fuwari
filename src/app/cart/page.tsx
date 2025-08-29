'use client'

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/hooks/useCart";

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart()

    const getSubtotal = () => {
        return getTotalPrice()
    }

    const getTax = () => {
        return Math.round(getSubtotal() * 0.1) // 10% tax
    }

    const getShipping = () => {
        return getSubtotal() > 1000 ? 0 : 550 // Free shipping over ¥1000
    }

    const getTotal = () => {
        return getSubtotal() + getTax() + getShipping()
    }

    const getItems = () => {
        return getTotalItems()
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping カート</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-semibold text-gray-600 mb-2">カートにアイテムがありません</h2>
                        <p className="text-gray-500 mb-6">美味しいお菓子を追加しましょう！</p>
                        <Link
                            href="/products"
                            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            商品を閲覧
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-semibold">カートアイテム ({cartItems.length})</h2>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="p-6 flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <Link href={`/products/${item.id}`}>
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={100}
                                                        height={100}
                                                        className="rounded-lg object-cover"
                                                    />
                                                </Link>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
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
                                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                        >
                                                            削除
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm sticky top-8">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-semibold">注文詳細</h2>
                                </div>

                                <div className="p-6 space-y-4">

                                    <div className="flex justify-between">
                                        <span>個数</span>
                                        <span>{getItems()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>小計</span>
                                        <span>¥{getSubtotal()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>税金 (10%)</span>
                                        <span>¥{getTax()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>送料</span>
                                        <span>{getShipping() === 0 ? '無料' : `¥${getShipping()}`}</span>
                                    </div>

                                    {getSubtotal() > 500 && (
                                        <div className="text-sm text-green-600">
                                            🎉 無料配送が適用されました！
                                        </div>
                                    )}

                                    <hr className="my-4" />

                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-orange-600">¥{getTotal()}</span>
                                    </div>

                                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors mt-6">
                                        購入手続き
                                    </button>

                                    <Link
                                        href="/products"
                                        className="block w-full text-center border border-gray-300 hover:border-gray-400 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        買い物を続ける
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
