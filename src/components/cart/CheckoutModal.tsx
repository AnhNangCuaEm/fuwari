'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useSession } from 'next-auth/react';
import { CartItem, OrderTotals, ShippingAddress } from '@/types/order';
import { useTranslations } from 'next-intl';

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  totals: OrderTotals;
  deliveryDate: Date;
  onSuccess: (paymentIntentId: string, orderId: string) => void;
  onClose: () => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

export default function CheckoutModal({ isOpen, cartItems, totals, deliveryDate, onSuccess, onClose }: CheckoutModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'JP',
  });

  // Load user profile data when modal opens
  useEffect(() => {
    if (isOpen && session?.user) {
      const loadUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setCustomerInfo(prev => ({
              ...prev,
              fullName: data.user.name || session.user?.name || '',
              email: data.user.email || session.user?.email || '',
              phone: data.user.phone || '',
              address: data.user.address || '',
              city: data.user.city || '',
              postalCode: data.user.postalCode || '',
            }));
          } else {
            // Fallback to session data
            setCustomerInfo(prev => ({
              ...prev,
              fullName: session.user?.name || '',
              email: session.user?.email || '',
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to session data
          setCustomerInfo(prev => ({
            ...prev,
            fullName: session.user?.name || '',
            email: session.user?.email || '',
          }));
        }
      };

      loadUserProfile();
    }
  }, [isOpen, session]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!customerInfo.fullName || !customerInfo.email || !customerInfo.address || !customerInfo.city) {
        throw new Error('Please fill in all required fields');
      }

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totals.total,
          items: cartItems,
          customerInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: customerInfo.fullName,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              postal_code: customerInfo.postalCode,
              country: customerInfo.country,
            },
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      // Payment succeeded - create order
      const confirmResponse = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          cartItems,
          customerInfo,
          totals,
          deliveryDate: deliveryDate.toISOString(),
        }),
      });

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok) {
        throw new Error(confirmData.error || 'Failed to create order');
      }

      // Success!

      // Auto-save shipping info to profile if user wants
      try {
        if (session?.user) {
          const shouldUpdateProfile = customerInfo.fullName !== session.user.name ||
            customerInfo.phone !== '' ||
            customerInfo.address !== '' ||
            customerInfo.city !== '' ||
            customerInfo.postalCode !== '';

          if (shouldUpdateProfile) {
            await fetch('/api/user/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: customerInfo.fullName,
                phone: customerInfo.phone,
                address: customerInfo.address,
                city: customerInfo.city,
                postalCode: customerInfo.postalCode,
              }),
            });
          }
        }
      } catch (error) {
        console.log('Could not update profile:', error);
      }

      onSuccess(paymentIntentId, confirmData.orderId);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#030303b7] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-semibold">{t('payment.title')}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">{t('payment.orderSummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('payment.items')} ({cartItems.length}):</span>
                <span>¥{totals.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('payment.tax')}:</span>
                <span>¥{totals.tax}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('payment.shipping')}:</span>
                <span>{totals.shipping === 0 ? t('payment.free') : `¥${totals.shipping}`}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>{t('payment.total')}:</span>
                <span className="text-green-600">¥{totals.total}</span>
              </div>
              {/* Delivery Date Display */}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('delivery.deliveryDate')}:</span>
                  <span className="text-[#8B7355] font-semibold">
                    {deliveryDate.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium mb-3">{t('payment.shippingInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.fullName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6B884] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6B884] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6B884] focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.postalCode')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6B884] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.city')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-almond-6 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.address')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-almond-6 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">{t('payment.paymentInfo')}</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('payment.cardInfo')} *
              </label>
              <div className="p-3 border border-gray-300 rounded-lg">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            {/* Test Cards Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-800 mb-2">🧪 Test Cards (Development Mode):</p>
              <div className="text-sm text-blue-700 space-y-1">
                <p><span className="font-mono">4242424242424242</span> - ✅ Successful payment</p>
                <p><span className="font-mono">4000000000000002</span> - ❌ Declined card</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                <strong>{t('payment.orderError')}:</strong> {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 border border-gray-300 hover:border-gray-500 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {t('payment.cancel')}
              </button>
              <button
                type="submit"
                disabled={!stripe || loading}
                className="flex-1 bg-almond-6 hover:bg-almond-5 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('payment.processing')}
                  </span>
                ) : (
                  `${t('payment.placeOrder')} ¥${totals.total}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
