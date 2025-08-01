'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaSearch } from 'react-icons/fa'
import { PiPlus, PiSelectionAllDuotone, PiDotsThreeCircle } from 'react-icons/pi'
import { MdOutlineMenu, MdViewList, MdViewModule, MdArrowBackIosNew, MdClose, MdCheck } from 'react-icons/md'
import { IoMdCloseCircle } from 'react-icons/io'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import 'overlayscrollbars/overlayscrollbars.css'
import clsx from 'clsx'
import Dropdown from '@/components/ui/Dropdown'
import Dialog from '@/components/ui/Dialog'
import MenuItem from '@/components/ui/MenuItem'
import FileUpload from '@/components/FileUpload'
import { getAppService } from '@/services/environment'
import { BookServiceV2 } from '@/services/BookServiceV2'
import { PreloadManager } from '@/services/PreloadManager'
import { Book } from '@/types/book'
import { LibraryViewModeType, LibrarySortByType, LibraryCoverFitType, BookFilter } from '@/types/settings'

export default function LibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 基础状态
  const [loading, setLoading] = useState(false)
  const [libraryLoaded, setLibraryLoaded] = useState(false) // 🆕 添加库加载状态
  const [books, setBooks] = useState<Book[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])

  // 搜索和过滤状态
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '')
  const [viewMode, setViewMode] = useState<LibraryViewModeType>('grid')
  const [sortBy, setSortBy] = useState<LibrarySortByType>('updated')
  const [sortAscending, setSortAscending] = useState(false)
  const [coverFit, setCoverFit] = useState<LibraryCoverFitType>('crop')
  const [bookFilter, setBookFilter] = useState<BookFilter>({
    searchFields: ['title', 'author', 'description', 'format']
  })
  
  // 书籍导入相关状态
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importError, setImportError] = useState<string | null>(null)
  const [environmentInfo, setEnvironmentInfo] = useState<string>('')

  // 加载书籍列表
  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      // 获取环境感知的应用服务
      const appService = await getAppService()
      const platformInfo = appService.getPlatformInfo()
      console.log('🔧 Library: 应用服务已初始化:', platformInfo)
      
      // 设置环境信息显示
      setEnvironmentInfo(`${platformInfo.platform === 'electron' ? '🖥️ 桌面版' : '🌐 网页版'} - ${platformInfo.platform}`)
      
      // 使用新的BookServiceV2
      const bookServiceV2 = BookServiceV2.getInstance()
      const loadedBooks = bookServiceV2.getBooks()
      setBooks(loadedBooks)
      
      // 🚀 多层次预加载：后台预检查书籍可用性
      if (loadedBooks.length > 0) {
        const preloadManager = PreloadManager.getInstance()
        
        // 异步后台预检查，不阻塞UI
        setTimeout(() => {
          preloadManager.backgroundCheckAvailability(loadedBooks).then(() => {
            console.log('🔍 Library: 后台预检查完成')
          }).catch(error => {
            console.error('❌ Library: 后台预检查失败:', error)
          })
        }, 1000) // 延迟1秒开始，让UI先完成渲染
      }
      
      // 🆕 标记库已加载完成
      setLibraryLoaded(true)
    } catch (error) {
      console.error('加载书籍失败:', error)
      // 即使出错也要标记为已加载，避免永远显示加载状态
      setLibraryLoaded(true)
    } finally {
      setLoading(false)
    }
  }

  // 格式化标题和作者的辅助函数
  const formatTitle = (title: string): string => {
    return title?.trim() || '未知标题'
  }

  const formatAuthors = (author: string): string => {
    return author?.trim() || '未知作者'
  }

  // 高级搜索过滤器
  const advancedBookFilter = (book: Book, queryTerm: string): boolean => {
    if (book.deletedAt) return false
    if (!queryTerm) return true

    const searchTerm = new RegExp(queryTerm, 'i')
    const title = formatTitle(book.title)
    const authors = formatAuthors(book.author)
    
    return (
      searchTerm.test(title) ||
      searchTerm.test(authors) ||
      searchTerm.test(book.format) ||
      (book.metadata?.description && searchTerm.test(book.metadata.description)) ||
      (!!book.groupName && searchTerm.test(book.groupName))
    )
  }

  // 书籍排序器
  const bookSorter = (a: Book, b: Book): number => {
    switch (sortBy) {
      case 'title':
        const aTitle = formatTitle(a.title)
        const bTitle = formatTitle(b.title)
        return aTitle.localeCompare(bTitle, 'zh-CN')
      case 'author':
        const aAuthors = formatAuthors(a.author)
        const bAuthors = formatAuthors(b.author)
        return aAuthors.localeCompare(bAuthors, 'zh-CN')
      case 'updated':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      case 'created':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'format':
        return a.format.localeCompare(b.format, 'zh-CN')
      default:
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    }
  }

  // 过滤和排序书籍
  const filteredAndSortedBooks = books
    .filter(book => advancedBookFilter(book, searchQuery))
    .filter(book => {
      // 按格式过滤
      if (bookFilter.formats && bookFilter.formats.length > 0) {
        return bookFilter.formats.includes(book.format)
      }
      // 按阅读状态过滤
      if (bookFilter.status && bookFilter.status.length > 0) {
        const status = book.readingStatus || 'unread'
        return bookFilter.status.includes(status)
      }
      return true
    })
    .sort((a, b) => {
      const sortResult = bookSorter(a, b)
      return sortAscending ? sortResult : -sortResult
    })

  const handleBookClick = async (bookHash: string) => {
    if (isSelectMode) {
      setSelectedBooks(prev =>
        prev.includes(bookHash)
          ? prev.filter(id => id !== bookHash)
          : [...prev, bookHash]
      )
    } else {
      // 🚀 实现预处理机制和异步导航
      try {
        console.log('📖 Library: 用户点击书籍:', bookHash.substring(0, 8) + '...')
        
        // 1. 获取书籍信息
        const bookServiceV2 = BookServiceV2.getInstance()
        const book = bookServiceV2.getBookByHash(bookHash)
        
        if (!book) {
          console.error('❌ Library: 书籍不存在')
          return
        }
        
        // 🔥 2. 检查BookDoc缓存状态（类似readest）
        const { useBookDataStore } = await import('@/store/bookDataStore')
        const bookDataStore = useBookDataStore.getState()
        const bookData = bookDataStore.getBookData(bookHash)
        
        const hasBookDoc = !!bookData?.bookDoc
        const hasBook = !!bookData?.book
        
        console.log('📊 Library: 书籍缓存状态', {
          hasBook,
          hasBookDoc,
          hasFile: !!bookData?.file,
          title: bookData?.book?.title
        })
        
        let available = true // 默认可用
        
        if (!hasBook) {
          // 书籍基础信息都没有，需要基础检查
          const preloadManager = PreloadManager.getInstance()
          available = await preloadManager.preheatBook(bookHash)
          
          if (!available) {
            console.error('❌ Library: 书籍文件不可用')
            return
          }
        } else if (!hasBookDoc) {
          // 有基础信息但没有BookDoc，快速预解析
          console.log('⚡ Library: 快速预解析BookDoc...')
          try {
            await preloadBookDoc(bookHash)
          } catch (error) {
            console.error('❌ Library: 预解析BookDoc失败:', error)
            // 继续执行，降级到正常流程
          }
        } else {
          console.log('🚀 Library: 使用完整缓存，立即导航')
        }
        
        // 3. 异步导航（类似readest的setTimeout(0)）
        setTimeout(() => {
          console.log('🚀 Library: 导航到reader页面')
          router.push(`/reader?ids=${bookHash}`)
        }, 0)
        
      } catch (error) {
        console.error('❌ Library: 处理书籍点击失败:', error)
        // 降级：直接导航
        setTimeout(() => {
          router.push(`/reader?ids=${bookHash}`)
        }, 0)
      }
    }
  }

  // 🔥 书籍hover预热 - 鼠标悬停时预热书籍（类似readest）
  const handleBookHover = async (bookHash: string) => {
    try {
      // 检查是否已经有BookDoc缓存
      const { useBookDataStore } = await import('@/store/bookDataStore')
      const bookDataStore = useBookDataStore.getState()
      const bookData = bookDataStore.getBookData(bookHash)
      
      if (bookData?.bookDoc) {
        console.debug('🔥 Library: 书籍已有BookDoc缓存，跳过预热')
        return // 已经有完整缓存了
      }
      
      // 🔑 关键优化：异步预解析BookDoc
      setTimeout(() => {
        preloadBookDoc(bookHash).catch(error => {
          console.debug('🔥 Library: 预解析BookDoc失败 (不影响功能):', error)
        })
      }, 150) // 稍微延迟，避免快速移动鼠标时的频繁调用
      
    } catch (error) {
      console.debug('🔥 Library: 预热书籍失败 (不影响功能):', error)
    }
  }

  // 🚀 预解析BookDoc - 类似readest的initViewState逻辑
  const preloadBookDoc = async (bookHash: string) => {
    try {
      console.log('📖 Library: 开始预解析BookDoc', bookHash.substring(0, 8) + '...')
      const startTime = performance.now()
      
      const { useBookDataStore } = await import('@/store/bookDataStore')
      const { useReaderStore } = await import('@/store/readerStore')
      const { generateBookKey } = await import('@/utils/bookKey')
      
      const bookDataStore = useBookDataStore.getState()
      const readerStore = useReaderStore.getState()
      
      // 再次检查缓存（防止重复解析）
      const existingData = bookDataStore.getBookData(bookHash)
      if (existingData?.bookDoc) {
        console.log('✅ Library: BookDoc已缓存，跳过解析')
        return
      }
      
      // 🔑 关键：调用readerStore的initViewState（类似readest）
      const bookKey = generateBookKey(bookHash)
      await readerStore.initViewState(bookHash, bookKey, false) // false表示非主要视图
      
      const duration = performance.now() - startTime
      console.log('✅ Library: BookDoc预解析完成', {
        bookId: bookHash.substring(0, 8) + '...',
        duration: `${duration.toFixed(2)}ms`
      })
      
    } catch (error) {
      console.error('❌ Library: BookDoc预解析失败:', error)
    }
  }

  // 打开导入对话框
  const handleImportBooks = () => {
    setIsImportDialogOpen(true)
    setImportError(null)
  }

  // 处理文件上传
  const handleFilesSelected = async (files: File[]) => {
    try {
      setIsImporting(true)
      setImportError(null)

      const importedBooks: Book[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setImportProgress(((i + 1) / files.length) * 100)

        try {
          console.log(`正在导入: ${file.name}`)
          const bookServiceV2 = BookServiceV2.getInstance()
          const result = await bookServiceV2.importBook(file)
          if (result.success && result.book) {
            importedBooks.push(result.book)
          } else {
            console.error(`导入 ${file.name} 失败:`, result.error)
          }
        } catch (error) {
          console.error(`导入 ${file.name} 失败:`, error)
          // 继续导入其他文件，不中断整个过程
        }
      }

      // 更新书籍列表
      await loadBooks()

      // 显示成功消息
      if (importedBooks.length > 0) {
        console.log(`成功导入 ${importedBooks.length} 本书籍`)
        // 这里可以添加 toast 通知
      }

      // 关闭对话框
      setIsImportDialogOpen(false)

    } catch (error) {
      console.error('批量导入失败:', error)
      setImportError(error instanceof Error ? error.message : '导入失败')
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  // 处理书籍删除
  const handleDeleteBooks = async () => {
    if (selectedBooks.length === 0) return

    try {
      setLoading(true)
      const bookServiceV2 = BookServiceV2.getInstance()
      for (const bookHash of selectedBooks) {
        const result = await bookServiceV2.deleteBook(bookHash)
        if (!result.success) {
          console.error(`删除书籍 ${bookHash} 失败:`, result.error)
        }
      }
      await loadBooks()
      setSelectedBooks([])
      setIsSelectMode(false)
      setIsSelectAll(false)
    } catch (error) {
      console.error('删除书籍失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    setSelectedBooks([])
    setIsSelectAll(false)
  }

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedBooks([])
      setIsSelectAll(false)
    } else {
      setSelectedBooks(filteredAndSortedBooks.map(book => book.hash))
      setIsSelectAll(true)
    }
  }

  // 获取所有可用的格式用于过滤
  const availableFormats = [...new Set(books.map(book => book.format))].sort()

  // 统计信息
  const totalBooks = books.length
  const displayedBooks = filteredAndSortedBooks.length

  // Import Menu Component
  const ImportMenu = () => (
    <>
      <li>
        <button onClick={handleImportBooks}>
          <PiPlus className="w-4 h-4" />
          从文件导入
        </button>
      </li>
      <li>
        <button>
          <PiPlus className="w-4 h-4" />
          从URL导入
        </button>
      </li>
    </>
  )

  // View Menu Component - 完全参考readest的ViewMenu
  const ViewMenu = () => (
    <>
      {/* 视图模式 */}
      <MenuItem
        label="列表视图"
        Icon={viewMode === 'list' ? MdCheck : undefined}
        onClick={() => setViewMode('list')}
      />
      <MenuItem
        label="网格视图"
        Icon={viewMode === 'grid' ? MdCheck : undefined}
        onClick={() => setViewMode('grid')}
      />
      
      <hr className="border-base-200 my-1" />
      
      {/* 封面适配 */}
      <MenuItem
        label="书籍封面"
        disabled={true}
        labelClass="text-sm opacity-50"
      />
      <MenuItem
        label="裁剪适配"
        Icon={coverFit === 'crop' ? MdCheck : undefined}
        onClick={() => setCoverFit('crop')}
      />
      <MenuItem
        label="完整显示"
        Icon={coverFit === 'fit' ? MdCheck : undefined}
        onClick={() => setCoverFit('fit')}
      />
      
      <hr className="border-base-200 my-1" />
      
      {/* 排序方式 */}
      <MenuItem
        label="排序方式..."
        disabled={true}
        labelClass="text-sm opacity-50"
      />
      <MenuItem
        label="按标题"
        Icon={sortBy === 'title' ? MdCheck : undefined}
        onClick={() => setSortBy('title')}
      />
      <MenuItem
        label="按作者"
        Icon={sortBy === 'author' ? MdCheck : undefined}
        onClick={() => setSortBy('author')}
      />
      <MenuItem
        label="按格式"
        Icon={sortBy === 'format' ? MdCheck : undefined}
        onClick={() => setSortBy('format')}
      />
      <MenuItem
        label="按更新时间"
        Icon={sortBy === 'updated' ? MdCheck : undefined}
        onClick={() => setSortBy('updated')}
      />
      <MenuItem
        label="按添加时间"
        Icon={sortBy === 'created' ? MdCheck : undefined}
        onClick={() => setSortBy('created')}
      />
      
      <hr className="border-base-200 my-1" />
      
      {/* 排序顺序 */}
      <MenuItem
        label="升序"
        Icon={sortAscending ? MdCheck : undefined}
        onClick={() => setSortAscending(true)}
      />
      <MenuItem
        label="降序"
        Icon={!sortAscending ? MdCheck : undefined}
        onClick={() => setSortAscending(false)}
      />
    </>
  )

  // Settings Menu Component
  const SettingsMenu = () => (
    <>
      <li>
        <button>偏好设置</button>
      </li>
      <li>
        <button>关于</button>
      </li>
      <li><div className="divider"></div></li>
      <li>
        <button>导出图书馆</button>
      </li>
    </>
  )

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Library Header */}
      <div className="titlebar bg-base-200 z-10 flex h-[52px] w-full items-center py-2 pr-4 sm:h-[48px] sm:pr-6 pl-4 sm:pl-2">
        <div className="flex w-full items-center justify-between space-x-6 sm:space-x-12">
          <div className="exclude-title-bar-mousedown relative flex w-full items-center pl-4">
            <div className="relative flex h-9 w-full items-center sm:h-7">
              <span className="absolute left-3 text-gray-500">
                <FaSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                placeholder={
                  displayedBooks > 1
                    ? `在 ${displayedBooks} 本书中搜索...`
                    : '搜索书籍...'
                }
                onChange={handleSearchChange}
                spellCheck="false"
                className={clsx(
                  'input rounded-badge bg-base-300/50 h-9 w-full pl-10 pr-10 sm:h-7',
                  'font-sans text-sm font-light',
                  'border-none focus:outline-none focus:ring-0'
                )}
              />
            </div>
            <div className="absolute right-4 flex items-center space-x-2 text-gray-500 sm:space-x-4">
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="pe-1 text-gray-400 hover:text-gray-600"
                  aria-label="Clear Search"
                >
                  <IoMdCloseCircle className="h-4 w-4" />
                </button>
              )}
              <span className="bg-base-content/50 mx-2 h-4 w-[0.5px]"></span>
              <Dropdown
                className="exclude-title-bar-mousedown dropdown-bottom flex h-6 cursor-pointer justify-center dropdown-center"
                buttonClassName="p-0 h-6 min-h-6 w-6 flex items-center justify-center btn-ghost"
                toggleButton={
                  <div className="lg:tooltip lg:tooltip-bottom" data-tip="导入书籍">
                    <PiPlus className="m-0.5 h-5 w-5" />
                  </div>
                }
              >
                <ImportMenu />
              </Dropdown>
              <button
                onClick={toggleSelectMode}
                aria-label="选择多本书籍"
                className="h-6"
              >
                <div
                  className="lg:tooltip lg:tooltip-bottom cursor-pointer"
                  data-tip="选择书籍"
                >
                  <PiSelectionAllDuotone
                    role="button"
                    className={`h-6 w-6 ${isSelectMode ? 'fill-gray-400' : 'fill-gray-500'}`}
                  />
                </div>
              </button>
            </div>
          </div>
          {isSelectMode ? (
            <div className="flex h-full items-center w-max-[72px] w-min-[72px] sm:w-max-[80px] sm:w-min-[80px]">
              <button
                onClick={handleSelectAll}
                className="btn btn-ghost text-base-content/85 h-8 min-h-8 w-[72px] p-0 sm:w-[80px]"
                aria-label={isSelectAll ? '取消全选' : '全选'}
              >
                <span className="font-sans text-base font-normal sm:text-sm">
                  {isSelectAll ? '取消全选' : '全选'}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex h-full items-center gap-x-2 sm:gap-x-4">
              <Dropdown
                className="exclude-title-bar-mousedown dropdown-bottom dropdown-end"
                buttonClassName="btn btn-ghost h-8 min-h-8 w-8 p-0"
                toggleButton={<PiDotsThreeCircle className="w-[18px] h-[18px]" />}
              >
                <ViewMenu />
              </Dropdown>
              <Dropdown
                className="exclude-title-bar-mousedown dropdown-bottom dropdown-end"
                buttonClassName="btn btn-ghost h-8 min-h-8 w-8 p-0"
                toggleButton={<MdOutlineMenu className="w-[18px] h-[18px]" />}
              >
                <SettingsMenu />
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      {/* Select Mode Actions */}
      {isSelectMode && selectedBooks.length > 0 && (
        <div className="border-b border-base-300 px-4 py-2 bg-base-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-base-content/70">
              已选择 {selectedBooks.length} 本书
            </span>
            <div className="flex space-x-2">
              <button
                className="btn btn-sm btn-error"
                onClick={handleDeleteBooks}
                disabled={loading}
              >
                删除
              </button>
              <button className="btn btn-sm btn-outline">下载</button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setIsSelectMode(false)
                  setSelectedBooks([])
                  setIsSelectAll(false)
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Stats */}
      {totalBooks > 0 && (
        <div className="border-b border-base-300 px-4 py-2 bg-base-50">
          <div className="flex items-center justify-between text-sm text-base-content/70">
            <span>
              显示 {displayedBooks} / {totalBooks} 本书籍
              {environmentInfo && (
                <span className="ml-3 px-2 py-1 bg-primary/10 rounded-md text-primary text-xs">
                  {environmentInfo}
                </span>
              )}
              {searchQuery && ` - 搜索: "${searchQuery}"`}
            </span>
            <span>
              排序: {sortBy === 'title' ? '标题' : sortBy === 'author' ? '作者' : sortBy === 'format' ? '格式' : sortBy === 'created' ? '添加时间' : '更新时间'}
              ({sortAscending ? '升序' : '降序'})
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <OverlayScrollbarsComponent
          className="h-full"
          options={{
            scrollbars: { autoHide: 'scroll' },
            showNativeOverlaidScrollbars: false
          }}
          defer
        >
          <div className="p-4">
            {/* 🆕 加载状态指示器 */}
            {loading && !libraryLoaded && (
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
                <div className="text-base-content/60 mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-base-300 rounded-lg flex items-center justify-center">
                    <div className="loading loading-spinner loading-lg"></div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">正在加载书籍...</h3>
                  <p className="text-sm">{environmentInfo}</p>
                </div>
              </div>
            )}

            {/* 🆕 只有在库已加载后才显示内容或空状态 */}
            {libraryLoaded && (
              <>
                {filteredAndSortedBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
                    <div className="text-base-content/60 mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-base-300 rounded-lg flex items-center justify-center">
                        <PiPlus className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        {searchQuery ? '没有找到匹配的书籍' : '没有找到书籍'}
                      </h3>
                      <p className="text-sm">
                        {searchQuery ? '尝试调整搜索关键词或清除过滤条件' : '导入一些书籍开始阅读'}
                      </p>
                    </div>
                    {!searchQuery && (
                      <button
                        className="btn btn-primary"
                        onClick={handleImportBooks}
                      >
                        <PiPlus className="w-4 h-4" />
                        导入书籍
                      </button>
                    )}
                  </div>
                ) : (
              <div className={clsx({
                'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4': viewMode === 'grid',
                'space-y-2': viewMode === 'list'
              })}>
                {filteredAndSortedBooks.map((book) => (
                  <div
                    key={book.hash}
                    className={clsx(
                      'cursor-pointer transition-all duration-200 hover:scale-[1.02]',
                      {
                        'relative': viewMode === 'grid',
                        'card card-side bg-base-200 shadow-sm hover:shadow-md h-32': viewMode === 'list',
                        'ring-2 ring-primary': selectedBooks.includes(book.hash)
                      }
                    )}
                    onClick={() => handleBookClick(book.hash)}
                    onMouseEnter={() => handleBookHover(book.hash)}
                  >
                    {viewMode === 'grid' ? (
                      <div className="space-y-2">
                        {/* Book Cover */}
                        <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg shadow-md flex items-center justify-center relative overflow-hidden">
                          {book.metadata?.cover ? (
                            <img
                              src={book.metadata.cover}
                              alt={book.title}
                              className={clsx(
                                'w-full h-full',
                                coverFit === 'crop' ? 'object-cover' : 'object-contain'
                              )}
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-xs font-mono text-base-content/60 uppercase tracking-wider">
                                {book.format}
                              </div>
                            </div>
                          )}

                          {/* Progress indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-base-300">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${book.progress || 0}%` }}
                            />
                          </div>

                          {/* Reading Status Badge */}
                          {book.readingStatus && book.readingStatus !== 'unread' && (
                            <div className="absolute top-2 left-2">
                              <span className={clsx(
                                'badge badge-xs',
                                book.readingStatus === 'reading' ? 'badge-warning' : 'badge-success'
                              )}>
                                {book.readingStatus === 'reading' ? '在读' : '完成'}
                              </span>
                            </div>
                          )}

                          {isSelectMode && (
                            <div className="absolute top-2 right-2">
                              <div className={clsx(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                selectedBooks.includes(book.hash)
                                  ? 'bg-primary border-primary text-primary-content'
                                  : 'border-base-content/30 bg-base-100/80 backdrop-blur-sm'
                              )}>
                                {selectedBooks.includes(book.hash) && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm line-clamp-2 leading-tight">{book.title}</h3>
                          <p className="text-xs text-base-content/70 line-clamp-1">{book.author}</p>
                          <div className="flex items-center justify-between text-xs text-base-content/60">
                            <span>{book.progress || 0}%</span>
                            <span className="uppercase">{book.format}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full">
                        {/* List View - Book Cover */}
                        <div className="w-20 h-full flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-l-lg flex items-center justify-center relative overflow-hidden">
                          {book.metadata?.cover ? (
                            <img
                              src={book.metadata.cover}
                              alt={book.title}
                              className={clsx(
                                'w-full h-full',
                                coverFit === 'crop' ? 'object-cover' : 'object-contain'
                              )}
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-xs font-mono text-base-content/60 uppercase tracking-wider">
                                {book.format}
                              </div>
                            </div>
                          )}
                          {isSelectMode && (
                            <div className="absolute top-2 left-2">
                              <div className={clsx(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                selectedBooks.includes(book.hash)
                                  ? 'bg-primary border-primary text-primary-content'
                                  : 'border-base-content/30 bg-base-100/80 backdrop-blur-sm'
                              )}>
                                {selectedBooks.includes(book.hash) && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* List View - Book Info */}
                        <div className="flex-1 p-3 flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-sm line-clamp-1">{book.title}</h3>
                            <p className="text-xs text-base-content/70 line-clamp-1">{book.author}</p>
                            {book.readingStatus && book.readingStatus !== 'unread' && (
                              <span className={clsx(
                                'inline-block mt-1 badge badge-xs',
                                book.readingStatus === 'reading' ? 'badge-warning' : 'badge-success'
                              )}>
                                {book.readingStatus === 'reading' ? '在读' : '完成'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-base-content/60 mt-2">
                            <span>{book.progress || 0}%</span>
                            <span className="uppercase">{book.format}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                  </div>
                )}
              </>
            )}
          </div>
        </OverlayScrollbarsComponent>

        {/* Import Dialog */}
        <Dialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          title="导入书籍"
          boxClassName="sm:max-w-2xl"
        >
          <div className="p-6">
            {importError && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                <div className="text-error text-sm">{importError}</div>
              </div>
            )}

            {isImporting && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-primary text-sm mb-2">正在导入书籍...</div>
                <div className="w-full bg-base-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-primary/70 mt-1">{Math.round(importProgress)}%</div>
              </div>
            )}

            <FileUpload
              onFilesSelected={handleFilesSelected}
              disabled={isImporting}
            />

            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="btn btn-ghost"
                onClick={() => setIsImportDialogOpen(false)}
                disabled={isImporting}
              >
                关闭
              </button>
            </div>
          </div>
        </Dialog>
      </main>
    </div>
  )
} 