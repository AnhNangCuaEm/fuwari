'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import AlertModal from '@/components/ui/AlertModal';
import { ContactMessage } from '@/types/contact';

interface ContactFormProps {
  currentUser: { name: string; email: string } | null;
  previousMessages?: ContactMessage[];
}

export default function ContactForm({ currentUser, previousMessages = [] }: ContactFormProps) {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', text: t('successMessage') });
        setFormData({
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        setAlert({ type: 'error', text: data.message || t('errorMessage') });
      }
    } catch {
      setAlert({ type: 'error', text: t('errorMessage') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Previous messages with replies */}
      {previousMessages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">{t('yourPreviousMessages')}</h2>
          {previousMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white/90 rounded-2xl shadow-soft border border-gray-100 overflow-hidden"
            >
              {/* User message */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{msg.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      msg.status === 'replied'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {msg.status === 'replied' ? (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {t('replied')}
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {t('pending')}
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{msg.message}</p>
                {msg.phone && (
                  <p className="text-xs text-gray-400 mt-2">📞 {msg.phone}</p>
                )}
              </div>

              {/* Admin reply */}
              {msg.admin_reply && (
                <div className="bg-cosmos-50 border-t border-cosmos-100 px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-cosmos-400 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-cosmos-700">{t('replyFromTeam')}</span>
                    {msg.replied_at && (
                      <span className="text-xs text-cosmos-500 ml-auto">
                        {new Date(msg.replied_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cosmos-800 whitespace-pre-wrap pl-8">{msg.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact form */}
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
          isOpen={!!alert}
          onClose={() => setAlert(null)}
          title={alert?.type === 'success' ? t('success') : t('error')}
          message={alert?.text || ''}
          type={alert?.type === 'success' ? 'success' : 'error'}
          confirmText={t('ok')}
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
    </div>
  );
}
