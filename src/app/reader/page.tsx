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

// Types for settings
export type SettingsPanelType = 'Font' | 'Layout' | 'Color' | 'Control' | 'Language' | 'Custom'

type TabConfig = {
  tab: SettingsPanelType
  icon: React.ElementType
  label: string
}

// Constants - matching readest
const MAX_SIDEBAR_WIDTH = 0.45 // 45% max width

// Mock book data
const mockBookData = {
  '1': {
    hash: '1',
    title: '了不起的盖茨比',
    author: 'F. Scott Fitzgerald',
    format: 'epub' as const,
    progress: 45,
    toc: [
      { label: '第一章', href: '#chapter1' },
      { label: '第二章', href: '#chapter2' },
      { label: '第三章', href: '#chapter3' },
      { label: '第四章', href: '#chapter4' },
      { label: '第五章', href: '#chapter5' },
    ],
    content: `
      <div class="prose prose-lg max-w-none">
        <h1>了不起的盖茨比</h1>
        <h2>第一章</h2>
        <p>在我年纪还轻、阅历不深的时候，我父亲教导过我一句话，我至今还念念不忘。</p>
        <p>"每逢你想要批评任何人的时候，"他对我说，"你就记住，这个世界上所有的人，并不是个个都有过你拥有的那些优越条件。"</p>
        <p>他没有再说别的话，但是我们俩在交往上一向不多说话，我明白他的意思很深。因此，我至今还是避免批评别人，这个习惯使得我结识了许多性格奇特的人，同时也成了不少讨厌鬼的受害者。</p>
        <h2>第二章</h2>
        <p>在西卵和纽约之间，汽车路匆匆忙忙地和铁路会合，沿着铁路跑一刻钟光景，为了避开一片荒凉的地区而临时离开铁路。</p>
        <p>这是一个灰烬的峡谷——一个离奇古怪的农场，在那里灰烬像麦子一样生长成小山和小丘，长成奇形怪状的花园，在那里灰烬构成房屋、烟囱、炊烟的形状，最后，在一阵超人的努力之下，构成灰蒙蒙的人形，他们在粉尘弥漫的空气中若隐若现地蠕动着，瞬即消失。</p>
        <p>时不时地一列灰蒙蒙的汽车沿着看不见的轨道爬行，发出可怕的轧轧声，停了下来，于是那些灰蒙蒙的人立刻蜂拥上来，挥舞着铅色的铁锹，搅起一阵不透明的尘土，把他们隐蔽的操作遮起来，不让你的眼睛看见。</p>
      </div>
    `
  }
}

export default function ReaderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarPinned, setIsSidebarPinned] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'toc' | 'bookmarks' | 'annotations'>('toc')
  const [progress, setProgress] = useState(45)
  const [hoveredBookKey, setHoveredBookKey] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [margins, setMargins] = useState(20)
  const [theme, setTheme] = useState('light')
  const contentRef = useRef<HTMLDivElement>(null)

  // Sidebar width state - matching readest
  const [sidebarWidth, setSidebarWidth] = useState('15%') // Default desktop width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

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

  // Layout settings state
  const [overrideLayout, setOverrideLayout] = useState(false)
  const [writingMode, setWritingMode] = useState<'auto' | 'horizontal-tb' | 'vertical-rl' | 'horizontal-rl'>('auto')
  const [paragraphMargin, setParagraphMargin] = useState(1.0)
  const [wordSpacing, setWordSpacing] = useState(0)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [textIndent, setTextIndent] = useState(0)
  const [fullJustification, setFullJustification] = useState(true)
  const [hyphenation, setHyphenation] = useState(false)
  const [marginTopPx, setMarginTopPx] = useState(44)
  const [marginBottomPx, setMarginBottomPx] = useState(44)
  const [marginLeftPx, setMarginLeftPx] = useState(20)
  const [marginRightPx, setMarginRightPx] = useState(20)
  const [gapPercent, setGapPercent] = useState(4)
  const [maxColumnCount, setMaxColumnCount] = useState(1)
  const [maxInlineSize, setMaxInlineSize] = useState(720)
  const [maxBlockSize, setMaxBlockSize] = useState(1200)
  const [doubleBorder, setDoubleBorder] = useState(false)
  const [borderColor, setBorderColor] = useState<'red' | 'black'>('red')

  const bookId = searchParams?.get('ids') || '1'
  const book = mockBookData[bookId as keyof typeof mockBookData]

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

  if (!book) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">未找到书籍</h2>
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

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value))
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(e.target.value))
  }

  const handleLineHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineHeight(Number(e.target.value) / 10)
  }

  const handleMarginsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMargins(Number(e.target.value))
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

  const handleResetCurrentPanel = () => {
    console.log('重置面板:', activePanel)
  }

  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
  }

  // ViewMenu functions
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50))
  const resetZoom = () => setZoomLevel(100)
  const toggleScrolledMode = () => setIsScrolledMode(!isScrolledMode)
  const cycleThemeMode = () => {
    const nextMode = themeMode === 'auto' ? 'light' : themeMode === 'light' ? 'dark' : 'auto'
    setThemeMode(nextMode)
  }

  // Effect to check button widths for label visibility - matching readest
  useEffect(() => {
    const container = tabsRef.current
    if (!container) return

    const checkButtonWidths = () => {
      const threshold = (container.clientWidth - 64) * 0.22
      const hideLabel = Array.from(container.querySelectorAll('button')).some((button) => {
        const labelSpan = button.querySelector('span')
        const labelText = labelSpan?.textContent || ''
        const clone = button.cloneNode(true) as HTMLButtonElement
        clone.style.position = 'absolute'
        clone.style.visibility = 'hidden'
        clone.style.width = 'auto'
        const cloneSpan = clone.querySelector('span')
        if (cloneSpan) {
          cloneSpan.classList.remove('hidden')
          cloneSpan.textContent = labelText
        }
        document.body.appendChild(clone)
        const fullWidth = clone.scrollWidth
        document.body.removeChild(clone)
        return fullWidth > threshold
      })
      setShowAllTabLabels(!hideLabel)
    }

    checkButtonWidths()

    const resizeObserver = new ResizeObserver(checkButtonWidths)
    resizeObserver.observe(container)
    const mutationObserver = new MutationObserver(checkButtonWidths)
    mutationObserver.observe(container, {
      subtree: true,
      characterData: true,
    })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  const currentPanel = tabConfig.find((tab) => tab.tab === activePanel)

  // Book Menu Component (matching readest BookMenu)
  const BookMenu = () => (
    <>
      <li>
        <button className="text-sm">
          书籍详情
        </button>
      </li>
      <li>
        <button className="text-sm">
          导出标注
        </button>
      </li>
      <li><div className="divider"></div></li>
      <li>
        <button className="text-sm">
          移除书籍
        </button>
      </li>
    </>
  )

  // View Menu Component - 100% matching readest ViewMenu
  const ViewMenuContent = () => (
    <div
      tabIndex={0}
      className={clsx(
        'view-menu dropdown-content dropdown-right no-triangle z-20 mt-1 border',
        'bgcolor-base-200 border-base-200 shadow-2xl',
      )}
      style={{
        maxWidth: `${typeof window !== 'undefined' ? window.innerWidth - 40 : 600}px`,
        marginRight: typeof window !== 'undefined' && window.innerWidth < 640 ? '-36px' : '0px',
      }}
    >
      {/* Zoom Controls */}
      <div className={clsx('flex items-center justify-between rounded-md')}>
        <button
          onClick={zoomOut}
          className={clsx(
            'hover:bg-base-300 text-base-content rounded-full p-2',
            zoomLevel <= 50 && 'btn-disabled text-gray-400',
          )}
        >
          <MdZoomOut />
        </button>
        <button
          className={clsx(
            'hover:bg-base-300 text-base-content h-8 min-h-8 w-[50%] rounded-md p-1 text-center',
          )}
          onClick={resetZoom}
        >
          {zoomLevel}%
        </button>
        <button
          onClick={zoomIn}
          className={clsx(
            'hover:bg-base-300 text-base-content rounded-full p-2',
            zoomLevel >= 200 && 'btn-disabled text-gray-400',
          )}
        >
          <MdZoomIn />
        </button>
      </div>

      <hr className='border-base-300 my-1' />

      <MenuItem label="字体与布局" shortcut="Shift+F" onClick={() => setIsSettingsOpen(true)} />

      <MenuItem
        label="滚动模式"
        shortcut="Shift+J"
        Icon={isScrolledMode ? MdCheck : undefined}
        onClick={toggleScrolledMode}
      />

      <hr className='border-base-300 my-1' />

      <MenuItem
        label="从未同步"
        Icon={MdSyncProblem}
        onClick={() => console.log('同步')}
      />

      <hr className='border-base-300 my-1' />

      <MenuItem label="全屏" onClick={() => console.log('全屏')} />
      
      <MenuItem
        label={
          themeMode === 'dark'
            ? '深色模式'
            : themeMode === 'light'
              ? '浅色模式'
              : '自动模式'
        }
        Icon={themeMode === 'dark' ? BiMoon : themeMode === 'light' ? BiSun : TbSunMoon}
        onClick={cycleThemeMode}
      />
      
      <MenuItem
        label="深色模式下反转图片"
        disabled={themeMode !== 'dark'}
        Icon={invertImgColorInDark ? MdCheck : undefined}
        onClick={() => setInvertImgColorInDark(!invertImgColorInDark)}
      />
    </div>
  )

  // Dialog Menu Component (matching readest DialogMenu)
  const DialogMenu = () => (
    <>
      <li>
        <button 
          className="text-sm"
          onClick={handleResetCurrentPanel}
        >
          重置 {currentPanel?.label}
        </button>
      </li>
    </>
  )

  const isHeaderVisible = hoveredBookKey === book.hash

  // Settings Panels Components
  const FontPanel = () => (
    <div className="my-4 w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2>覆盖书籍字体</h2>
        <input
          type="checkbox"
          className="toggle"
          defaultChecked={false}
        />
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字体大小</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>默认字体大小</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-base-content/70 w-8">12</span>
                <input 
                  type="range" 
                  min="12" 
                  max="120" 
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  className="range range-sm flex-1 w-32" 
                />
                <span className="text-sm text-base-content/70 w-8">120</span>
                <span className="text-sm font-medium w-12">{fontSize}px</span>
              </div>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>最小字体大小</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-base-content/70 w-8">1</span>
                <input 
                  type="range" 
                  min="1" 
                  max="120" 
                  defaultValue="12"
                  className="range range-sm flex-1 w-32" 
                />
                <span className="text-sm text-base-content/70 w-8">120</span>
                <span className="text-sm font-medium w-12">12px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字体粗细</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4 flex items-center justify-between">
            <span>字体粗细</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-base-content/70 w-8">100</span>
              <input 
                type="range" 
                min="100" 
                max="900" 
                step="100"
                defaultValue="400"
                className="range range-sm flex-1 w-32" 
              />
              <span className="text-sm text-base-content/70 w-8">900</span>
              <span className="text-sm font-medium w-12">400</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字体族</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4 flex items-center justify-between">
            <span>默认字体</span>
            <select className="select select-bordered select-sm w-40">
              <option>衬线字体</option>
              <option>无衬线字体</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字体样式</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>衬线字体</span>
              <select className="select select-bordered select-sm w-40">
                <option>宋体</option>
                <option>Times New Roman</option>
                <option>Georgia</option>
              </select>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>无衬线字体</span>
              <select className="select select-bordered select-sm w-40">
                <option>黑体</option>
                <option>Arial</option>
                <option>Helvetica</option>
              </select>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>等宽字体</span>
              <select className="select select-bordered select-sm w-40">
                <option>Monaco</option>
                <option>Consolas</option>
                <option>Courier New</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Layout Panel - 100% matching readest LayoutPanel
  const LayoutPanel = () => {
    const isVertical = writingMode.includes('vertical')
    const mightBeRTLBook = true // Simplified for demo
    
    return (
      <div className="my-4 w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2>覆盖书籍布局</h2>
          <input
            type="checkbox"
            className="toggle"
            checked={overrideLayout}
            onChange={() => setOverrideLayout(!overrideLayout)}
          />
        </div>

        {mightBeRTLBook && (
          <div className="flex items-center justify-between">
            <h2 className="font-medium">书写方向</h2>
            <div className="flex gap-4">
              <div className="lg:tooltip lg:tooltip-bottom" data-tip="默认">
                <button
                  className={`btn btn-ghost btn-circle btn-sm ${writingMode === 'auto' ? 'btn-active bg-base-300' : ''}`}
                  onClick={() => setWritingMode('auto')}
                >
                  <MdOutlineAutoMode />
                </button>
              </div>

              <div className="lg:tooltip lg:tooltip-bottom" data-tip="水平方向">
                <button
                  className={`btn btn-ghost btn-circle btn-sm ${writingMode === 'horizontal-tb' ? 'btn-active bg-base-300' : ''}`}
                  onClick={() => setWritingMode('horizontal-tb')}
                >
                  <MdOutlineTextRotationNone />
                </button>
              </div>

              <div className="lg:tooltip lg:tooltip-bottom" data-tip="垂直方向">
                <button
                  className={`btn btn-ghost btn-circle btn-sm ${writingMode === 'vertical-rl' ? 'btn-active bg-base-300' : ''}`}
                  onClick={() => setWritingMode('vertical-rl')}
                >
                  <MdTextRotateVertical />
                </button>
              </div>

              <div className="lg:tooltip lg:tooltip-bottom" data-tip="RTL 方向">
                <button
                  className={`btn btn-ghost btn-circle btn-sm ${writingMode === 'horizontal-rl' ? 'btn-active bg-base-300' : ''}`}
                  onClick={() => setWritingMode('horizontal-rl')}
                >
                  <TbTextDirectionRtl />
                </button>
              </div>
            </div>
          </div>
        )}

        {isVertical && (
          <div className="w-full">
            <h2 className="mb-2 font-medium">边框样式</h2>
            <div className="card bg-base-100 border-base-200 border shadow">
              <div className="divide-base-200 divide-y">
                <div className="config-item p-4 flex items-center justify-between">
                  <span>双重边框</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={doubleBorder}
                    onChange={() => setDoubleBorder(!doubleBorder)}
                  />
                </div>

                <div className="config-item p-4 flex items-center justify-between">
                  <span>边框颜色</span>
                  <div className="flex gap-4">
                    <button
                      className={`btn btn-circle btn-sm bg-red-300 hover:bg-red-500 ${borderColor === 'red' ? 'btn-active !bg-red-500' : ''}`}
                      onClick={() => setBorderColor('red')}
                    ></button>

                    <button
                      className={`btn btn-circle btn-sm bg-black/50 hover:bg-black ${borderColor === 'black' ? 'btn-active !bg-black' : ''}`}
                      onClick={() => setBorderColor('black')}
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          <h2 className="mb-2 font-medium">段落</h2>
          <div className="card bg-base-100 border-base-200 border shadow">
            <div className="divide-base-200 divide-y">
              <NumberInput
                label="段落间距"
                value={paragraphMargin}
                onChange={setParagraphMargin}
                min={0}
                max={4}
                step={0.2}
              />
              <NumberInput
                label="行间距"
                value={lineHeight}
                onChange={setLineHeight}
                min={1.0}
                max={3.0}
                step={0.1}
              />
              <NumberInput
                label="词间距"
                value={wordSpacing}
                onChange={setWordSpacing}
                min={-4}
                max={8}
                step={0.5}
              />
              <NumberInput
                label="字间距"
                value={letterSpacing}
                onChange={setLetterSpacing}
                min={-2}
                max={4}
                step={0.5}
              />
              <NumberInput
                label="文本缩进"
                value={textIndent}
                onChange={setTextIndent}
                min={-2}
                max={4}
                step={1}
              />
              <div className="config-item p-4 flex items-center justify-between">
                <span>两端对齐</span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={fullJustification}
                  onChange={() => setFullJustification(!fullJustification)}
                />
              </div>
              <div className="config-item p-4 flex items-center justify-between">
                <span>连字符</span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={hyphenation}
                  onChange={() => setHyphenation(!hyphenation)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <h2 className="mb-2 font-medium">页面</h2>
          <div className="card bg-base-100 border-base-200 border shadow">
            <div className="divide-base-200 divide-y">
              <NumberInput
                label="上边距 (px)"
                value={marginTopPx}
                onChange={setMarginTopPx}
                min={0}
                max={88}
                step={4}
              />
              <NumberInput
                label="下边距 (px)"
                value={marginBottomPx}
                onChange={setMarginBottomPx}
                min={0}
                max={88}
                step={4}
              />
              <NumberInput
                label="左边距 (px)"
                value={marginLeftPx}
                onChange={setMarginLeftPx}
                min={0}
                max={88}
                step={4}
              />
              <NumberInput
                label="右边距 (px)"
                value={marginRightPx}
                onChange={setMarginRightPx}
                min={0}
                max={88}
                step={4}
              />
              <NumberInput
                label="列间距 (%)"
                value={gapPercent}
                onChange={setGapPercent}
                min={0}
                max={30}
              />
              <NumberInput
                label="最大列数"
                value={maxColumnCount}
                onChange={setMaxColumnCount}
                min={1}
                max={4}
              />
              <NumberInput
                label={isVertical ? "最大列高" : "最大列宽"}
                value={maxInlineSize}
                onChange={setMaxInlineSize}
                disabled={maxColumnCount === 1 || isScrolledMode}
                min={400}
                max={9999}
                step={100}
              />
              <NumberInput
                label={isVertical ? "最大列宽" : "最大列高"}
                value={maxBlockSize}
                onChange={setMaxBlockSize}
                disabled={maxColumnCount === 1 || isScrolledMode}
                min={400}
                max={9999}
                step={100}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ColorPanel = () => (
    <div className="my-4 w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">主题模式</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm btn-active">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C8.74,17.1 8.1,16.63 7.59,16.04C7.08,15.45 6.69,14.76 6.44,14C6.19,13.22 6.06,12.39 6.06,11.5C6.06,10.61 6.19,9.78 6.44,9C6.69,8.24 7.08,7.55 7.59,6.96C8.1,6.37 8.74,5.9 9.5,5.55C10.26,5.2 11.11,5 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
            </svg>
            自动
          </button>
          <button className="btn btn-outline btn-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/>
            </svg>
            浅色
          </button>
          <button className="btn btn-outline btn-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z"/>
            </svg>
            深色
          </button>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">颜色主题</h2>
        <div className="grid grid-cols-4 gap-3">
          {[['默认', 'default'], ['棕褐色', 'sepia'], ['高对比度', 'contrast'], ['蓝色', 'blue']].map(([label, value]) => (
            <button
              key={value}
              className={clsx('btn btn-outline btn-sm h-12 flex-col gap-1', {
                'btn-active': theme === value
              })}
              onClick={() => setTheme(value)}
            >
              <div className="w-6 h-3 bg-gradient-to-r from-primary to-secondary rounded-sm"></div>
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">高级设置</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>覆盖书籍颜色</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>深色模式下反转图片</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const ControlPanel = () => (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">导航</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>触摸翻页</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>滚动翻页</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>方向键导航</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">界面</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>显示顶部栏</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>显示底部栏</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>滚动时显示栏</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const LanguagePanel = () => (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">界面语言</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4 flex items-center justify-between">
            <span>语言</span>
            <select className="select select-bordered select-sm w-40">
              <option>中文 (简体)</option>
              <option>中文 (繁體)</option>
              <option>English</option>
              <option>日本語</option>
              <option>한국어</option>
              <option>Français</option>
              <option>Deutsch</option>
              <option>Español</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">阅读方向</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4 flex items-center justify-between">
            <span>强制 RTL 布局</span>
            <input
              type="checkbox"
              className="toggle"
              defaultChecked={false}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const CustomPanel = () => (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">辅助功能</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>高对比度模式</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>大光标</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>屏幕阅读器支持</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">自定义 CSS</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4">
            <span className="block mb-2">自定义样式</span>
            <textarea 
              className="textarea textarea-bordered w-full h-32" 
              placeholder="在此输入自定义 CSS..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentPanel = () => {
    switch (activePanel) {
      case 'Font':
        return <FontPanel />
      case 'Layout':
        return <LayoutPanel />
      case 'Color':
        return <ColorPanel />
      case 'Control':
        return <ControlPanel />
      case 'Language':
        return <LanguagePanel />
      case 'Custom':
        return <CustomPanel />
      default:
        return <FontPanel />
    }
  }

  return (
    <div className="h-screen flex bg-base-100 relative">
      {/* Sidebar - 100% matching readest width */}
      <div className={clsx(
        'sidebar-container bg-base-200 z-20 flex min-w-60 select-none flex-col transition-all duration-300',
        !isSidebarPinned && 'shadow-2xl',
        isSidebarOpen ? 'flex' : 'hidden'
      )}
      style={{
        width: sidebarWidth,
        maxWidth: `${MAX_SIDEBAR_WIDTH * 100}%`,
        position: isSidebarPinned ? 'relative' : 'absolute',
      }}
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex h-10 w-full cursor-row-resize items-center justify-center">
            <div className="bg-base-content/50 h-1 w-10 rounded-full"></div>
          </div>
        )}
        
        <div className="h-full flex flex-col">
          {/* Sidebar Header - 100% match readest SidebarHeader */}
          <div className={clsx(
            'sidebar-header flex h-11 items-center justify-between pe-2 ps-1.5'
          )}>
            <div className="flex items-center gap-x-8">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="btn btn-ghost btn-circle flex h-6 min-h-6 w-6 hover:bg-transparent sm:hidden"
              >
                <MdArrowBackIosNew className="w-[22px] h-[22px]" />
              </button>
              <button
                className="btn btn-ghost hidden h-8 min-h-8 w-8 p-0 sm:flex"
                onClick={handleBackToLibrary}
              >
                <GiBookshelf className="fill-base-content" />
              </button>
            </div>
            <div className="flex min-w-24 max-w-32 items-center justify-between sm:w-[70%]">
              <button
                onClick={toggleSearchBar}
                className={clsx(
                  'btn btn-ghost left-0 h-8 min-h-8 w-8 p-0',
                  isSearchBarVisible ? 'bg-base-300' : '',
                )}
              >
                <FiSearch className="w-[18px] h-[18px] text-base-content" />
              </button>
              <Dropdown
                className="dropdown-bottom flex justify-center"
                buttonClassName="btn btn-ghost h-8 min-h-8 w-8 p-0"
                toggleButton={<MdOutlineMenu className="fill-base-content" />}
              >
                <BookMenu />
              </Dropdown>
              <div className="right-0 hidden h-8 w-8 items-center justify-center sm:flex">
                <button
                  onClick={toggleSidebarPin}
                  className={clsx(
                    'sidebar-pin-btn btn btn-ghost btn-circle hidden h-6 min-h-6 w-6 sm:flex',
                    isSidebarPinned ? 'bg-base-300' : 'bg-base-300/65',
                  )}
                >
                  {isSidebarPinned ? 
                    <MdPushPin className="w-[14px] h-[14px]" /> : 
                    <MdOutlinePushPin className="w-[14px] h-[14px]" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar (conditional) */}
          {isSearchBarVisible && (
            <div className="px-4 py-2 border-b border-base-300">
              <input
                type="text"
                placeholder="在书中搜索..."
                className="input input-sm w-full bg-base-100"
              />
            </div>
          )}

          {/* Sidebar Tabs */}
          <div className="px-4 py-2 border-b border-base-300">
            <div className="tabs tabs-boxed bg-base-300/50 p-1">
              <button 
                className={clsx('tab tab-sm flex-1 text-xs', {
                  'tab-active': sidebarTab === 'toc'
                })}
                onClick={() => setSidebarTab('toc')}
              >
                目录
              </button>
              <button 
                className={clsx('tab tab-sm flex-1 text-xs', {
                  'tab-active': sidebarTab === 'bookmarks'
                })}
                onClick={() => setSidebarTab('bookmarks')}
              >
                书签
              </button>
              <button 
                className={clsx('tab tab-sm flex-1 text-xs', {
                  'tab-active': sidebarTab === 'annotations'
                })}
                onClick={() => setSidebarTab('annotations')}
              >
                笔记
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            <OverlayScrollbarsComponent
              className="h-full"
              options={{ 
                scrollbars: { autoHide: 'scroll' }, 
                showNativeOverlaidScrollbars: false 
              }}
              defer
            >
              <div className="p-4">
                {sidebarTab === 'toc' && (
                  <div className="space-y-1">
                    {book.toc.map((item, index) => (
                      <button 
                        key={index} 
                        className="w-full text-left p-3 text-sm hover:bg-base-300 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <span className="text-base-content/90">{item.label}</span>
                        <span className="text-xs text-base-content/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          {Math.round((index + 1) / book.toc.length * 100)}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                
                {sidebarTab === 'bookmarks' && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-base-300 rounded-lg flex items-center justify-center">
                      <IoIosList className="w-6 h-6 text-base-content/50" />
                    </div>
                    <p className="text-sm text-base-content/60">暂无书签</p>
                    <p className="text-xs text-base-content/50 mt-1">点击添加书签到重要页面</p>
                  </div>
                )}
                
                {sidebarTab === 'annotations' && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-base-300 rounded-lg flex items-center justify-center">
                      <FiSearch className="w-6 h-6 text-base-content/50" />
                    </div>
                    <p className="text-sm text-base-content/60">暂无笔记</p>
                    <p className="text-xs text-base-content/50 mt-1">高亮文本来创建笔记</p>
                  </div>
                )}
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full">
        {/* Header Bar - 完全匹配 readest HeaderBar 结构 */}
        <div
          className={clsx('bg-base-100 absolute top-0 w-full')}
          style={{
            paddingTop: '0px',
          }}
        >
          <div
            className={clsx('absolute top-0 z-10 h-11 w-full')}
            onMouseEnter={() => setHoveredBookKey(book.hash)}
            onTouchStart={() => setHoveredBookKey(book.hash)}
          />
          <div
            className={clsx(
              'bg-base-100 absolute left-0 right-0 top-0 z-10',
              isHeaderVisible ? 'visible' : 'hidden',
            )}
            style={{
              height: '0px',
            }}
          />
          <div
            className={clsx(
              `header-bar bg-base-100 absolute top-0 z-10 flex h-11 w-full items-center pr-4`,
              `shadow-xs transition-[opacity,margin-top] duration-300`,
              'pl-4',
              isHeaderVisible ? 'pointer-events-auto visible' : 'pointer-events-none opacity-0',
            )}
            style={{
              marginTop: '0px',
            }}
            onMouseLeave={() => setHoveredBookKey(null)}
          >
            {/* Left side controls */}
            <div className='bg-base-100 sidebar-bookmark-toggler z-20 flex h-full items-center gap-x-4 pe-2'>
              <div className='hidden sm:flex'>
                {/* Sidebar Toggler */}
                <button
                  className="btn btn-ghost h-8 min-h-8 w-8 p-0"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  {isSidebarOpen ? (
                    <TbLayoutSidebarFilled className="w-[16px] h-[16px]" />
                  ) : (
                    <TbLayoutSidebar className="w-[16px] h-[16px]" />
                  )}
                </button>
              </div>
              {/* Bookmark Toggler */}
              <button className="btn btn-ghost h-8 min-h-8 w-8 p-0">
                <svg className="w-[16px] h-[16px] fill-base-content" viewBox="0 0 24 24">
                  <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z" />
                </svg>
              </button>
              {/* Translation Toggler */}
              <button className="btn btn-ghost h-8 min-h-8 w-8 p-0">
                <svg className="w-[16px] h-[16px] fill-base-content" viewBox="0 0 24 24">
                  <path d="M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07Z" />
                </svg>
              </button>
            </div>

            {/* Center title */}
            <div className='header-title z-15 bg-base-100 pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex'>
              <h2 className='line-clamp-1 max-w-[50%] text-center text-xs font-semibold'>
                {book.title}
              </h2>
            </div>

            {/* Right side controls */}
            <div className='bg-base-100 z-20 ml-auto flex h-full items-center space-x-4 ps-2'>
              {/* Settings Toggler */}
              <button 
                className="btn btn-ghost h-8 min-h-8 w-8 p-0"
                onClick={() => setIsSettingsOpen(true)}
              >
                <svg className="w-[16px] h-[16px] fill-base-content" viewBox="0 0 24 24">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
              </button>
              {/* Notebook Toggler */}
              <button className="btn btn-ghost h-8 min-h-8 w-8 p-0">
                <svg className="w-[16px] h-[16px] fill-base-content" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </button>
              {/* View Menu */}
              <Dropdown
                className='exclude-title-bar-mousedown dropdown-bottom dropdown-end'
                buttonClassName='btn btn-ghost h-8 min-h-8 w-8 p-0'
                toggleButton={<PiDotsThreeVerticalBold className="w-[16px] h-[16px]" />}
              >
                <ViewMenuContent />
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-auto relative"
          style={{ paddingTop: '44px' }}
        >
          <div 
            className="max-w-4xl mx-auto py-8 transition-all duration-200"
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              paddingLeft: `${margins}px`,
              paddingRight: `${margins}px`
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: book.content }} />
            
            {/* Add more content for scrolling demo */}
            <div className="mt-8 prose prose-lg max-w-none">
              <h2>第三章</h2>
              <p>整个夏天，我邻居家里一直有音乐声。在他蓝色的花园里，男男女女像飞蛾一样在交头接耳的声音、香槟酒和繁星之间来回穿梭。</p>
              <p>下午涨潮的时候，我看着他的客人从他筏子上的高塔跳水，或者在他海滩的热沙上晒太阳，而他的两艘汽艇在海湾的水面上破浪前进，拖着滑水板越过层层泡沫。</p>
              <p>周末他的劳斯莱斯成了公共汽车，在早上九点到深夜之间往返于城里，运送一批批的客人，而他的旅行车像一只轻快的黄色甲虫一样忙碌地跑来跑去，接送各班火车。</p>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className={clsx(
          'absolute bottom-0 left-0 right-0 z-10 bg-base-100/95 backdrop-blur-sm transition-all duration-300',
          isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        )}>
          <div className="border-t border-base-300/50 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-sm text-base-content/70">
                <span>第 1 章，共 {book.toc.length} 章</span>
                <span>•</span>
                <span>第 12 页，共 180 页</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="btn btn-ghost btn-sm">
                  ← 上一页
                </button>
                <button className="btn btn-ghost btn-sm">
                  下一页 →
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-4">
              <span className="text-xs text-base-content/60 whitespace-nowrap">
                0%
              </span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="range range-sm w-full"
                />
              </div>
              <span className="text-xs text-base-content/60 whitespace-nowrap">
                100%
              </span>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center justify-center space-x-6 mt-3 pt-3 border-t border-base-300/30">
              <button className="btn btn-ghost btn-sm btn-circle" title="目录">
                <IoIosList className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle" title="字体大小">
                <RiFontSize className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle" title="边距">
                <TbBoxMargin className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle" title="行高">
                <RxLineHeight className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle" title="语音朗读">
                <TTSIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog - 100% match readest SettingsDialog */}
      {isSettingsOpen && (
        <Dialog
          isOpen={isSettingsOpen}
          onClose={handleCloseSettings}
          className="modal-open"
          boxClassName={clsx('sm:min-w-[520px] sm:max-w-[90%] sm:w-3/4')}
          header={
            <div className="flex w-full flex-col items-center">
              <div className="tab-title flex pb-2 text-base font-semibold sm:hidden">
                {currentPanel?.label || ''}
              </div>
              <div className="flex w-full flex-row items-center justify-between">
                <button
                  tabIndex={-1}
                  onClick={handleCloseSettings}
                  className="btn btn-ghost btn-circle flex h-8 min-h-8 w-8 hover:bg-transparent focus:outline-none sm:hidden"
                >
                  {isRtl ? <MdArrowForwardIos /> : <MdArrowBackIosNew />}
                </button>
                <div
                  ref={tabsRef}
                  className={clsx('dialog-tabs ms-1 flex h-10 w-full items-center gap-1 sm:ms-0 justify-center')}
                >
                  {tabConfig.map(({ tab, icon: Icon, label }) => (
                    <button
                      key={tab}
                      data-tab={tab}
                      className={clsx(
                        'btn btn-ghost text-base-content btn-sm gap-1 px-2',
                        activePanel === tab ? 'btn-active' : '',
                      )}
                      onClick={() => handleSetActivePanel(tab)}
                    >
                      <Icon className="mr-0" />
                      <span
                        className={clsx(
                          typeof window !== 'undefined' && window.innerWidth < 640 && 'hidden',
                          !(showAllTabLabels || activePanel === tab) && 'hidden',
                        )}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex h-full items-center justify-end gap-x-2">
                  <Dropdown
                    className="dropdown-bottom dropdown-end"
                    buttonClassName="btn btn-ghost h-8 min-h-8 w-8 p-0 flex items-center justify-center"
                    toggleButton={<PiDotsThreeVerticalBold />}
                  >
                    <DialogMenu />
                  </Dropdown>
                  <button
                    onClick={handleCloseSettings}
                    className="bg-base-300/65 btn btn-ghost btn-circle hidden h-6 min-h-6 w-6 p-0 sm:flex"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        >
          {renderCurrentPanel()}
        </Dialog>
      )}
    </div>
  )
} 