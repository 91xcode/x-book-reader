'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { GiBookshelf } from 'react-icons/gi'
import { MdOutlineMenu, MdOutlinePushPin, MdPushPin, MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md'
import { FiSearch } from 'react-icons/fi'
import { PiDotsThreeVerticalBold, PiNotePencil } from 'react-icons/pi'
import { TbLayoutSidebar, TbLayoutSidebarFilled, TbSunMoon } from 'react-icons/tb'
import { IoLibrary } from 'react-icons/io5'
import { BiSun, BiMoon } from 'react-icons/bi'
import { BsFillCircleFill } from 'react-icons/bs'
import { RiArrowLeftSLine, RiArrowRightSLine, RiArrowGoBackLine, RiArrowGoForwardLine } from 'react-icons/ri'
import { RiArrowLeftDoubleLine, RiArrowRightDoubleLine, RiFontSize, RiTranslateAi } from 'react-icons/ri'
import { FaHeadphones } from 'react-icons/fa6'
import { IoIosList as TOCIcon } from 'react-icons/io'
import { RxSlider as SliderIcon } from 'react-icons/rx'
import { RiFontFamily as FontIcon } from 'react-icons/ri'
import { MdOutlineHeadphones as TTSIcon, MdOutlineBookmarkAdd, MdOutlineBookmark } from 'react-icons/md'
import { MdZoomOut, MdZoomIn, MdCheck, MdSync, MdSyncProblem } from 'react-icons/md'
import { LuNotebookPen } from 'react-icons/lu'

import { BookServiceV2 } from '@/services/BookServiceV2'
import { DocumentLoader } from '@/libs/document'
import { Book } from '@/types/book'
import Spinner from '@/components/ui/Spinner'
import Dropdown from '@/components/ui/Dropdown'

// Import foliate-js types
declare global {
  interface Window {
    createReader: any
  }
}

interface ViewSettings {
  fontSize: number
  fontFamily: string
  lineHeight: number
  theme: 'light' | 'dark' | 'sepia'
  layout: 'paginated' | 'scrolled'
  gap: number
  maxColumnWidth: number
  maxInlineSize: number
  maxBlockSize: number
  overrideColor: boolean
  invertImgColorInDark: boolean
}

interface SidebarTab {
  id: 'toc' | 'bookmarks' | 'annotations'
  label: string
}

const sidebarTabs: SidebarTab[] = [
  { id: 'toc', label: '目录' },
  { id: 'bookmarks', label: '书签' },
  { id: 'annotations', label: '注释' }
]

// TOC Component
const TOCView: React.FC<{ bookKey: string; toc: any[] }> = ({ bookKey, toc }) => {
  if (!toc || toc.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-base-content/60 mb-4">
          <IoLibrary className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无目录</h3>
          <p className="text-sm">这本书没有可用的目录信息</p>
        </div>
      </div>
    )
  }

  return (
    <div className="toc-view p-4">
      {toc.map((item, index) => (
        <div key={index} className="toc-item mb-2">
          <button 
            className="text-left w-full p-2 text-sm hover:bg-base-200 rounded transition-colors"
            style={{ paddingLeft: `${(item.level || 0) * 16 + 8}px` }}
          >
            {item.label || `第${index + 1}章`}
          </button>
        </div>
      ))}
    </div>
  )
}

// Sidebar Component (独立组件，参考readest)
const SideBar: React.FC<{ 
  isVisible: boolean
  onGoToLibrary: () => void
  onClose: () => void
  book: Book
  bookDoc: any
}> = ({ isVisible, onGoToLibrary, onClose, book, bookDoc }) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks' | 'annotations'>('toc')
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  if (!isVisible) return null

  const toggleSearchBar = () => setIsSearchBarVisible(!isSearchBarVisible)
  const togglePin = () => setIsPinned(!isPinned)

  return (
    <div className="sidebar-container bg-base-200 flex min-w-60 select-none flex-col h-full border-r border-base-300" style={{ width: '15%', maxWidth: '45%' }}>
      {/* Sidebar Header - 完全参考readest的sidebar header */}
      <div className="sidebar-header flex h-11 items-center justify-between pe-2 ps-1.5">
        <div className="flex items-center gap-x-8">
          {/* 移动端关闭按钮 */}
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle flex h-6 min-h-6 w-6 hover:bg-transparent sm:hidden"
          >
            <MdArrowBackIosNew className="w-5 h-5" />
          </button>
          
          {/* 桌面端返回图书馆按钮 */}
          <button
            className="btn btn-ghost hidden h-8 min-h-8 w-8 p-0 sm:flex"
            onClick={onGoToLibrary}
          >
            <GiBookshelf className="fill-base-content" />
          </button>
        </div>
        
        <div className="flex min-w-24 max-w-32 items-center justify-between sm:w-[70%]">
          <button
            onClick={toggleSearchBar}
            className={clsx(
              'btn btn-ghost h-8 min-h-8 w-8 p-0',
              isSearchBarVisible ? 'bg-base-300' : ''
            )}
          >
            <FiSearch className="w-4 h-4 text-base-content" />
          </button>
          
          <Dropdown
            className="dropdown-bottom flex justify-center"
            buttonClassName="btn btn-ghost h-8 min-h-8 w-8 p-0"
            toggleButton={<MdOutlineMenu className="w-4 h-4 fill-base-content" />}
          >
            <div className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>书籍信息</a></li>
              <li><a>导出注释</a></li>
              <li><a>重新加载</a></li>
            </div>
          </Dropdown>
          
          <div className="right-0 hidden h-8 w-8 items-center justify-center sm:flex">
            <button
              onClick={togglePin}
              className="btn btn-ghost h-8 min-h-8 w-8 p-0 sidebar-pin-btn"
              aria-label={isPinned ? '取消固定' : '固定侧边栏'}
            >
              {isPinned ? (
                <MdPushPin className="w-4 h-4" />
              ) : (
                <MdOutlinePushPin className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-base-300 bg-base-100">
        {sidebarTabs.map(tab => (
          <button
            key={tab.id}
            className={clsx(
              'flex-1 py-2 px-4 text-sm font-medium text-center',
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-base-content/70 hover:text-base-content hover:bg-base-100'
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'toc' && bookDoc?.toc && (
          <TOCView bookKey={book.hash} toc={bookDoc.toc} />
        )}
        {activeTab === 'bookmarks' && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-base-content/60 mb-4">
              <PiNotePencil className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无书签</h3>
              <p className="text-sm">点击添加书签来标记重要内容</p>
            </div>
          </div>
        )}
        {activeTab === 'annotations' && (
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
  )
}

// FooterBar Component - 完全参考readest
const FooterBar: React.FC<{ 
  book: Book
  onOpenSettings: () => void
  isVisible: boolean
  onSetHoveredBookKey: (key: string) => void
}> = ({ book, onOpenSettings, isVisible, onSetHoveredBookKey }) => {
  const [actionTab, setActionTab] = useState('')
  const [progress, setProgress] = useState(0)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  const handleSetActionTab = (tab: string) => {
    setActionTab(actionTab === tab ? '' : tab)
  }

  const handleProgressChange = (value: number) => {
    setProgress(value)
    // TODO: 实际的页面跳转逻辑
  }

  return (
    <>
      {/* 悬停检测层 - 参考readest的实现 */}
      <div 
        className="absolute bottom-0 left-0 z-10 hidden w-full sm:flex sm:h-[52px]"
        onMouseEnter={() => !isMobile && onSetHoveredBookKey(book.hash)}
        onTouchStart={() => !isMobile && onSetHoveredBookKey(book.hash)}
      />
      
      {/* FooterBar主体 */}
      <div 
        className={clsx(
          'footer-bar shadow-xs absolute bottom-0 z-50 flex w-full flex-col',
          'sm:h-[52px] sm:justify-center',
          'sm:bg-base-100 border-base-300/50 border-t sm:border-none',
          'transition-[opacity,transform] duration-300',
          isVisible
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0 sm:translate-y-0'
        )}
        onMouseLeave={() => window.innerWidth >= 640 && onSetHoveredBookKey('')}
        aria-hidden={!isVisible}
      >
        {/* 移动端底部栏 */}
        <div className="bg-base-100 z-50 mt-auto flex w-full justify-between px-8 py-4 sm:hidden">
          <button
            className="btn btn-ghost h-10 w-10 p-0"
            onClick={() => handleSetActionTab('toc')}
          >
            <TOCIcon className="w-6 h-6" />
          </button>
          <button
            className="btn btn-ghost h-10 w-10 p-0"
            onClick={() => handleSetActionTab('note')}
          >
            <PiNotePencil className="w-6 h-6" />
          </button>
          <button
            className="btn btn-ghost h-10 w-10 p-0"
            onClick={() => handleSetActionTab('progress')}
          >
            <SliderIcon className={clsx('w-6 h-6', actionTab === 'progress' && 'text-blue-500')} />
          </button>
          <button
            className="btn btn-ghost h-10 w-10 p-0"
            onClick={() => handleSetActionTab('font')}
          >
            <FontIcon className={clsx('w-6 h-6', actionTab === 'font' && 'text-blue-500')} />
          </button>
          <button
            className="btn btn-ghost h-10 w-10 p-0"
            onClick={() => handleSetActionTab('tts')}
          >
            <TTSIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 桌面端底部栏 */}
        <div className="absolute hidden h-full w-full items-center gap-x-4 px-4 sm:flex">
          <button
            className="btn btn-ghost h-8 w-8 p-0"
            title="上一章节"
          >
            <RiArrowLeftDoubleLine className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 w-8 p-0"
            title="上一页"
          >
            <RiArrowLeftSLine className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 w-8 p-0"
            title="后退"
          >
            <RiArrowGoBackLine className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 w-8 p-0"
            title="前进"
          >
            <RiArrowGoForwardLine className="w-4 h-4" />
          </button>
          
          <span className="mx-2 text-center text-sm">
            {Math.round(progress)}%
          </span>
          
          <input
            type="range"
            className="text-base-content mx-2 w-full"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
          />
          
          <button
            className="btn btn-ghost h-8 w-8 p-0"
            title="朗读"
          >
            <FaHeadphones className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}

// Book Reader Component (包含HeaderBar和内容)
const BookReader: React.FC<{ 
  book: Book
  bookDoc: any
  onCloseBook: () => void
  onOpenSettings: () => void
  isSidebarVisible: boolean
  onToggleSidebar: () => void
}> = ({ book, bookDoc, onCloseBook, onOpenSettings, isSidebarVisible, onToggleSidebar }) => {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [hoveredBookKey, setHoveredBookKey] = useState<string | null>(null)
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    fontSize: 16,
    fontFamily: 'serif',
    lineHeight: 1.6,
    theme: 'light',
    layout: 'paginated',
    gap: 48,
    maxColumnWidth: 720,
    maxInlineSize: 800,
    maxBlockSize: 600,
    overrideColor: false,
    invertImgColorInDark: false
  })

  // 添加dropdown状态，影响HeaderBar可见性
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const isHeaderVisible = hoveredBookKey === book.hash || isDropdownOpen
  const isFooterVisible = hoveredBookKey === book.hash
  
  // 检查是否是移动端
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 640 || window.innerHeight < 640)
  
  // Toggle states for header controls
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [translationEnabled, setTranslationEnabled] = useState(false)
  const [notebookVisible, setNotebookVisible] = useState(false)
  
  // ViewMenu states
  const [isScrolledMode, setIsScrolledMode] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [themeMode, setThemeMode] = useState<'auto' | 'light' | 'dark'>('auto')
  const [invertImgColorInDark, setInvertImgColorInDark] = useState(false)

  // ViewMenu Content - 完全参考readest
  const ViewMenuContent = () => (
    <div className="view-menu dropdown-content no-triangle z-20 mt-1 border bg-base-200 border-base-200 shadow-2xl rounded-md p-3" style={{ maxWidth: '280px' }}>
      {/* 缩放控制 */}
      <div className="flex items-center justify-between rounded-md mb-2">
        <button
          onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 50))}
          className="hover:bg-base-300 text-base-content rounded-full p-2"
          disabled={zoomLevel <= 50}
        >
          <MdZoomOut />
        </button>
        <button
          className="hover:bg-base-300 text-base-content h-8 min-h-8 w-[50%] rounded-md p-1 text-center"
          onClick={() => setZoomLevel(100)}
        >
          {zoomLevel}%
        </button>
        <button
          onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 200))}
          className="hover:bg-base-300 text-base-content rounded-full p-2"
          disabled={zoomLevel >= 200}
        >
          <MdZoomIn />
        </button>
      </div>

      <hr className="border-base-300 my-1" />

      {/* 字体和布局 */}
      <div className="hover:bg-base-300 rounded px-3 py-2 cursor-pointer" onClick={onOpenSettings}>
        <span className="text-sm">字体和布局</span>
        <span className="float-right text-xs text-base-content/60">Shift+F</span>
      </div>

      {/* 滚动模式 */}
      <div className="hover:bg-base-300 rounded px-3 py-2 cursor-pointer" onClick={() => setIsScrolledMode(!isScrolledMode)}>
        <span className="text-sm">滚动模式</span>
        {isScrolledMode && <MdCheck className="float-right mt-0.5" />}
        <span className="float-right text-xs text-base-content/60 mr-6">Shift+J</span>
      </div>

      <hr className="border-base-300 my-1" />

      {/* 同步状态 */}
      <div className="hover:bg-base-300 rounded px-3 py-2 cursor-pointer">
        <MdSync className="inline mr-2" />
        <span className="text-sm">从未同步</span>
      </div>

      <hr className="border-base-300 my-1" />

      {/* 主题模式 */}
      <div className="hover:bg-base-300 rounded px-3 py-2 cursor-pointer" onClick={() => {
        const nextMode = themeMode === 'auto' ? 'light' : themeMode === 'light' ? 'dark' : 'auto'
        setThemeMode(nextMode)
      }}>
        {themeMode === 'dark' ? <BiMoon className="inline mr-2" /> : 
         themeMode === 'light' ? <BiSun className="inline mr-2" /> : 
         <TbSunMoon className="inline mr-2" />}
        <span className="text-sm">
          {themeMode === 'dark' ? '深色模式' : themeMode === 'light' ? '浅色模式' : '自动模式'}
        </span>
      </div>

      {/* 深色模式下反转图片 */}
      <div className="hover:bg-base-300 rounded px-3 py-2 cursor-pointer" onClick={() => setInvertImgColorInDark(!invertImgColorInDark)}>
        <span className="text-sm">深色模式下反转图片</span>
        {invertImgColorInDark && <MdCheck className="float-right mt-0.5" />}
      </div>
    </div>
  )

  return (
    <div className="book-reader relative h-full w-full overflow-hidden bg-base-100">
      {/* HeaderBar - 完全参考readest的HeaderBar */}
      <div className="bg-base-100 relative">
        {/* 悬停检测层 - 参考readest的实现 */}
        <div 
          className="absolute top-0 z-10 h-11 w-full"
          onMouseEnter={() => !isMobile && setHoveredBookKey(book.hash)}
          onTouchStart={() => !isMobile && setHoveredBookKey(book.hash)}
        />
        
        {/* 实际的Header内容 */}
        <div 
          className={clsx(
            'header-bar bg-base-100 relative z-10 flex h-11 w-full items-center pr-4 pl-4 border-b border-base-300',
            'transition-[opacity] duration-300',
            isHeaderVisible ? 'pointer-events-auto visible opacity-100' : 'pointer-events-none opacity-0',
            isDropdownOpen && 'header-bar-pinned'
          )}
          onMouseLeave={() => !isMobile && setHoveredBookKey('')}
        >
          {/* 左侧区域 - 参考readest的sidebar-bookmark-toggler */}
          <div className="bg-base-100 sidebar-bookmark-toggler z-20 flex h-full items-center gap-x-4 pe-2">
            {/* SidebarToggler - 桌面端隐藏 */}
            <div className="hidden sm:flex">
              <button
                className="btn btn-ghost h-8 min-h-8 w-8 p-0"
                onClick={onToggleSidebar}
                title="侧边栏"
              >
                {isSidebarVisible ? (
                  <TbLayoutSidebarFilled className="w-4 h-4 text-base-content" />
                ) : (
                  <TbLayoutSidebar className="w-4 h-4 text-base-content" />
                )}
              </button>
            </div>
            
            {/* BookmarkToggler */}
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={() => {
                console.log('书签按钮被点击，当前状态:', isBookmarked)
                setIsBookmarked(!isBookmarked)
                // 在移动端时隐藏header
                if (isMobile) {
                  setHoveredBookKey('')
                }
              }}
              title="书签"
            >
              {isBookmarked ? (
                <MdOutlineBookmark className="w-4 h-4 text-base-content" />
              ) : (
                <MdOutlineBookmarkAdd className="w-4 h-4 text-base-content" />
              )}
            </button>
            
            {/* TranslationToggler */}
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={() => {
                console.log('翻译按钮被点击，当前状态:', translationEnabled)
                setTranslationEnabled(!translationEnabled)
                // 在移动端时隐藏header
                if (isMobile) {
                  setHoveredBookKey('')
                }
              }}
              title="翻译"
            >
              <RiTranslateAi className={clsx('w-4 h-4', translationEnabled ? 'text-blue-500' : 'text-base-content')} />
            </button>
          </div>

          {/* 中间标题 - 绝对定位居中，参考readest的header-title */}
          <div className="header-title z-15 bg-base-100 pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
            <h2 className="line-clamp-1 max-w-[50%] text-center text-xs font-semibold">
              {book.title}
            </h2>
          </div>

          {/* 右侧区域 - 参考readest的ml-auto结构 */}
          <div className="bg-base-100 z-20 ml-auto flex h-full items-center space-x-4 ps-2">
            {/* SettingsToggler */}
            <button
              onClick={() => {
                console.log('设置按钮被点击')
                setHoveredBookKey('')
                onOpenSettings()
              }}
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              title="字体和布局"
            >
              <RiFontSize className="w-4 h-4 text-base-content" />
            </button>

            {/* NotebookToggler */}
            <button
              onClick={() => {
                console.log('笔记本按钮被点击，当前状态:', notebookVisible)
                setNotebookVisible(!notebookVisible)
                // 在移动端时隐藏header
                if (isMobile) {
                  setHoveredBookKey('')
                }
              }}
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              title="笔记本"
            >
              <LuNotebookPen className={clsx('w-4 h-4', notebookVisible ? 'text-blue-500' : 'text-base-content')} />
            </button>

            {/* ViewMenu Dropdown */}
            <Dropdown
              className='exclude-title-bar-mousedown dropdown-bottom dropdown-end'
              buttonClassName='btn btn-ghost h-8 min-h-8 w-8 p-0'
              toggleButton={<PiDotsThreeVerticalBold className="w-4 h-4" />}
            >
              <ViewMenuContent />
            </Dropdown>

            {/* WindowButtons - 关闭按钮 */}
            <button
              onClick={onCloseBook}
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              title="关闭"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Book Content */}
      <div className="flex-1 h-[calc(100%-44px-52px)] relative">
        <div 
          ref={viewerRef}
          className="foliate-viewer w-full h-full"
          style={{
            fontSize: `${viewSettings.fontSize}px`,
            fontFamily: viewSettings.fontFamily,
            lineHeight: viewSettings.lineHeight.toString()
          }}
        >
          {/* Foliate viewer will be rendered here */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">正在加载书籍内容...</h3>
              <p className="text-sm text-base-content/60">请稍候</p>
            </div>
          </div>
        </div>
      </div>

      {/* FooterBar */}
      <FooterBar 
        book={book} 
        onOpenSettings={onOpenSettings} 
        isVisible={isFooterVisible}
        onSetHoveredBookKey={setHoveredBookKey}
      />
    </div>
  )
}

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
        <Spinner />
      </div>
    )
  }

  // ReaderContent - 参考readest的架构
  return (
    <div className="reader-content flex h-screen bg-base-100">
      {/* SideBar - 独立组件 */}
      <SideBar 
        isVisible={isSidebarVisible}
        onGoToLibrary={handleBackToLibrary}
        onClose={() => setIsSidebarVisible(false)}
        book={book}
        bookDoc={bookDoc}
      />
      
      {/* BookReader - 独立组件 */}
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