'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import emailjs from '@emailjs/browser';
import AlertModal from '@/components/ui/AlertModal';

interface ContactFormProps {
  currentUser: { name: string; email: string } | null;
}

export default function ContactForm({ currentUser }: ContactFormProps) {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // EmailJS Configuration
    const SERVICE_ID = 'service_pxkm2m4';
    const TEMPLATE_ID = 'template_qrgg0ag';
    const PUBLIC_KEY = '2QtkhVZdrh0jfJEBt';

    // Validate credentials are set
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || 
        SERVICE_ID.includes('YOUR_') || 
        TEMPLATE_ID.includes('YOUR_') || 
        PUBLIC_KEY.includes('YOUR_')) {
      setMessage({
        type: 'error',
        text: '❌ EmailJS is not configured. Please setup your credentials in ContactForm.tsx'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Initialize EmailJS with public key
      emailjs.init(PUBLIC_KEY);

      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || 'Not provided',
          subject: formData.subject,
          message: formData.message,
          to_name: 'Fuwari Team',
          reply_to: formData.email,
        }
      );

      if (result.status === 200 || result.text === 'OK') {
        setMessage({ 
          type: 'success', 
          text: t('successMessage')
        });
        // Reset form
        setFormData({ 
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          phone: '', 
          subject: '', 
          message: '' 
        });
      }
    } catch (error: unknown) {
      console.error('❌ EmailJS Error:', error);
      
      let errorMessage = t('errorMessage') || 'Something went wrong. Please try again.';
      
      // More detailed error messages
      if (error && typeof error === 'object' && 'text' in error) {
        errorMessage = `Error: ${(error as { text: string }).text}`;
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-almond-1/80 rounded-3xl shadow-soft p-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-md sm:text-lg font-medium mb-2">
          {t('name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmos-300 focus:border-transparent outline-none"
          placeholder={t('namePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-md sm:text-lg font-medium mb-2">
          {t('email')} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmos-300 focus:border-transparent outline-none"
          placeholder={t('emailPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-md sm:text-lg font-medium mb-2">
          {t('phone')} <span className="text-gray-400 text-xs">({t('optional')})</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmos-300 focus:border-transparent outline-none"
          placeholder={t('phonePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-md sm:text-lg font-medium mb-2">
          {t('subject')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmos-300 focus:border-transparent outline-none"
          placeholder={t('subjectPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-md sm:text-lg font-medium mb-2">
          {t('message')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmos-300 focus:border-transparent outline-none resize-y"
          placeholder={t('messagePlaceholder')}
        />
      </div>

      <AlertModal
        isOpen={!!message}
        onClose={() => setMessage(null)}
        title={message?.type === 'success' ? t('success') || 'Success' : t('error') || 'Error'}
        message={message?.text || ''}
        type={message?.type === 'success' ? 'success' : 'error'}
        confirmText={t('ok') || 'OK'}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-almond-5 text-white rounded-lg hover:bg-almond-6 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('submitting')}
          </span>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  );
}
