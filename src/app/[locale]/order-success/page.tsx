'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  const paymentIntentId = searchParams.get('payment_intent');
  const orderId = searchParams.get('order');

  useEffect(() => {
    // In a real app, you might want to fetch order details from your API
    // For now, we'll just show the IDs we have
    if (orderId) {
      // Simulate fetching order info
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {loading ? (
            <div className="space-y-4">
              <div className="text-6xl">⏳</div>
              <h1 className="text-3xl font-bold text-gray-900">Processing your order...</h1>
            </div>
          ) : paymentIntentId && orderId ? (
            <div className="space-y-6">
              {/* Success Icon */}
              <div className="text-8xl">✅</div>
              
              {/* Success Message */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-green-600">Payment Successful!</h1>
                <p className="text-xl text-gray-600">Thank you for your order!</p>
              </div>

              {/* Order Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold text-green-800 mb-4">Order Details</h2>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment ID:</span>
                    <span className="font-mono">{paymentIntentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-semibold">Paid</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">What&apos;s Next?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Order confirmation email will be sent</li>
                  <li>✓ Your order will be processed within 1-2 business days</li>
                  <li>✓ You&apos;ll receive shipping confirmation with tracking</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="bg-[#D6B884] hover:bg-[#CC8409] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue Shopping
                </Link>
                
                <Link
                  href="/mypage"
                  className="border border-gray-300 hover:border-gray-500 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Orders
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">❌</div>
              <h1 className="text-3xl font-bold text-red-600">Payment Not Found</h1>
              <p className="text-gray-600">
                We couldn&apos;t find your payment information. Please check your email for confirmation.
              </p>
              <Link
                href="/cart"
                className="inline-block bg-[#D6B884] hover:bg-[#CC8409] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Cart
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
