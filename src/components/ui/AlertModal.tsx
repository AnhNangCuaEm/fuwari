'use client'

import { useEffect } from 'react'

interface AlertModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string
    type?: 'info' | 'warning' | 'error' | 'success'
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    showCancel?: boolean
}

export default function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    showCancel = false
}: AlertModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return 'border-red-500 bg-red-50'
            case 'warning':
                return 'border-yellow-500 bg-yellow-50'
            case 'success':
                return 'border-green-500 bg-green-50'
            default:
                return 'border-blue-500 bg-blue-50'
        }
    }

    const getIconColor = () => {
        switch (type) {
            case 'error':
                return 'text-red-600'
            case 'warning':
                return 'text-yellow-600'
            case 'success':
                return 'text-green-600'
            default:
                return 'text-blue-600'
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
            <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border-l-4 ${getTypeStyles()}`}>
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className={`mr-3 ${getIconColor()}`}>
                            {type === 'error' && '⚠️'}
                            {type === 'warning' && '⚠️'}
                            {type === 'success' && '✅'}
                            {type === 'info' && 'ℹ️'}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    
                    <p className="text-gray-700 mb-6">{message}</p>
                    
                    <div className="flex justify-end space-x-3">
                        {showCancel && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onConfirm?.()
                                onClose()
                            }}
                            className="px-4 py-2 bg-almond-6 text-white rounded-lg hover:bg-almond-5 transition-colors cursor-pointer"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}