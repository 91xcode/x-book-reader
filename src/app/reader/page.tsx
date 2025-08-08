'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { generateBookKey } from '@/utils/bookKey'
import Spinner from '@/components/ui/Spinner'
import ReaderContent from './components/ReaderContent'
import ErrorBoundary from './components/ErrorBoundary'
import { useSettingsStore } from '@/store/settingsStore'
import { useReaderStore } from '@/store/readerStore'
import { useBookDataStore } from '@/store/bookDataStore'

/**
 * 🎯 Reader页面 - bookKey统一管理中心
 * 
 * 架构原则：
 * 1. 在此处集中生成和管理bookKey
 * 2. bookKey格式: ${bookHash}-${uniqueId()}
 * 3. 所有子组件通过props接收bookKey，不自行生成
 * 4. 使用useRef确保bookKey的稳定性，避免重新生成
 */
export default function ReaderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookId = searchParams?.get('ids') || ''
  
  const { initViewState, getViewState, setBookKeys } = useReaderStore()
  const { getBookData } = useBookDataStore()
  const { fontLayoutSettingsDialogOpen, setFontLayoutSettingsDialogOpen } = useSettingsStore()
  
  const [bookKey, setBookKey] = useState<string>('')
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  // 🎯 智能加载指示器：延迟显示避免闪烁
  const [showLoading, setShowLoading] = useState(false)
  
  // 🔑 bookKey稳定性保证：使用ref防止重复生成
  const bookKeyRef = useRef<string>('')
  const hasInitialized = useRef<boolean>(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleBackToLibrary = () => {
    // 🚀 使用SPA路由导航，保持内存状态（类似Readest的navigateToLibrary）
    router.push('/library')
  }

  const handleCloseBook = () => {
    // 🚀 使用SPA路由导航，保持内存状态（类似Readest的navigateToLibrary）
    router.push('/library')
  }

  const handleOpenSettings = () => {
    setFontLayoutSettingsDialogOpen(true)
  }

  useEffect(() => {
    const initializeReader = async () => {
      if (!bookId) {
        console.error('未提供书籍ID')
        return
      }

      // 🔧 防止重复初始化
      if (hasInitialized.current) {
        console.log('🔧 Reader页面: 已初始化，跳过重复加载')
        return
      }
      hasInitialized.current = true

      try {
        // 🎯 智能加载指示器：检查是否有缓存决定延迟时间
        const bookData = getBookData(bookId)
        const hasCache = !!bookData?.bookDoc
        const delayTime = hasCache ? 100 : 300 // 有缓存时减少延迟
        
        loadingTimeoutRef.current = setTimeout(() => {
          setShowLoading(true)
        }, delayTime)

        // 🔧 生成稳定的bookKey - 使用集中化生成器
        if (!bookKeyRef.current) {
          bookKeyRef.current = generateBookKey(bookId)
        }
        
        setBookKey(bookKeyRef.current)
        setBookKeys([bookKeyRef.current])
        
        // 🚀 采用Readest策略：在Reader页面初始化时解析BookDoc
        await initViewState(bookId, bookKeyRef.current, true)
        
        console.log('✅ Reader页面初始化完成', { bookKey: bookKeyRef.current })
        
        // 清除loading定时器
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
        setShowLoading(false)
        
      } catch (error) {
        console.error('❌ Reader页面初始化失败:', error)
        hasInitialized.current = false // 重置以允许重试
        
        // 清除loading定时器
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
        setShowLoading(false)
      }
    }

    initializeReader()

    // 清理函数
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [bookId, initViewState, setBookKeys])

  // 获取当前的视图状态和书籍数据
  const viewState = getViewState(bookKey)
  const bookData = getBookData(bookKey)

  // 🎯 智能加载指示器：只有在延迟后才显示loading
  if (!bookKey || (viewState?.loading && showLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center space-y-4">
          <Spinner loading={true} />
          <div className="text-sm text-base-content/70">
            {!bookKey ? '初始化中...' : '正在加载书籍...'}
          </div>
        </div>
      </div>
    )
  }

  if (viewState?.error) {
    return (
      <div
        className="h-screen flex items-center justify-center bg-base-100"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="text-error text-lg font-medium">
            {viewState.error}
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              hasInitialized.current = false
              // 重新初始化
              if (bookKey) {
                initViewState(bookId, bookKey, true)
              }
            }}
          >
            重试
          </button>
          <button 
            className="btn btn-ghost"
            onClick={handleBackToLibrary}
          >
            返回图书馆
          </button>
        </div>
      </div>
    )
  }

  if (!bookData?.book || !bookData?.bookDoc) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center space-y-4">
          <Spinner loading={true} />
          <div className="text-sm text-base-content/70">
            准备中...
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-base-100">
          <div className="flex flex-col items-center space-y-4">
            <Spinner loading={true} />
            <div className="text-sm text-base-content/70">
              正在启动阅读器...
            </div>
          </div>
        </div>
      }>
        <ReaderContent
          bookKey={bookKey}
          onCloseBook={handleCloseBook}
          onOpenSettings={handleOpenSettings}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
          onGoToLibrary={handleBackToLibrary}
        />
      </Suspense>
    </ErrorBoundary>
  )
} 