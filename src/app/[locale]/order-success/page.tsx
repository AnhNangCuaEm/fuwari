'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

interface OrderItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

interface OrderDetails {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
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
}

export default function OrderSuccessPage() {  
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null);

  const paymentIntentId = searchParams.get('payment_intent');
  const rawOrderId = searchParams.get('order');
  // If orderId is actually a paymentIntentId (pending case fallback), treat it as undefined
  const orderId = rawOrderId && !rawOrderId.startsWith('pi_') ? rawOrderId : null;
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Case 1: We have a real orderId — look up directly from user orders
        if (orderId) {
          const response = await fetch('/api/user/orders');
          if (response.ok) {
            const data = await response.json();
            const order = data.orders.find((o: OrderDetails) => o.id === orderId);
            if (order) {
              setOrderDetails(order);
              setResolvedOrderId(order.id);
              return;
            }
          }
        }

        // Case 2: No orderId or not found — try to resolve via paymentIntentId
        if (paymentIntentId) {
          // Poll confirm-payment to get the orderId once webhook has processed it
          for (let attempt = 0; attempt < 5; attempt++) {
            const res = await fetch('/api/confirm-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentIntentId }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.orderId) {
                setResolvedOrderId(data.orderId);
                // Now fetch the actual order details
                const ordersRes = await fetch('/api/user/orders');
                if (ordersRes.ok) {
                  const ordersData = await ordersRes.json();
                  const order = ordersData.orders.find((o: OrderDetails) => o.id === data.orderId);
                  if (order) setOrderDetails(order);
                }
                return;
              }
            }
            // Wait 2s before retrying
            if (attempt < 4) await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, paymentIntentId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center">
          {loading ? (
            <div className="space-y-4">
                <svg className="w-16 h-16 mx-auto text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              <h1 className="text-3xl font-bold text-gray-900">{t('payment.processing')}</h1>
            </div>
          ) : paymentIntentId ? (
            <div className="space-y-8">
              {/* Success section */}
              <div className="text-center space-y-4">
                <div className="text-8xl">
                  <svg className="w-20 h-20 mx-auto text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-green-600">{t('payment.orderSuccess')}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('payment.orderSuccessMsg')}</p>
              </div>

              {/* Order details - wider but still centered */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold text-green-800 mb-4">{t('payment.orderDetails')}</h2>
                
                {/* Order Info */}
                <div className="space-y-2 text-sm text-green-700 mb-4">
                  <div className="flex justify-between">
                    <span>{t('payment.orderId')}:</span>
                    <span className="font-mono">
                      {resolvedOrderId
                        ? `#${resolvedOrderId.slice(-8).toUpperCase()}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('payment.date')}:</span>
                    <span>{new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('payment.status')}:</span>
                    <span className="font-semibold">{t('payment.paid')}</span>
                  </div>
                </div>

                {/* Order Items */}
                {orderDetails && orderDetails.items && (
                  <div className="border-t border-green-200 pt-4">
                    <h3 className="text-sm font-semibold text-green-800 mb-3">{t('payment.items')}:</h3>
                    <div className="space-y-3">
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-500">¥{item.price.toLocaleString()} × {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ¥{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Total */}
                    <div className="mt-4 pt-3 border-t border-green-200">
                      <div className="flex justify-between text-sm">
                        <span>{t('payment.subtotal')}:</span>
                        <span>¥{orderDetails.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('payment.tax')}:</span>
                        <span>¥{orderDetails.tax?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('payment.shipping')}:</span>
                        <span>{orderDetails.shipping === 0 ? t('payment.free') : `¥${orderDetails.shipping?.toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-green-300">
                        <span>{t('payment.total')}:</span>
                        <span className="text-green-800">¥{orderDetails.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link
                  href="/products"
                  className="bg-[#D6B884] hover:bg-[#CC8409] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {t('cart.continueShopping')}
                </Link>
                
                <Link
                  href="/orders"
                  className="border border-gray-300 hover:border-gray-500 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {t('payment.viewOrder')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">❌</div>
              <h1 className="text-3xl font-bold text-red-600">{t('payment.paymentNotfound')}</h1>
              <p className="text-gray-600">
                {t('payment.paymentNFMsg')}
              </p>
              <Link
                href="/cart"
                className="inline-block bg-[#D6B884] hover:bg-[#CC8409] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('payment.backToCart')}
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
