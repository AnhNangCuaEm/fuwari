'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useTranslations, useLocale } from 'next-intl';
import type { Order } from '@/types/order';

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

    const handleCopyOrderId = async (orderId: string) => {
        try {
            await navigator.clipboard.writeText(orderId);
            setCopiedOrderId(orderId);
            setTimeout(() => {
                setCopiedOrderId(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/signin');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/user/orders');
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data.orders);
                } else {
                    setError('Failed to fetch orders');
                }
            } catch (err) {
                setError('Error loading orders');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [session, status, router]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-almond-2 text-almond-9';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-teal-100 text-teal-800';
            case 'cancelled':
                return 'bg-cosmos-100 text-cosmos-800';
            default:
                return 'bg-almond-2 text-almond-8';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return t('orders.statusPaid');
            case 'pending':
                return t('orders.statusPending');
            case 'processing':
                return t('orders.statusProcessing');
            case 'shipped':
                return t('orders.statusShipped');
            case 'delivered':
                return t('orders.statusDelivered');
            case 'cancelled':
                return t('orders.statusCancelled');
            default:
                return status;
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-almond-5 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="container max-w-7xl mx-auto px-4 pt-32 pb-16 flex-1">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        href="/"
                        className="text-almond-6 hover:text-almond-8 mr-2"
                    >
                        {t('common.home')}
                    </Link>
                    <span className="text-almond-5 mr-2">/</span>
                    <Link
                        href="/mypage"
                        className="text-almond-6 hover:text-almond-8 mr-2"
                    >
                        {t('mypage.title')}
                    </Link>
                    <span className="text-almond-5 mr-2">/</span>
                    <span className="text-almond-8">{t('orders.title')}</span>
                </nav>

                <div className="bg-almond-1 rounded-lg shadow-lg p-8">
                    <div className="flex justify-between mb-8 flex-col gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-almond-11 mb-2">{t('orders.title')}</h1>
                            <p className="text-almond-7">{t('orders.subtitle')}</p>
                            <p className="text-almond-7">{t('orders.subtitle2')}</p>
                        </div>
                        <Link
                            href="/contact"
                            className="flex items-center h-fit gap-1 text-xs sm:text-base px-3 py-3 sm:px-4 sm:py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                        >
                            <svg width="20px" height="20px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>support</title> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="support" fill="#000000" transform="translate(42.666667, 42.666667)"> <path d="M379.734355,174.506667 C373.121022,106.666667 333.014355,-2.13162821e-14 209.067688,-2.13162821e-14 C85.1210217,-2.13162821e-14 45.014355,106.666667 38.4010217,174.506667 C15.2012632,183.311569 -0.101643453,205.585799 0.000508304259,230.4 L0.000508304259,260.266667 C0.000508304259,293.256475 26.7445463,320 59.734355,320 C92.7241638,320 119.467688,293.256475 119.467688,260.266667 L119.467688,230.4 C119.360431,206.121456 104.619564,184.304973 82.134355,175.146667 C86.4010217,135.893333 107.307688,42.6666667 209.067688,42.6666667 C310.827688,42.6666667 331.521022,135.893333 335.787688,175.146667 C313.347976,184.324806 298.68156,206.155851 298.667688,230.4 L298.667688,260.266667 C298.760356,283.199651 311.928618,304.070103 332.587688,314.026667 C323.627688,330.88 300.801022,353.706667 244.694355,360.533333 C233.478863,343.50282 211.780225,336.789048 192.906491,344.509658 C174.032757,352.230268 163.260418,372.226826 167.196286,392.235189 C171.132153,412.243552 188.675885,426.666667 209.067688,426.666667 C225.181549,426.577424 239.870491,417.417465 247.041022,402.986667 C338.561022,392.533333 367.787688,345.386667 376.961022,317.653333 C401.778455,309.61433 418.468885,286.351502 418.134355,260.266667 L418.134355,230.4 C418.23702,205.585799 402.934114,183.311569 379.734355,174.506667 Z M76.8010217,260.266667 C76.8010217,269.692326 69.1600148,277.333333 59.734355,277.333333 C50.3086953,277.333333 42.6676884,269.692326 42.6676884,260.266667 L42.6676884,230.4 C42.6676884,224.302667 45.9205765,218.668499 51.2010216,215.619833 C56.4814667,212.571166 62.9872434,212.571166 68.2676885,215.619833 C73.5481336,218.668499 76.8010217,224.302667 76.8010217,230.4 L76.8010217,260.266667 Z M341.334355,230.4 C341.334355,220.97434 348.975362,213.333333 358.401022,213.333333 C367.826681,213.333333 375.467688,220.97434 375.467688,230.4 L375.467688,260.266667 C375.467688,269.692326 367.826681,277.333333 358.401022,277.333333 C348.975362,277.333333 341.334355,269.692326 341.334355,260.266667 L341.334355,230.4 Z"> </path> </g> </g> </g></svg>
                            {t('contact.contactSupport')}
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                            {error}
                        </div>
                    )}

                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📦</div>
                            <h2 className="text-2xl font-semibold text-almond-8 mb-2">{t('orders.noOrders')}</h2>
                            <p className="text-almond-6 mb-6">{t('orders.noOrdersDesc')}</p>
                            <Link
                                href="/products"
                                className="bg-almond-5 hover:bg-almond-6 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                {t('orders.startShopping')}
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="border border-gray-200 rounded-lg p-6 shadow-md">
                                    {/* Order Header */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 pb-4 border-b border-gray-100">
                                        <div className="mb-2 sm:mb-0">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {t('orders.orderNumber')}: <span className='text-cosmos-400'>#{order.id.slice(-8).toUpperCase()}</span>
                                                </h3>
                                                <button
                                                    onClick={() => handleCopyOrderId(order.id)}
                                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                                    title={t('orders.copyOrderNumber')}
                                                >
                                                    {copiedOrderId === order.id ? (
                                                        <svg
                                                            className="w-5 h-5 text-green-600 animate-scale-check"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    ) : (
                                                        <svg
                                                            className="w-5 h-5 text-gray-600 animate-fade-in"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="flex flex-col sm:items-end">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                            <p className="text-lg font-bold text-gray-900 mt-1">&yen;{order.total.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center space-x-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-almond-1 flex-shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-almond-11 truncate">{item.name}</h4>
                                                    <p className="text-sm text-almond-6 truncate">{item.description}</p>
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <span className="text-sm text-almond-7">
                                                            {t('orders.quantity')}: {item.quantity}
                                                        </span>
                                                        <span className="text-sm font-medium text-almond-9">
                                                            &yen;{item.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-almond-9">
                                                        &yen;{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className='flex justify-between flex-col mt-4 pt-4 border-t border-gray-200 gap-4 md:flex-row md:items-center'>
                                        {/* Shipping Info */}
                                        <div>
                                            <h4 className="text-sm font-medium text-almond-10 mb-2">{t('orders.shippingAddress')}</h4>
                                            <div className="text-sm text-almond-7">
                                                <p>{order.shippingAddress.fullName}</p>
                                                <p>{order.shippingAddress.address}</p>
                                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                                <p>{order.shippingAddress.phone}</p>
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div>
                                            <div className="flex justify-end">
                                                <div className="w-64 space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-almond-7">{t('orders.subtotal')}:</span>
                                                        <span className="text-almond-9">&yen;{order.subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-almond-7">{t('orders.tax')}:</span>
                                                        <span className="text-almond-9">&yen;{order.tax.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-almond-7">{t('orders.shipping')}:</span>
                                                        <span className="text-almond-9">{order.shipping === 0 ? t('orders.free') : `&yen;${order.shipping.toLocaleString()}`}</span>
                                                    </div>
                                                    <div className="flex justify-between font-semibold text-base pt-1 border-t border-almond-3">
                                                        <span className="text-almond-10">{t('orders.total')}:</span>
                                                        <span className="text-cosmos-500">&yen;{order.total.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            <style jsx global>{`
                @keyframes scale-check {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                
                .animate-scale-check {
                    animation: scale-check 0.3s ease-in-out;
                }

                @keyframes fade-in {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
                    
                .animate-fade-in {
                    animation: fade-in 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}