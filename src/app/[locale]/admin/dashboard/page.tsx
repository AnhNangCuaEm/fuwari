
import { auth } from "@/lib/auth"
import { getDashboardStats } from "@/lib/dashboard"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import RevenueChart from "@/components/admin/RevenueChart"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    paid:        { label: "Paid",        color: "text-emerald-700", bg: "bg-emerald-100" },
    pending:     { label: "Pending",     color: "text-yellow-700",  bg: "bg-yellow-100"  },
    processing:  { label: "Processing",  color: "text-blue-700",    bg: "bg-blue-100"    },
    shipped:     { label: "Shipped",     color: "text-purple-700",  bg: "bg-purple-100"  },
    delivered:   { label: "Delivered",   color: "text-green-700",   bg: "bg-green-100"   },
    cancelled:   { label: "Cancelled",   color: "text-red-700",     bg: "bg-red-100"     },
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: "text-gray-700", bg: "bg-gray-100" }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
        </span>
    )
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(value)
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export default async function AdminDashboard() {
    // The admin layout already guards this route via middleware + AdminLayout requireAdmin().
    // We only need the session here to display the welcome name — no extra DB call.
    const [session, stats] = await Promise.all([
        auth(),
        getDashboardStats(),
    ])
    const adminName = session?.user?.name ?? 'Admin'
    const adminEmail = session?.user?.email ?? ''
    const adminRole = session?.user?.role ?? 'admin'

    const revenueGrowth = stats.previousMonthRevenue > 0
        ? (((stats.currentMonthRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue) * 100).toFixed(1)
        : null

    return (
        <div className="space-y-6 pb-8">
            {/* ── Header ── */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-6 py-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Welcome back, <strong className="text-gray-700">{adminName}</strong> · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {stats.pendingContacts > 0 && (
                        <Link href="/admin/contacts" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{stats.pendingContacts} pending contact{stats.pendingContacts > 1 ? "s" : ""}</span>
                        </Link>
                    )}
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Healthy
                    </span>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Revenue */}
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                            {revenueGrowth !== null && (
                                <p className={`text-xs mt-1 font-medium ${parseFloat(revenueGrowth) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                    {parseFloat(revenueGrowth) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(revenueGrowth))}% vs last month
                                </p>
                            )}
                        </div>
                        <div className="p-2.5 bg-indigo-100 rounded-lg">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">This month: {formatCurrency(stats.currentMonthRevenue)}</p>
                </div>

                {/* Orders */}
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders.toLocaleString()}</p>
                            <p className="text-xs mt-1 text-blue-600 font-medium">
                                {stats.ordersByStatus.find(s => s.status === "pending")?.count ?? 0} pending
                            </p>
                        </div>
                        <div className="p-2.5 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex gap-1 mt-3 flex-wrap">
                        {stats.ordersByStatus.map(s => (
                            <StatusBadge key={s.status} status={s.status} />
                        ))}
                    </div>
                </div>

                {/* Users */}
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers.toLocaleString()}</p>
                            <p className="text-xs mt-1 text-emerald-600 font-medium">+{stats.newUsersCount} new this week</p>
                        </div>
                        <div className="p-2.5 bg-emerald-100 rounded-lg">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                    </div>
                    <Link href="/admin/users" className="inline-block text-xs text-emerald-600 hover:underline mt-3">Manage users →</Link>
                </div>

                {/* Products */}
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Products</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts.toLocaleString()}</p>
                            <p className="text-xs mt-1 text-orange-600 font-medium">
                                {stats.lowStockProducts.length > 0
                                    ? `${stats.lowStockProducts.length} low stock`
                                    : "All stock healthy"}
                            </p>
                        </div>
                        <div className="p-2.5 bg-orange-100 rounded-lg">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                    <Link href="/admin/products" className="inline-block text-xs text-orange-600 hover:underline mt-3">Manage products →</Link>
                </div>
            </div>

            {/* ── Revenue Chart + Order Status ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue bar chart (last 7 days) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800">Revenue – Last 7 Days</h2>
                        <span className="text-xs text-gray-400">Cancelled orders excluded</span>
                    </div>
                    {stats.revenueByDay.length > 0 ? (
                        <RevenueChart days={stats.revenueByDay} />
                    ) : (
                        <div className="h-32 flex items-center justify-center text-sm text-gray-400">No order data yet</div>
                    )}
                </div>

                {/* Order status breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="font-semibold text-gray-800 mb-4">Order Status</h2>
                    {stats.ordersByStatus.length > 0 ? (
                        <div className="space-y-3">
                            {stats.ordersByStatus.map(s => {
                                const pct = stats.totalOrders > 0 ? Math.round((s.count / stats.totalOrders) * 100) : 0
                                const cfg = STATUS_CONFIG[s.status] ?? { label: s.status, color: "text-gray-700", bg: "bg-gray-100" }
                                return (
                                    <div key={s.status}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                                            <span className="text-gray-500">{s.count} ({pct}%)</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No orders yet</p>
                    )}
                </div>
            </div>

            {/* ── Recent Orders + Top Products ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800">Recent Orders</h2>
                        <span className="text-xs text-gray-400">Latest 10</span>
                    </div>
                    {stats.recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                        <th className="px-6 py-3 text-left">Order ID</th>
                                        <th className="px-6 py-3 text-left">Customer</th>
                                        <th className="px-6 py-3 text-left">Date</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats.recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 font-mono text-xs text-gray-500">
                                                #{order.id.slice(0, 8)}
                                            </td>
                                            <td className="px-6 py-3 text-gray-700 max-w-[160px] truncate">
                                                {order.customerEmail}
                                            </td>
                                            <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <StatusBadge status={order.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="px-6 py-8 text-sm text-gray-400 text-center">No orders yet</p>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800">Top Products</h2>
                        <span className="text-xs text-gray-400">By units sold</span>
                    </div>
                    {stats.topProducts.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {stats.topProducts.map((p, i) => (
                                <div key={p.engName} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <span className="text-xs font-bold text-gray-300 w-4 shrink-0">#{i + 1}</span>
                                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        <Image
                                            src={p.image}
                                            alt={p.engName}
                                            width={36}
                                            height={36}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                                        <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                                    </div>
                                    <p className="text-sm font-semibold text-indigo-600 whitespace-nowrap">{formatCurrency(p.revenue)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="px-6 py-8 text-sm text-gray-400 text-center">No sales data yet</p>
                    )}
                </div>
            </div>

            {/* ── Low Stock + Quick Links ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Low Stock Warning */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="font-semibold text-gray-800">Low Stock Alert</h2>
                        <span className="ml-auto text-xs text-gray-400">≤ 5 items remaining</span>
                    </div>
                    {stats.lowStockProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
                            {stats.lowStockProducts.map(p => (
                                <div key={p.id} className="flex flex-col items-center text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white mb-2">
                                        <Image
                                            src={p.image}
                                            alt={p.engName}
                                            width={48}
                                            height={48}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 leading-tight truncate w-full">{p.name}</p>
                                    <span className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${p.quantity === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                                        {p.quantity === 0 ? "Out of stock" : `${p.quantity} left`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-6 py-8 text-sm text-emerald-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            All products have sufficient stock
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="font-semibold text-gray-800 mb-4">Quick Links</h2>
                    <div className="space-y-2">
                        <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors group">
                            <div className="p-1.5 bg-indigo-100 group-hover:bg-indigo-200 rounded-md transition-colors">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">User Management</span>
                        </Link>
                        <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors group">
                            <div className="p-1.5 bg-blue-100 group-hover:bg-blue-200 rounded-md transition-colors">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">Product Management</span>
                        </Link>
                        <Link href="/admin/contacts" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors group">
                            <div className="p-1.5 bg-amber-100 group-hover:bg-amber-200 rounded-md transition-colors">
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex items-center justify-between flex-1">
                                <span className="text-sm font-medium">Contact Messages</span>
                                {stats.pendingContacts > 0 && (
                                    <span className="text-xs font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">{stats.pendingContacts}</span>
                                )}
                            </div>
                        </Link>
                        <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors group">
                            <div className="p-1.5 bg-gray-100 group-hover:bg-gray-200 rounded-md transition-colors">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">Settings</span>
                        </Link>
                    </div>

                    {/* Admin info */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{adminName}</p>
                        <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">{adminRole}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
