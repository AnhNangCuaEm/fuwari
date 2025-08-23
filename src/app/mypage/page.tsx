'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';

export default function Mypage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/auth/signin');
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            マイページ
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-gray-700">
                こんにちは、{session.user?.name || session.user?.email}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ログアウト
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">アカウントを情報</h3>
              <p className="text-blue-700">Email: {session.user?.email}</p>
              <p className="text-blue-700">名前: {session.user?.name}</p>
              <p className="text-blue-700">ID: {session.user?.id}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">ログイン成功!</h3>
              <p className="text-green-700">
                あなたは成功裏にFuwari Sweet Shopにログインしました。
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">今後の機能</h3>
              <p className="text-purple-700">
                商品管理、注文管理、その他の多くの機能が追加される予定です。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
