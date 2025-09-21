'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useTranslations, useLocale } from 'next-intl';

interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  items: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  stripePaymentIntentId: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return t('orders.statusPaid');
      case 'pending':
        return t('orders.statusPending');
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
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
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/"
            className="text-[#CC8409] hover:text-[#D6B884] mr-2"
          >
            {t('common.home')}
          </Link>
          <span className="text-gray-500 mr-2">/</span>
          <Link
            href="/mypage"
            className="text-[#CC8409] hover:text-[#D6B884] mr-2"
          >
            {t('mypage.title')}
          </Link>
          <span className="text-gray-500 mr-2">/</span>
          <span className="text-gray-700">{t('orders.title')}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('orders.title')}</h1>
            <p className="text-gray-600">{t('orders.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">{t('orders.noOrders')}</h2>
              <p className="text-gray-500 mb-6">{t('orders.noOrdersDesc')}</p>
              <Link
                href="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('orders.startShopping')}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 pb-4 border-b border-gray-100">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('orders.orderNumber')}: #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-1">¥{order.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-500 truncate">{item.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {t('orders.quantity')}: {item.quantity}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              ¥{item.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ¥{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('orders.shippingAddress')}</h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('orders.subtotal')}:</span>
                          <span>¥{order.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('orders.tax')}:</span>
                          <span>¥{order.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('orders.shipping')}:</span>
                          <span>{order.shipping === 0 ? t('orders.free') : `¥${order.shipping.toLocaleString()}`}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-1 border-t">
                          <span>{t('orders.total')}:</span>
                          <span>¥{order.total.toLocaleString()}</span>
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
    </div>
  );
}
