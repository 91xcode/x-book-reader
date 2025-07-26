'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Book } from '@/types/book'
import { BookServiceV2 } from '@/services/BookServiceV2'
import { DocumentLoader } from '@/libs/document'
import Spinner from '@/components/ui/Spinner'
import BookReader from '@/components/reader/BookReader'
import SideBar from '@/components/reader/sidebar/SideBar'

export default function ReaderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookId = searchParams.get('ids')

  const [book, setBook] = useState<Book | null>(null)
  const [bookDoc, setBookDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleBackToLibrary = () => {
    router.push('/library')
  }

  const handleCloseBook = () => {
    router.push('/library')
  }

  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
  }

  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) {
        setError('未提供书籍ID')
        setLoading(false)
        return
      }

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
        } else {
          setError('无法解析书籍内容')
        }
      } catch (error) {
        console.error('加载书籍失败:', error)
        setError('加载书籍失败')
      } finally {
        setLoading(false)
      }
    }

    loadBook()
  }, [bookId])

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
      />
      
      {/* BookReader - 使用新的组件 */}
      <div className="flex-1">
        <BookReader 
          book={book}
          bookDoc={bookDoc}
          onCloseBook={handleCloseBook}
          onOpenSettings={handleOpenSettings}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />
      </div>

      {/* Settings Dialog */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">阅读设置</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                ×
              </button>
            </div>
            <div className="text-center text-base-content/60">
              <p>设置功能开发中...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 