'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User } from '@/types/user'

interface UsersResponse {
  users: User[]
  count: number
  message: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ユーザー管理
        </h1>
        <div className="text-sm text-gray-600">
          合計: {users.length} ユーザー
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                名前
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                権限
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Provider
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                作成日
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    {user.image && (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    )}
                    <span className="font-medium text-gray-900">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.provider === 'google' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.provider}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            ユーザーがいません
          </div>
        </div>
      )}
    </div>
  )
}
