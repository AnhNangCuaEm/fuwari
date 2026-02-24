"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

interface DayData {
    date: string
    revenue: number
    orders: number
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(value)
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: DayData }[] }) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl space-y-1">
            <p className="font-semibold text-gray-200">
                {new Date(d.date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
            </p>
            <p className="text-indigo-300 font-bold text-sm">{formatCurrency(d.revenue)}</p>
            <p className="text-gray-400">{d.orders} order{d.orders !== 1 ? "s" : ""}</p>
        </div>
    )
}

function formatYAxis(value: number) {
    if (value >= 1_000_000) return `¥${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `¥${(value / 1_000).toFixed(0)}K`
    return `¥${value}`
}

export default function RevenueChart({ days }: { days: DayData[] }) {
    // Pad to 7 days if fewer
    const data = days.map(d => ({
        ...d,
        label: new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    }))

    return (
        <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
