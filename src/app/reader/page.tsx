'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Book } from '@/types/book'
import { BookServiceV2 } from '@/services/BookServiceV2'
import { DocumentLoader } from '@/libs/document'
import { generateBookKey } from '@/utils/bookKey'
import Spinner from '@/components/ui/Spinner'
import BookReader from '@/components/reader/BookReader'
import SideBar from '@/components/reader/sidebar/SideBar'
import SettingsDialog from '@/components/reader/settings/SettingsDialog'
import { useSettingsStore } from '@/store/settingsStore'
import { useReaderStore } from '@/store/readerStore'
import { BookDoc } from '@/types/book'

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
  
  const { initializeViewSettings } = useReaderStore()
  const { fontLayoutSettingsDialogOpen, setFontLayoutSettingsDialogOpen } = useSettingsStore()
  
  const [book, setBook] = useState<Book | null>(null)
  const [bookDoc, setBookDoc] = useState<BookDoc | null>(null)
  const [bookKey, setBookKey] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  
  // 🔑 bookKey稳定性保证：使用ref防止重复生成
  const bookKeyRef = useRef<string>('')
  const hasInitialized = useRef<boolean>(false)

  const handleBackToLibrary = () => {
    window.location.href = '/library'
  }

  const handleCloseBook = () => {
    window.location.href = '/library'
  }

  const handleOpenSettings = () => {
    setFontLayoutSettingsDialogOpen(true)
  }

  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) {
        setError('未提供书籍ID')
        setLoading(false)
        return
      }

      // 🔧 防止重复初始化
      if (hasInitialized.current) {
        console.log('🔧 Reader页面: 已初始化，跳过重复加载')
        return
      }
      hasInitialized.current = true

      try {
        setLoading(true)
        setError(null)

        const bookServiceV2 = BookServiceV2.getInstance()

        const foundBook = bookServiceV2.getBookByHash(bookId)
        if (!foundBook) {
          setError('未找到书籍')
          setLoading(false)
          return
        }
        setBook(foundBook)

        const bookFile = await bookServiceV2.getBookFile(foundBook.hash)
        if (!bookFile) {
          setError('无法加载书籍文件')
          setLoading(false)
          return
        }

        // Use DocumentLoader to parse the book
        const loader = new DocumentLoader(bookFile)
        const parsedDocument = await loader.open()
        
        if (parsedDocument && parsedDocument.book) {
          setBookDoc(parsedDocument.book)
          
          // 🔧 生成稳定的bookKey - 使用集中化生成器
          if (!bookKeyRef.current) {
            bookKeyRef.current = generateBookKey(foundBook.hash)
          }
          
          setBookKey(bookKeyRef.current)
          await initializeViewSettings(bookKeyRef.current)
        } else {
          setError('无法解析书籍内容')
        }
      } catch (error) {
        console.error('加载书籍失败:', error)
        setError('加载书籍失败')
        hasInitialized.current = false // 重置以允许重试
      } finally {
        setLoading(false)
      }
    }

    loadBook()
  }, [bookId, initializeViewSettings])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">加载错误</h1>
          <p className="text-base-content/60 mb-4">{error}</p>
          <button
            onClick={handleBackToLibrary}
            className="btn btn-primary"
          >
            返回图书馆
          </button>
        </div>
      </div>
    )
  }

  if (!book || !bookDoc) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">书籍数据错误</h1>
          <p className="text-base-content/60 mb-4">无法加载书籍数据</p>
          <button
            onClick={handleBackToLibrary}
            className="btn btn-primary"
          >
            返回图书馆
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="reader-content flex h-screen bg-base-100">
      {/* SideBar - 使用新的组件 */}
      <SideBar 
        isVisible={isSidebarVisible}
        onGoToLibrary={handleBackToLibrary}
        onClose={() => setIsSidebarVisible(false)}
        book={book}
        bookDoc={bookDoc}
        bookKey={bookKey} // 🔧 传递完整的bookKey
      />
      
      {/* BookReader - 使用新的组件 */}
      <div className="flex-1">
        <BookReader 
          book={book}
          bookDoc={bookDoc}
          bookKey={bookKey}
          onCloseBook={handleCloseBook}
          onOpenSettings={handleOpenSettings}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />
      </div>

      {/* Settings Dialog */}
      {fontLayoutSettingsDialogOpen && book && bookKey && (
        <SettingsDialog
          bookKey={bookKey}
          isOpen={fontLayoutSettingsDialogOpen}
          onClose={() => setFontLayoutSettingsDialogOpen(false)}
        />
      )}
    </div>
  )
} 