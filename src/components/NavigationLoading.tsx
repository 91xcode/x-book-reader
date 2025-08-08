'use client'

import React from 'react'
import Spinner from '@/components/ui/Spinner'

interface NavigationLoadingProps {
  isLoading: boolean
  message?: string
  description?: string
}

/**
 * 🚀 导航Loading组件
 * 用于页面切换时显示loading状态
 */
export default function NavigationLoading({ 
  isLoading, 
  message = '正在加载...', 
  description 
}: NavigationLoadingProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-lg p-8 shadow-xl max-w-sm w-full mx-4 text-center">
        <div className="mb-4">
          <Spinner loading={true} />
        </div>
        <h3 className="text-lg font-semibold mb-2">{message}</h3>
        {description && (
          <p className="text-sm text-base-content/70">{description}</p>
        )}
      </div>
    </div>
  )
}
