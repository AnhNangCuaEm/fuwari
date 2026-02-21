'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User } from '@/types/user'
import UserDetailModal from '@/components/admin/UserDetailModal'

interface UsersResponse {
  users: User[]
  count: number
  message: string
}

/* ── inline badge helpers ── */
const RoleBadge = ({ role }: { role: User['role'] }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
    role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
  }`}>
    {role === 'admin' ? 'Admin' : 'User'}
  </span>
)

const StatusBadge = ({ status }: { status: User['status'] }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
    status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
  }`}>
    {status === 'banned' ? 'Banned' : 'Active'}
  </span>
)

const ProviderBadge = ({ provider }: { provider: User['provider'] }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
    provider === 'google' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
  }`}>
    {provider}
  </span>
)

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/users')
      const data: UsersResponse = await response.json()

      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.message || 'Failed to fetch users')
      }
    } catch {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const openDetail = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const closeDetail = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-indigo-600" />
        </div>
      </div>
    )
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4 text-sm">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  /* ── Main table ── */
  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {users.length} {users.length === 1 ? 'user' : 'users'} total
            </p>
          </div>
          <button
            onClick={fetchUsers}
            title="Refresh"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const initials = user.name
                  ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
                  : '?'

                return (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* User column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="px-6 py-4">
                      <ProviderBadge provider={user.provider} />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetail(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {users.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No users found.
          </div>
        )}
      </div>

      {/* Detail modal — read-only */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeDetail}
      />
    </>
  )
}
