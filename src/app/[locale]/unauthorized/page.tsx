import { Link } from "@/i18n/navigation"

export default function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                    アクセス権限はありません
                </h1>
                <p className="text-gray-600 mb-6">
                    このページにアクセスする権限がありません。管理者のみがこのエリアにアクセスできます。
                </p>
                <Link
                    href="/"
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                    ホームに戻る
                </Link>
            </div>
        </div>
    )
}
