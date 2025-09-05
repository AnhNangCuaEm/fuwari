'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User } from '@/types/user'

interface UserManagerModalProps {
    user: User | null
    isOpen: boolean
    onClose: () => void
    onUserUpdate: (updatedUser: User) => void
}

export default function UserManagerModal({ user, isOpen, onClose, onUserUpdate }: UserManagerModalProps) {
    const [loading, setLoading] = useState(false)

    if (!isOpen || !user) return null

    const handleBanUser = async () => {
        if (!confirm('このユーザーをBanしますか？')) return

        try {
            setLoading(true)
            const response = await fetch(`/api/admin/users/${user.id}/ban`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: user.status === 'banned' ? 'active' : 'banned'
                })
            })

            if (response.ok) {
                const updatedUser = { ...user, status: user.status === 'banned' ? 'active' as const : 'banned' as const }
                onUserUpdate(updatedUser)
                onClose()
            } else {
                alert('操作に失敗しました')
            }
        } catch (error) {
            console.error('Error banning user:', error)
            alert('操作に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async () => {
        if (!confirm('このユーザーの権限を変更しますか？')) return

        try {
            setLoading(true)
            const response = await fetch(`/api/admin/users/${user.id}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: user.role === 'admin' ? 'user' : 'admin'
                })
            })

            if (response.ok) {
                const updatedUser = { ...user, role: user.role === 'admin' ? 'user' as const : 'admin' as const }
                onUserUpdate(updatedUser)
                onClose()
            } else {
                alert('操作に失敗しました')
            }
        } catch (error) {
            console.error('Error changing user role:', error)
            alert('操作に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-[#00000085] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">ユーザー詳細</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                            disabled={loading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center mb-6">
                        {user.image && (
                            <Image
                                src={user.image}
                                alt={user.name}
                                width={80}
                                height={80}
                                className="w-20 h-20 rounded-full mr-4"
                            />
                        )}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className='p-2 bg-gray-50 rounded-lg'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ユーザーID</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded break-all">{user.id}</p>
                        </div>

                        <div className='p-2 bg-gray-50 rounded-lg'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                            {user.phone && user.phone.trim() ? (
                                <p className="text-sm text-gray-900">{user.phone}</p>
                            ) : (
                                <p className="text-sm text-gray-500">Not available</p>
                            )}
                        </div>

                        <div className='p-2 bg-gray-50 rounded-lg'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                            {user.address && user.address.trim() ? (
                                <p className="text-sm text-gray-900">{user.address}</p>
                            ) : (
                                <p className="text-sm text-gray-500">Not available</p>
                            )}
                        </div>

                        <div className='p-2 bg-gray-50 rounded-lg'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">権限</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                {user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                        </div>

                        <div className='p-2 bg-gray-50 rounded-lg'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'banned'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                {user.status === 'banned' ? 'Banned' : 'Active'}
                            </span>
                        </div>

                        <div className='p-2 bg-gray-50 rounded-lg'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.provider === 'google'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                {user.provider}
                            </span>
                        </div>

                        <div className='p-2 bg-gray-50 rounded-lgd'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">作成日</label>
                            <p className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleString('ja-JP')}</p>
                        </div>

                        <div className='p-2 bg-gray-50 rounded-lg'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">更新日</label>
                            <p className="text-sm text-gray-900">{new Date(user.updatedAt).toLocaleString('ja-JP')}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-between">
                    <div className="flex space-x-3">
                        <button
                            onClick={handleRoleChange}
                            disabled={loading}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 hover:cursor-pointer disabled:bg-gray-400 text-sm"
                        >
                            {loading ? '処理中...' : user.role === 'admin' ? 'Userに変更' : 'Adminに変更'}
                        </button>

                        <button
                            onClick={handleBanUser}
                            disabled={loading}
                            className={`px-4 py-2 text-white rounded text-sm hover:cursor-pointer disabled:bg-gray-400 ${user.status === 'banned'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {loading ? '処理中...' : user.status === 'banned' ? '停止解除' : 'アカウントを停止'}
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 hover:cursor-pointer disabled:bg-gray-400 text-sm"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    )
}
