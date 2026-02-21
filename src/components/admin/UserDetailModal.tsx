'use client'

import Image from 'next/image'
import AdminModal from '@/components/admin/AdminModal'
import { User } from '@/types/user'

interface UserDetailModalProps {
    user: User | null
    isOpen: boolean
    onClose: () => void
}

/* ── helpers ── */
const RoleBadge = ({ role }: { role: User['role'] }) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            role === 'admin'
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
        }`}
    >
        {role === 'admin' ? 'Admin' : 'User'}
    </span>
)

const StatusBadge = ({ status }: { status: User['status'] }) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            status === 'banned'
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
        }`}
    >
        {status === 'banned' ? 'Banned' : 'Active'}
    </span>
)

const ProviderBadge = ({ provider }: { provider: User['provider'] }) => (
    <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            provider === 'google'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
        }`}
    >
        {provider === 'google' && (
            /* Google "G" mini icon */
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
        )}
        {provider}
    </span>
)

interface InfoRowProps {
    label: string
    value?: string | null
    children?: React.ReactNode
}

const InfoRow = ({ label, value, children }: InfoRowProps) => (
    <div className="flex flex-col gap-0.5 p-3 bg-gray-50 rounded-xl">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
        </span>
        {children ?? (
            <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                {value || 'N/A'}
            </span>
        )}
    </div>
)

export default function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
    if (!user) return null

    const initials = user.name
        ? user.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : '?'

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="User Detail"
            subtitle={`ID: ${user.id}`}
            maxWidth="max-w-2xl"
            footer={
                <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                    Close
                </button>
            }
        >
            {/* Avatar + name block */}
            <div className="flex items-center gap-4 mb-6">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.name}
                        width={72}
                        height={72}
                        className="w-18 h-18 rounded-full object-cover ring-2 ring-gray-200"
                    />
                ) : (
                    <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {initials}
                    </div>
                )}
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <RoleBadge role={user.role} />
                        <StatusBadge status={user.status} />
                        <ProviderBadge provider={user.provider} />
                    </div>
                </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="Phone" value={user.phone} />
                <InfoRow label="City" value={user.city} />
                <InfoRow label="Postal Code" value={user.postalCode} />
                <InfoRow label="Address" value={user.address} />
                <InfoRow
                    label="Created At"
                    value={new Date(user.createdAt).toLocaleString('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                />
                <InfoRow
                    label="Updated At"
                    value={new Date(user.updatedAt).toLocaleString('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                />
            </div>
        </AdminModal>
    )
}
