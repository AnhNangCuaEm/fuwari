'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/lib/hooks/useCart';
import { Session } from 'next-auth';

export default function Providers({ 
  children,
  session 
}: { 
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={true}
    >
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
