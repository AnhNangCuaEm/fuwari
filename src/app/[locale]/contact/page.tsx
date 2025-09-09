import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ConditionalAuthContent } from "@/components/auth/AuthGuards";
import { getCurrentUser } from "@/lib/auth-utils";
import Link from "next/link";

export default async function ContactPage() {
    const currentUser = await getCurrentUser();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 flex-1">
                <div className="max-w-2xl w-full text-center">
                    <h1 className="text-4xl font-bold mb-6">Contact Page</h1>

                    {/* Show different content based on auth status */}
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        {currentUser ? (
                            <div>
                                <p className="text-green-600 mb-4">
                                    こんにちは！<strong>{currentUser.name}</strong>!
                                    あなたは<strong>{currentUser.role}</strong>としてログインしています。
                                </p>

                                {currentUser.role === 'admin' && (
                                    <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                                        <p className="text-red-700">
                                            🔧 Adminモード: 特別な情報を表示できます。
                                        </p>
                                    </div>
                                )}

                                <p className="text-gray-600">
                                    あなたがログインしているので、パーソナライズされたサポートを提供できます。
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600 mb-4">
                                    あなたはまだログインしていません。最適なサポートを受けるには、まずログインしてください。
                                </p>
                                <Link
                                    href="/auth/signin"
                                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    今すぐログイン
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Show content only for logged-in users */}
                    <ConditionalAuthContent
                        requireAuth={true}
                        fallback={
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-yellow-700">
                                    一部の特別な機能は、ログインすると表示されます。
                                </p>
                            </div>
                        }
                    >
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                            <h3 className="font-semibold text-green-800 mb-2">
                                会員専用コンテンツ
                            </h3>
                            <p className="text-green-700">
                                これはログインしたユーザー専用の特別なコンテンツです！
                            </p>
                        </div>
                    </ConditionalAuthContent>

                    {/* Show content only for admins */}
                    <ConditionalAuthContent
                        adminOnly={true}
                        fallback={null}
                    >
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                            <h3 className="font-semibold text-red-800 mb-2">
                                Adminコンテンツ
                            </h3>
                            <p className="text-red-700">
                                この部分は管理者のみが見ることができます！
                            </p>
                        </div>
                    </ConditionalAuthContent>
                </div>
            </div>
            <Footer />
        </div>
    );
}