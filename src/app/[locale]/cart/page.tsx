'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useCart } from "@/lib/hooks/useCart";
import CheckoutModal from "@/components/cart/CheckoutModal";
import DeliveryDatePicker from "@/components/cart/DeliveryDatePicker";
import AlertModal from "@/components/ui/AlertModal";
import type { Product } from "@/types/product";
import { OrderTotals } from "@/types/order";

// Initialize Stripe with error handling
const getStripePromise = () => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
        console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
        return null;
    }

    return loadStripe(publishableKey);
};

const stripePromise = getStripePromise();

export default function CartPage() {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart();

    const [showCheckout, setShowCheckout] = useState(false);
    const [isCheckingStock, setIsCheckingStock] = useState(false);
    const [stockError, setStockError] = useState<string | null>(null);
    const [showRemoveAlert, setShowRemoveAlert] = useState(false);
    const [itemToRemove, setItemToRemove] = useState<number | null>(null);
    const [showStockErrorAlert, setShowStockErrorAlert] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date | null>(null);

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };
        fetchProducts();
    }, []);

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

    // Helper function to get localized product name and description
    const getLocalizedProductInfo = (item: { id: number; name: string; description: string }) => {
        const product = products.find(p => p.id === item.id);
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

    // Create totals object for checkout
    const totals: OrderTotals = {
        subtotal: getSubtotal(),
        tax: getTax(),
        shipping: getShipping(),
        total: getTotal()
    };

    // Clear stock error when cart items change
    useEffect(() => {
        setStockError(null);
    }, [cartItems]);

    // Check stock availability before checkout
    const checkStockBeforeCheckout = async () => {
        setIsCheckingStock(true);
        setStockError(null);

        try {
            const stockItems = cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                name: item.name
            }));

            const response = await fetch('/api/check-stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cartItems: stockItems }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to check stock');
            }

            if (!data.isAvailable) {
                // Show stock error message
                interface UnavailableItem {
                    id: number;
                    name: string;
                    requestedQuantity: number;
                    availableStock: number;
                }

                const unavailableItemsText = data.unavailableItems.map((item: UnavailableItem) =>
                    `${item.name}. ${t('cart.stockError.requested')} ${item.requestedQuantity}, ${t('cart.stockError.available')} ${item.availableStock}`
                ).join('\n');

                setStockError(`${t('cart.stockError.insufficient')}\n${unavailableItemsText}`);
                setShowStockErrorAlert(true);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Stock check error:', error);
            setStockError(t('cart.stockError.checkFailed'));
            setShowStockErrorAlert(true);
            return false;
        } finally {
            setIsCheckingStock(false);
        }
    };

    // Handle successful payment
    const handlePaymentSuccess = (paymentIntentId: string, orderId: string) => {
        // Clear cart
        cartItems.forEach(item => removeFromCart(item.id));

        // Clear any stock errors
        setStockError(null);

        // Redirect to success page
        router.push(`/order-success?payment_intent=${paymentIntentId}&order=${orderId}`);
    };

    // Handle checkout cancel
    const handleCheckoutCancel = () => {
        setShowCheckout(false);
        setStockError(null); // Clear stock error when closing checkout
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
                <h1 className="text-3xl text-center font-bold text-gray-900 mb-8">{t("cart.title")}</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-semibold text-gray-600 mb-2">{t("cart.emptyMessage")}</h2>
                        <p className="text-gray-500 mb-6">{t("cart.continueShopping")}</p>
                        <Link
                            href="/products"
                            className="inline-block bg-almond-6 hover:bg-almond-8 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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

                                <div className="max-h-120 overflow-y-auto divide-y divide-black border-b">
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
                                                                disabled={item.quantity === 1}
                                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:bg-gray-50 disabled:text-gray-400"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center space-x-4">
                                                            <span className="text-lg font-bold text-green-600">
                                                                &yen;{item.price}
                                                            </span>
                                                            <button
                                                                onClick={() => handleRemoveClick(item.id)}
                                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
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
                                <div className="p-6">
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
                                        <span>&yen;{getSubtotal()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>{t("cart.tax")}</span>
                                        <span>&yen;{getTax()}</span>
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
                                        <span className="text-green-600">&yen;{getTotal()}</span>
                                    </div>

                                    {/* Delivery Date Picker */}
                                    <div className="mt-4">
                                        <DeliveryDatePicker
                                            selectedDate={selectedDeliveryDate}
                                            onDateSelect={setSelectedDeliveryDate}
                                            minDaysFromNow={1}
                                        />
                                    </div>

                                    {!showCheckout ? (
                                        <button
                                            onClick={async () => {
                                                if (!stripePromise) {
                                                    alert('Payment system is not available. Please check environment configuration.');
                                                    return;
                                                }

                                                // Check if delivery date is selected
                                                if (!selectedDeliveryDate) {
                                                    alert(t('delivery.pleaseSelect'));
                                                    return;
                                                }

                                                // Check stock before proceeding to checkout
                                                const stockAvailable = await checkStockBeforeCheckout();
                                                if (stockAvailable) {
                                                    setShowCheckout(true);
                                                }
                                            }}
                                            disabled={isCheckingStock || !selectedDeliveryDate}
                                            className="w-full bg-almond-6 hover:bg-almond-5 text-white p-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed!"
                                        >
                                            {isCheckingStock ? t("cart.checkingStock") : t("cart.checkout")}
                                        </button>
                                    ) : null}

                                    <Link
                                        href="/products"
                                        className="block w-full text-center border border-gray-300 hover:border-gray-500 p-3 rounded-lg font-semibold transition-colors"
                                    >
                                        {t("cart.continueShopping")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

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

            {/* Stock Error Alert Modal */}
            <AlertModal
                isOpen={showStockErrorAlert}
                onClose={() => {
                    setShowStockErrorAlert(false);
                    setStockError(null);
                }}
                title={t("cart.stockError.title")}
                message={stockError || ''}
                type="error"
                confirmText={t("cart.stockError.ok")}
                showCancel={false}
            />

            <Footer />

            {/* Checkout Modal */}
            {stripePromise && (
                <Elements stripe={stripePromise}>
                    <CheckoutModal
                        isOpen={showCheckout}
                        cartItems={cartItems}
                        totals={totals}
                        deliveryDate={selectedDeliveryDate!}
                        onSuccess={handlePaymentSuccess}
                        onClose={handleCheckoutCancel}
                    />
                </Elements>
            )}
        </div>
    );
}
