'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GiBookshelf } from 'react-icons/gi'
import { FiSearch } from 'react-icons/fi'
import { MdOutlineMenu, MdOutlinePushPin, MdPushPin, MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md'
import { MdZoomOut, MdZoomIn, MdCheck, MdSync, MdSyncProblem } from 'react-icons/md'
import { MdOutlineAutoMode, MdOutlineTextRotationNone, MdTextRotateVertical } from 'react-icons/md'
import { BiMoon, BiSun } from 'react-icons/bi'
import { TbSunMoon, TbTextDirectionRtl } from 'react-icons/tb'
import { PiDotsThreeVerticalBold, PiPlus } from 'react-icons/pi'
import { IoIosList } from 'react-icons/io'
import { RiFontSize, RiDashboardLine, RiTranslate } from 'react-icons/ri'
import { VscSymbolColor } from 'react-icons/vsc'
import { LiaHandPointerSolid } from 'react-icons/lia'
import { IoAccessibilityOutline } from 'react-icons/io5'
import { MdOutlineHeadphones as TTSIcon } from 'react-icons/md'
import { TbBoxMargin } from 'react-icons/tb'
import { RxLineHeight } from 'react-icons/rx'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import 'overlayscrollbars/overlayscrollbars.css'
import clsx from 'clsx'
import Dropdown from '@/components/ui/Dropdown'
import Dialog from '@/components/ui/Dialog'
import MenuItem from '@/components/ui/MenuItem'
import NumberInput from '@/components/ui/NumberInput'
import { TbLayoutSidebar, TbLayoutSidebarFilled } from 'react-icons/tb'
import { RiArrowLeftDoubleLine, RiArrowLeftSLine, RiArrowGoBackLine, RiArrowGoForwardLine, RiArrowRightSLine, RiArrowRightDoubleLine, RiFontFamily } from 'react-icons/ri'
import { PiNotePencil } from 'react-icons/pi'
import { RxSlider } from 'react-icons/rx'
import { FaHeadphones } from 'react-icons/fa'
import { MdOutlineHeadphones } from 'react-icons/md'

// Import our reader components
import FoliateViewer from '@/components/reader/FoliateViewer'
import TOCView from '@/components/reader/sidebar/TOCView'
import { BookServiceV2 } from '@/services/BookServiceV2'
import { DocumentLoader } from '@/libs/document'
import { useReaderStore } from '@/store/readerStore'
import { Book, BookDoc, BookConfig, ViewSettings, SettingsPanelType } from '@/types/book'
import { DEFAULT_VIEW_SETTINGS } from '@/utils/constants'

type TabConfig = {
  tab: SettingsPanelType
  icon: React.ElementType
  label: string
}

// Constants - matching readest
const MAX_SIDEBAR_WIDTH = 0.45 // 45% max width

export default function ReaderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState<Book | null>(null)
  const [bookDoc, setBookDoc] = useState<BookDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarPinned, setIsSidebarPinned] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'toc' | 'bookmarks' | 'annotations'>('toc')
  const [hoveredBookKey, setHoveredBookKey] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Get reader store functions
  const { getViewSettings, setViewSettings, addBookKey } = useReaderStore()

  // Sidebar width state - matching readest
  const [sidebarWidth, setSidebarWidth] = useState('15%') // Default desktop width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  // Get book ID from URL
  const bookId = searchParams?.get('ids')
  const bookKey = bookId ? `${bookId}` : null

  // Get view settings for this book
  const viewSettings = bookKey ? getViewSettings(bookKey) || { ...DEFAULT_VIEW_SETTINGS } : { ...DEFAULT_VIEW_SETTINGS }

  // Settings dialog state
  const [activePanel, setActivePanel] = useState<SettingsPanelType>(() => {
    if (typeof window !== 'undefined') {
      const lastPanel = localStorage.getItem('lastConfigPanel')
      if (lastPanel && ['Font', 'Layout', 'Color', 'Control', 'Language', 'Custom'].includes(lastPanel)) {
        return lastPanel as SettingsPanelType
      }
    }
    return 'Font'
  })
  const [showAllTabLabels, setShowAllTabLabels] = useState(false)
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const [isRtl] = useState(false)

  // ViewMenu state
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isScrolledMode, setIsScrolledMode] = useState(false)
  const [themeMode, setThemeMode] = useState<'auto' | 'light' | 'dark'>('auto')
  const [invertImgColorInDark, setInvertImgColorInDark] = useState(false)

  // Effect to set sidebar width based on screen size - matching readest
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const mobile = window.innerWidth < 640
        if (mobile) {
          setSidebarWidth('100%') // Mobile: full width
        } else {
          setSidebarWidth('15%') // Desktop: 15% default
        }
      }

      handleResize() // Initial call
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Load book data
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

        // Get book service instance
        const bookServiceV2 = BookServiceV2.getInstance()

        // Get book from service
        const foundBook = bookServiceV2.getBookByHash(bookId)
        if (!foundBook) {
          setError('未找到书籍')
          setLoading(false)
          return
        }

        setBook(foundBook)

        // Get book file and load document
        const bookFile = await bookServiceV2.getBookFile(foundBook.hash)
        if (!bookFile) {
          setError('无法加载书籍文件')
          setLoading(false)
          return
        }

        // Use DocumentLoader to parse the book
        const loader = new DocumentLoader(bookFile)
        const { book: loadedBookDoc } = await loader.open()
        setBookDoc(loadedBookDoc)

        // Add book key to reader store
        if (bookKey) {
          addBookKey(bookKey)
        }

        // Initialize view settings if not exist
        if (bookKey && !getViewSettings(bookKey)) {
          setViewSettings(bookKey, { ...DEFAULT_VIEW_SETTINGS })
        }

        setLoading(false)
      } catch (err) {
        console.error('加载书籍失败:', err)
        setError(err instanceof Error ? err.message : '加载书籍失败')
        setLoading(false)
      }
    }

    loadBook()
  }, [bookId, bookKey, addBookKey, getViewSettings, setViewSettings])

  // Update view settings function
  const updateViewSettings = (updates: Partial<ViewSettings>) => {
    if (bookKey) {
      const currentSettings = getViewSettings(bookKey) || { ...DEFAULT_VIEW_SETTINGS }
      setViewSettings(bookKey, { ...currentSettings, ...updates })
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/70">正在加载书籍...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !book || !bookDoc || !bookKey) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{error || '未找到书籍'}</h2>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/library')}
          >
            返回图书馆
          </button>
        </div>
      </div>
    )
  }

  const handleBackToLibrary = () => {
    router.push('/library')
  }

  const toggleSidebarPin = () => {
    setIsSidebarPinned(!isSidebarPinned)
  }

  const toggleSearchBar = () => {
    setIsSearchBarVisible(!isSearchBarVisible)
  }

  // Settings configuration - matching readest exactly
  const tabConfig: TabConfig[] = [
    {
      tab: 'Font',
      icon: RiFontSize,
      label: '字体',
    },
    {
      tab: 'Layout',
      icon: RiDashboardLine,
      label: '布局',
    },
    {
      tab: 'Color',
      icon: VscSymbolColor,
      label: '颜色',
    },
    {
      tab: 'Control',
      icon: LiaHandPointerSolid,
      label: '行为',
    },
    {
      tab: 'Language',
      icon: RiTranslate,
      label: '语言',
    },
    {
      tab: 'Custom',
      icon: IoAccessibilityOutline,
      label: '自定义',
    },
  ]

  const handleSetActivePanel = (tab: SettingsPanelType) => {
    setActivePanel(tab)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastConfigPanel', tab)
    }
  }

  // Create book config for FoliateViewer
  const bookConfig: BookConfig = {
    location: book.currentPage ? `#page-${book.currentPage}` : undefined,
  }

  // Calculate content insets for FoliateViewer
  const contentInsets = {
    top: 44, // Header height
    right: 0,
    bottom: 48, // Footer height  
    left: isSidebarOpen ? (isMobile ? 0 : parseInt(sidebarWidth)) : 0,
  }

  // View Menu Content Component
  const ViewMenuContent = () => (
    <>
      {/* View Mode Controls */}
      <MenuItem
        label={isScrolledMode ? '分页模式' : '滚动模式'}
        Icon={isScrolledMode ? RiDashboardLine : RxSlider}
        onClick={() => {
          setIsScrolledMode(!isScrolledMode)
          updateViewSettings({ scrolled: !isScrolledMode })
        }}
      />
      <hr className="border-base-200 my-1" />
      
      {/* Zoom Controls */}
      <MenuItem label="缩放" disabled={true} labelClass="text-sm opacity-50" />
      <MenuItem 
        label="放大" 
        Icon={MdZoomIn} 
        onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
      />
      <MenuItem 
        label="缩小" 
        Icon={MdZoomOut} 
        onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
      />
      <MenuItem 
        label="重置缩放" 
        onClick={() => setZoomLevel(100)}
      />
      <hr className="border-base-200 my-1" />
      
      {/* Theme Controls */}
      <MenuItem label="主题" disabled={true} labelClass="text-sm opacity-50" />
      <MenuItem 
        label="浅色主题" 
        Icon={themeMode === 'light' ? MdCheck : BiSun}
        onClick={() => {
          setThemeMode('light')
          updateViewSettings({ theme: 'light' })
        }}
      />
      <MenuItem 
        label="深色主题" 
        Icon={themeMode === 'dark' ? MdCheck : BiMoon}
        onClick={() => {
          setThemeMode('dark')
          updateViewSettings({ theme: 'dark' })
        }}
      />
      <MenuItem 
        label="自动主题" 
        Icon={themeMode === 'auto' ? MdCheck : TbSunMoon}
        onClick={() => {
          setThemeMode('auto')
          updateViewSettings({ theme: 'auto' })
        }}
      />
    </>
  )

  // Font Panel Component  
  const FontPanel = () => (
    <div className="space-y-6">
      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-base-content">字体大小</label>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-base-content/70 w-8">小</span>
          <input
            type="range"
            min="12"
            max="32"
            value={viewSettings.defaultFontSize || 16}
            onChange={(e) => updateViewSettings({ defaultFontSize: Number(e.target.value) })}
            className="range range-primary flex-1"
          />
          <span className="text-xs text-base-content/70 w-8">大</span>
          <span className="text-sm text-base-content w-12 text-right">
            {viewSettings.defaultFontSize || 16}px
          </span>
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-base-content">行间距</label>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-base-content/70 w-8">紧密</span>
          <input
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={viewSettings.lineHeight || 1.6}
            onChange={(e) => updateViewSettings({ lineHeight: Number(e.target.value) })}
            className="range range-primary flex-1"
          />
          <span className="text-xs text-base-content/70 w-8">宽松</span>
          <span className="text-sm text-base-content w-12 text-right">
            {(viewSettings.lineHeight || 1.6).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-base-content">字体</label>
        <select 
          className="select select-bordered w-full"
          value={viewSettings.fontFamily || 'default'}
          onChange={(e) => updateViewSettings({ fontFamily: e.target.value })}
        >
          <option value="default">默认字体</option>
          <option value="serif">衬线字体</option>
          <option value="sans-serif">无衬线字体</option>
          <option value="monospace">等宽字体</option>
        </select>
      </div>
    </div>
  )

  // Layout Panel Component
  const LayoutPanel = () => (
    <div className="space-y-6">
      {/* Margins */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-base-content">页面边距</label>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-base-content/70">上边距</label>
            <input
              type="number"
              min="0"
              max="100"
              value={viewSettings.marginTopPx || 48}
              onChange={(e) => updateViewSettings({ marginTopPx: Number(e.target.value) })}
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div>
            <label className="text-xs text-base-content/70">下边距</label>
            <input
              type="number"
              min="0"
              max="100"
              value={viewSettings.marginBottomPx || 48}
              onChange={(e) => updateViewSettings({ marginBottomPx: Number(e.target.value) })}
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div>
            <label className="text-xs text-base-content/70">左边距</label>
            <input
              type="number"
              min="0"
              max="100"
              value={viewSettings.marginLeftPx || 48}
              onChange={(e) => updateViewSettings({ marginLeftPx: Number(e.target.value) })}
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div>
            <label className="text-xs text-base-content/70">右边距</label>
            <input
              type="number"
              min="0"
              max="100"
              value={viewSettings.marginRightPx || 48}
              onChange={(e) => updateViewSettings({ marginRightPx: Number(e.target.value) })}
              className="input input-bordered input-sm w-full"
            />
          </div>
        </div>
      </div>

      {/* Page Layout */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-base-content">页面布局</label>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={viewSettings.scrolled || false}
            onChange={(e) => updateViewSettings({ scrolled: e.target.checked })}
            className="checkbox checkbox-primary checkbox-sm"
          />
          <span className="text-sm">滚动模式</span>
        </div>
      </div>

      {/* Max Column Count */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-base-content">最大列数</label>
        <input
          type="number"
          min="1"
          max="3"
          value={viewSettings.maxColumnCount || 2}
          onChange={(e) => updateViewSettings({ maxColumnCount: Number(e.target.value) })}
          className="input input-bordered input-sm w-full"
        />
      </div>
    </div>
  )

  // Color Panel Component
  const ColorPanel = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-base-content">主题</label>
        <div className="grid grid-cols-1 gap-2">
          <button
            className={clsx(
              'btn btn-sm justify-start',
              viewSettings.theme === 'light' ? 'btn-primary' : 'btn-ghost'
            )}
            onClick={() => updateViewSettings({ theme: 'light' })}
          >
            <BiSun className="w-4 h-4 mr-2" />
            浅色主题
          </button>
          <button
            className={clsx(
              'btn btn-sm justify-start',
              viewSettings.theme === 'dark' ? 'btn-primary' : 'btn-ghost'
            )}
            onClick={() => updateViewSettings({ theme: 'dark' })}
          >
            <BiMoon className="w-4 h-4 mr-2" />
            深色主题
          </button>
          <button
            className={clsx(
              'btn btn-sm justify-start',
              viewSettings.theme === 'sepia' ? 'btn-primary' : 'btn-ghost'
            )}
            onClick={() => updateViewSettings({ theme: 'sepia' })}
          >
            <TbSunMoon className="w-4 h-4 mr-2" />
            护眼主题
          </button>
        </div>
      </div>

      {/* Color Override */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={viewSettings.overrideColor || false}
            onChange={(e) => updateViewSettings({ overrideColor: e.target.checked })}
            className="checkbox checkbox-primary checkbox-sm"
          />
          <span className="text-sm">覆盖书籍颜色</span>
        </div>
      </div>

      {/* Dark Mode Image Invert */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={viewSettings.invertImgColorInDark || false}
            onChange={(e) => updateViewSettings({ invertImgColorInDark: e.target.checked })}
            className="checkbox checkbox-primary checkbox-sm"
          />
          <span className="text-sm">深色模式下反转图片颜色</span>
        </div>
      </div>
    </div>
  )

  // Settings Panel Renderer
  const renderSettingsPanel = () => {
    switch (activePanel) {
      case 'Font':
        return <FontPanel />
      case 'Layout':
        return <LayoutPanel />
      case 'Color':
        return <ColorPanel />
      case 'Control':
        return <div className="p-4 text-center text-base-content/60">行为设置面板</div>
      case 'Language':
        return <div className="p-4 text-center text-base-content/60">语言设置面板</div>
      case 'Custom':
        return <div className="p-4 text-center text-base-content/60">自定义设置面板</div>
      default:
        return <FontPanel />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Header Bar - 100% 匹配 readest HeaderBar */}
      <div className="titlebar bg-base-200 z-20 flex h-[44px] w-full items-center py-2 px-4 border-b border-base-300">
        {/* Left side - 三层结构 */}
        <div className="flex items-center space-x-3">
          {/* Layer 1: Back button */}
          <button
            onClick={handleBackToLibrary}
            className="btn btn-ghost h-7 min-h-7 w-7 p-0 rounded"
            aria-label="返回图书馆"
          >
            <MdArrowBackIosNew className="w-[16px] h-[16px]" />
          </button>

          {/* Layer 2: Sidebar toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="btn btn-ghost h-7 min-h-7 w-7 p-0 rounded"
            aria-label="切换侧边栏"
          >
            {isSidebarOpen ? (
              <TbLayoutSidebarFilled className="w-[16px] h-[16px]" />
            ) : (
              <TbLayoutSidebar className="w-[16px] h-[16px]" />
            )}
          </button>

          {/* Layer 3: Search */}
          <button
            onClick={toggleSearchBar}
            className="btn btn-ghost h-7 min-h-7 w-7 p-0 rounded"
            aria-label="搜索"
          >
            <FiSearch className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* Center - Book title */}
        <div className="flex-1 text-center">
          <h1 className="text-sm font-medium text-base-content truncate max-w-md mx-auto">
            {book.title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn btn-ghost h-7 min-h-7 w-7 p-0 rounded"
            aria-label="设置"
          >
            <MdOutlineMenu className="w-[16px] h-[16px]" />
          </button>

          <Dropdown
            className='exclude-title-bar-mousedown dropdown-bottom dropdown-end'
            buttonClassName='btn btn-ghost h-7 min-h-7 w-7 p-0 rounded'
            toggleButton={<PiDotsThreeVerticalBold className="w-[16px] h-[16px]" />}
          >
            <ViewMenuContent />
          </Dropdown>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div 
            className={clsx(
              'bg-base-100 border-r border-base-300 flex flex-col',
              isMobile ? 'absolute inset-y-0 left-0 z-10 w-full' : 'relative',
            )}
            style={{ 
              width: isMobile ? '100%' : sidebarWidth,
              top: isMobile ? '44px' : 'auto', // Offset by header height on mobile
            }}
          >
            {/* Sidebar Header */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-base-300 bg-base-50">
              <div className="flex items-center space-x-1">
                <button
                  className={clsx(
                    'tab tab-sm',
                    sidebarTab === 'toc' && 'tab-active'
                  )}
                  onClick={() => setSidebarTab('toc')}
                >
                  目录
                </button>
                <button
                  className={clsx(
                    'tab tab-sm',
                    sidebarTab === 'bookmarks' && 'tab-active'
                  )}
                  onClick={() => setSidebarTab('bookmarks')}
                >
                  书签
                </button>
                <button
                  className={clsx(
                    'tab tab-sm',
                    sidebarTab === 'annotations' && 'tab-active'
                  )}
                  onClick={() => setSidebarTab('annotations')}
                >
                  注释
                </button>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleSidebarPin}
                  className="btn btn-ghost btn-xs"
                  aria-label={isSidebarPinned ? '取消固定' : '固定侧边栏'}
                >
                  {isSidebarPinned ? (
                    <MdPushPin className="w-3 h-3" />
                  ) : (
                    <MdOutlinePushPin className="w-3 h-3" />
                  )}
                </button>
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="btn btn-ghost btn-xs"
                    aria-label="关闭侧边栏"
                  >
                    <MdArrowBackIosNew className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              {sidebarTab === 'toc' && bookDoc?.toc && (
                <TOCView bookKey={bookKey} toc={bookDoc.toc} />
              )}
              {sidebarTab === 'bookmarks' && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="text-base-content/60 mb-4">
                    <PiNotePencil className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">暂无书签</h3>
                    <p className="text-sm">点击添加书签来标记重要内容</p>
                  </div>
                </div>
              )}
              {sidebarTab === 'annotations' && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="text-base-content/60 mb-4">
                    <PiNotePencil className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">暂无注释</h3>
                    <p className="text-sm">选择文字添加注释和高亮</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Book Content */}
        <div className="flex-1 relative overflow-hidden">
          <FoliateViewer
            bookKey={bookKey}
            bookDoc={bookDoc}
            config={bookConfig}
            contentInsets={contentInsets}
          />
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="阅读器设置"
        className="settings-dialog"
      >
        <div className="flex h-[500px]">
          {/* Settings Tabs */}
          <div className="w-24 border-r border-base-300 bg-base-50">
            <div className="flex flex-col p-2 space-y-1">
              {tabConfig.map(({ tab, icon: Icon, label }) => (
                <button
                  key={tab}
                  onClick={() => handleSetActivePanel(tab)}
                  className={clsx(
                    'flex flex-col items-center justify-center p-3 rounded-lg text-xs transition-colors',
                    activePanel === tab 
                      ? 'bg-primary text-primary-content' 
                      : 'text-base-content/70 hover:bg-base-200'
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderSettingsPanel()}
          </div>
        </div>
      </Dialog>
    </div>
  )
} 