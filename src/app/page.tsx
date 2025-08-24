'use client';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-16 flex-1">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            🍰 Fuwari Sweet Shop 🍰
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            スイーツショップへようこそ！
          </p>
        </header>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          {status === 'loading' ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">ローディング...</p>
            </div>
          ) : session ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                こんにちは、{session.user?.name || session.user?.email}! 👋
              </h2>
              <p className="text-gray-600 mb-6">
                あなたは成功裏にログインしました。私たちのショップを探索してください！
              </p>
              <Link
                href="/mypage"
                className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
              >
                マイページへ
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                ログインまたはサインアップしてください 🎉
              </h2>

              <div className="space-y-3">
                <Link
                  href="/auth/signin"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ログイン
                </Link>

                <Link
                  href="/auth/signup"
                  className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  アカウントを作成
                </Link>
              </div>

            </div>
          )}
        </div>


        <div className="flex flex-col items-center">
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">🧁</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cupcake</h3>
              <p className="text-gray-600">Cupcakes with various flavors and toppings</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">🍰</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cream cake</h3>
              <p className="text-gray-600">Delicious fresh cream cakes for special occasions in life</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">🍪</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookie</h3>
              <p className="text-gray-600">Crispy and delicious cookies made from natural ingredients</p>
            </div>
          </div>
          <Link
            href="/products"
            className="btn mt-4"
          >
            商品一覧へ
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
