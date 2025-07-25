'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GiBookshelf } from 'react-icons/gi'
import { FiSearch } from 'react-icons/fi'
import { MdOutlineMenu, MdOutlinePushPin, MdPushPin, MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md'
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

// Types for settings
export type SettingsPanelType = 'Font' | 'Layout' | 'Color' | 'Control' | 'Language' | 'Custom'

type TabConfig = {
  tab: SettingsPanelType
  icon: React.ElementType
  label: string
}

// Mock book data
const mockBookData = {
  '1': {
    hash: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    format: 'epub' as const,
    progress: 45,
    toc: [
      { label: 'Chapter 1', href: '#chapter1' },
      { label: 'Chapter 2', href: '#chapter2' },
      { label: 'Chapter 3', href: '#chapter3' },
      { label: 'Chapter 4', href: '#chapter4' },
      { label: 'Chapter 5', href: '#chapter5' },
    ],
    content: `
      <div class="prose prose-lg max-w-none">
        <h1>The Great Gatsby</h1>
        <h2>Chapter 1</h2>
        <p>In my younger and more vulnerable years my father gave me some advice that I've carried with me ever since.</p>
        <p>"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had."</p>
        <p>He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.</p>
        <h2>Chapter 2</h2>
        <p>About half way between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land.</p>
        <p>This is a valley of ashes—a fantastic farm where ashes grow like wheat into ridges and hills and grotesque gardens; where ashes take the forms of houses and chimneys and rising smoke and, finally, with a transcendent effort, of ash-gray men, who move dimly and already crumbling through the powdery air.</p>
        <p>Occasionally a line of gray cars crawls along an invisible track, gives out a ghastly creak, and comes to rest, and immediately the ash-gray men swarm up with leaden spades and stir up an impenetrable cloud, which screens their obscure operations from your sight.</p>
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

  const bookId = searchParams?.get('ids') || '1'
  const book = mockBookData[bookId as keyof typeof mockBookData]

  if (!book) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Book not found</h2>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/library')}
          >
            Back to Library
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
      label: 'Font',
    },
    {
      tab: 'Layout',
      icon: RiDashboardLine,
      label: 'Layout',
    },
    {
      tab: 'Color',
      icon: VscSymbolColor,
      label: 'Color',
    },
    {
      tab: 'Control',
      icon: LiaHandPointerSolid,
      label: 'Behavior',
    },
    {
      tab: 'Language',
      icon: RiTranslate,
      label: 'Language',
    },
    {
      tab: 'Custom',
      icon: IoAccessibilityOutline,
      label: 'Custom',
    },
  ]

  const handleSetActivePanel = (tab: SettingsPanelType) => {
    setActivePanel(tab)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastConfigPanel', tab)
    }
  }

  const handleResetCurrentPanel = () => {
    // Reset logic for current panel
    console.log('Reset panel:', activePanel)
  }

  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
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
          Book Details
        </button>
      </li>
      <li>
        <button className="text-sm">
          Export Highlights
        </button>
      </li>
      <li><div className="divider"></div></li>
      <li>
        <button className="text-sm">
          Remove Book
        </button>
      </li>
    </>
  )

  // View Menu Component (matching readest ViewMenu)
  const ViewMenu = () => (
    <>
      <li>
        <button 
          className="text-sm"
          onClick={() => setIsSettingsOpen(true)}
        >
          Reader Settings
        </button>
      </li>
      <li><div className="divider"></div></li>
      <li>
        <button className="text-sm">
          Single Page
        </button>
      </li>
      <li>
        <button className="text-sm">
          Double Page
        </button>
      </li>
      <li>
        <button className="text-sm">
          Continuous Scroll
        </button>
      </li>
    </>
  )

  // Dialog Menu Component (matching readest DialogMenu)
  const DialogMenu = () => (
    <>
      <li>
        <button 
          className="text-sm"
          onClick={handleResetCurrentPanel}
        >
          Reset {currentPanel?.label}
        </button>
      </li>
    </>
  )

  // Settings Panels Components
  const FontPanel = () => (
    <div className="my-4 w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2>Override Book Font</h2>
        <input
          type="checkbox"
          className="toggle"
          defaultChecked={false}
        />
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">Font Size</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>Default Font Size</span>
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
              <span>Minimum Font Size</span>
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
        <h2 className="mb-2 font-medium">Font Weight</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4 flex items-center justify-between">
            <span>Font Weight</span>
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
        <h2 className="mb-2 font-medium">Font Family</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4 flex items-center justify-between">
            <span>Default Font</span>
            <select className="select select-bordered select-sm w-40">
              <option>Serif Font</option>
              <option>Sans-Serif Font</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">Font Face</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>Serif Font</span>
              <select className="select select-bordered select-sm w-40">
                <option>Georgia</option>
                <option>Times New Roman</option>
                <option>Times</option>
              </select>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Sans-Serif Font</span>
              <select className="select select-bordered select-sm w-40">
                <option>Arial</option>
                <option>Helvetica</option>
                <option>Verdana</option>
              </select>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Monospace Font</span>
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

  const LayoutPanel = () => (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">Typography</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>Line Height</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-base-content/70 w-8">1.0</span>
                <input 
                  type="range" 
                  min="10" 
                  max="30" 
                  value={lineHeight * 10}
                  onChange={handleLineHeightChange}
                  className="range range-sm flex-1 w-32" 
                />
                <span className="text-sm text-base-content/70 w-8">3.0</span>
                <span className="text-sm font-medium w-12">{lineHeight.toFixed(1)}</span>
              </div>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Paragraph Margin</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-base-content/70 w-8">0</span>
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1"
                  defaultValue="1.0"
                  className="range range-sm flex-1 w-32" 
                />
                <span className="text-sm text-base-content/70 w-8">2.0</span>
                <span className="text-sm font-medium w-12">1.0em</span>
              </div>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Text Justification</span>
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
        <h2 className="mb-2 font-medium">Margins</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>Page Margins</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-base-content/70 w-8">0</span>
                <input 
                  type="range" 
                  min="0" 
                  max="120" 
                  value={margins}
                  onChange={handleMarginsChange}
                  className="range range-sm flex-1 w-32" 
                />
                <span className="text-sm text-base-content/70 w-8">120</span>
                <span className="text-sm font-medium w-12">{margins}px</span>
              </div>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Gap Between Pages</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-base-content/70 w-8">0</span>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  defaultValue="4"
                  className="range range-sm flex-1 w-32" 
                />
                <span className="text-sm text-base-content/70 w-8">20</span>
                <span className="text-sm font-medium w-12">4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">Page Layout</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>Max Column Count</span>
              <select className="select select-bordered select-sm w-32">
                <option>1</option>
                <option>2</option>
                <option>Auto</option>
              </select>
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Max Page Width</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-base-content/70 w-8">30</span>
                <input 
                  type="range" 
                  min="30" 
                  max="120" 
                  defaultValue="60"
                  className="range range-sm flex-1 w-32" 
                />
                <span className="text-sm text-base-content/70 w-8">120</span>
                <span className="text-sm font-medium w-12">60em</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const ColorPanel = () => (
    <div className="my-4 w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Theme Mode</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm btn-active">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C8.74,17.1 8.1,16.63 7.59,16.04C7.08,15.45 6.69,14.76 6.44,14C6.19,13.22 6.06,12.39 6.06,11.5C6.06,10.61 6.19,9.78 6.44,9C6.69,8.24 7.08,7.55 7.59,6.96C8.1,6.37 8.74,5.9 9.5,5.55C10.26,5.2 11.11,5 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
            </svg>
            Auto
          </button>
          <button className="btn btn-outline btn-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/>
            </svg>
            Light
          </button>
          <button className="btn btn-outline btn-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z"/>
            </svg>
            Dark
          </button>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">Color Themes</h2>
        <div className="grid grid-cols-4 gap-3">
          {['Default', 'Sepia', 'High Contrast', 'Blue'].map((themeOption) => (
            <button
              key={themeOption}
              className={clsx('btn btn-outline btn-sm h-12 flex-col gap-1', {
                'btn-active': theme === themeOption.toLowerCase()
              })}
              onClick={() => setTheme(themeOption.toLowerCase())}
            >
              <div className="w-6 h-3 bg-gradient-to-r from-primary to-secondary rounded-sm"></div>
              <span className="text-xs">{themeOption}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">Advanced</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>Override Book Colors</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Invert Images in Dark Mode</span>
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
        <h2 className="mb-2 font-medium">Navigation</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>Touch to Turn Pages</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Scroll to Turn Pages</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Arrow Keys Navigation</span>
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
        <h2 className="mb-2 font-medium">Interface</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>Show Header Bar</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Show Footer Bar</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Show Bars on Scroll</span>
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
        <h2 className="mb-2 font-medium">Interface Language</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4 flex items-center justify-between">
            <span>Language</span>
            <select className="select select-bordered select-sm w-40">
              <option>English</option>
              <option>中文 (简体)</option>
              <option>中文 (繁體)</option>
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
        <h2 className="mb-2 font-medium">Reading Direction</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4 flex items-center justify-between">
            <span>Force RTL Layout</span>
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
        <h2 className="mb-2 font-medium">Accessibility</h2>
        <div className="card border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item p-4 flex items-center justify-between">
              <span>High Contrast Mode</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Large Cursor</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
            <div className="config-item p-4 flex items-center justify-between">
              <span>Screen Reader Support</span>
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
        <h2 className="mb-2 font-medium">Custom CSS</h2>
        <div className="card border-base-200 border shadow">
          <div className="config-item p-4">
            <span className="block mb-2">Custom Styles</span>
            <textarea 
              className="textarea textarea-bordered w-full h-32" 
              placeholder="Enter custom CSS here..."
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

  const isHeaderVisible = hoveredBookKey === book.hash

  return (
    <div className="h-screen flex bg-base-100 relative">
      {/* Sidebar */}
      <div className={clsx(
        'sidebar-container flex-shrink-0 bg-base-200 transition-all duration-300 z-20',
        isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
      )}>
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
                placeholder="Search in book..."
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
                Contents
              </button>
              <button 
                className={clsx('tab tab-sm flex-1 text-xs', {
                  'tab-active': sidebarTab === 'bookmarks'
                })}
                onClick={() => setSidebarTab('bookmarks')}
              >
                Bookmarks
              </button>
              <button 
                className={clsx('tab tab-sm flex-1 text-xs', {
                  'tab-active': sidebarTab === 'annotations'
                })}
                onClick={() => setSidebarTab('annotations')}
              >
                Notes
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
                    <p className="text-sm text-base-content/60">No bookmarks yet</p>
                    <p className="text-xs text-base-content/50 mt-1">Tap to bookmark important pages</p>
                  </div>
                )}
                
                {sidebarTab === 'annotations' && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-base-300 rounded-lg flex items-center justify-center">
                      <FiSearch className="w-6 h-6 text-base-content/50" />
                    </div>
                    <p className="text-sm text-base-content/60">No annotations yet</p>
                    <p className="text-xs text-base-content/50 mt-1">Highlight text to create notes</p>
                  </div>
                )}
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header Bar - 100% match readest HeaderBar */}
        <div className="bg-base-100 absolute top-0 w-full">
          <div
            className="absolute top-0 z-10 h-11 w-full"
            onMouseEnter={() => setHoveredBookKey(book.hash)}
            onTouchStart={() => setHoveredBookKey(book.hash)}
          />
          <div
            className={clsx(
              'header-bar bg-base-100 absolute top-0 z-10 flex h-11 w-full items-center pr-4 pl-4',
              'shadow-xs transition-[opacity,margin-top] duration-300',
              isHeaderVisible ? 'pointer-events-auto visible' : 'pointer-events-none opacity-0',
            )}
            onMouseLeave={() => setHoveredBookKey(null)}
          >
            {/* Left side controls */}
            <div className="bg-base-100 sidebar-bookmark-toggler z-20 flex h-full items-center gap-x-4 pe-2">
              <div className="hidden sm:flex">
                {/* Sidebar Toggler */}
                <button
                  className="btn btn-ghost h-8 min-h-8 w-8 p-0"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <IoIosList className="w-[18px] h-[18px]" />
                </button>
              </div>
              {/* Bookmark Toggler */}
              <button className="btn btn-ghost h-8 min-h-8 w-8 p-0">
                <svg className="w-[18px] h-[18px] fill-base-content" viewBox="0 0 24 24">
                  <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z" />
                </svg>
              </button>
              {/* Translation Toggler */}
              <button className="btn btn-ghost h-8 min-h-8 w-8 p-0">
                <svg className="w-[18px] h-[18px] fill-base-content" viewBox="0 0 24 24">
                  <path d="M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07Z" />
                </svg>
              </button>
            </div>

            {/* Center title */}
            <div className="header-title z-15 bg-base-100 pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
              <h2 className="line-clamp-1 max-w-[50%] text-center text-xs font-semibold">
                {book.title}
              </h2>
            </div>

            {/* Right side controls */}
            <div className="bg-base-100 z-20 ml-auto flex h-full items-center space-x-4 ps-2">
              {/* Settings Toggler */}
              <button 
                className="btn btn-ghost h-8 min-h-8 w-8 p-0"
                onClick={() => setIsSettingsOpen(true)}
              >
                <svg className="w-[18px] h-[18px] fill-base-content" viewBox="0 0 24 24">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
              </button>
              {/* Notebook Toggler */}
              <button className="btn btn-ghost h-8 min-h-8 w-8 p-0">
                <svg className="w-[18px] h-[18px] fill-base-content" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </button>
              {/* View Menu */}
              <Dropdown
                className="exclude-title-bar-mousedown dropdown-bottom dropdown-end"
                buttonClassName="btn btn-ghost h-8 min-h-8 w-8 p-0"
                toggleButton={<PiDotsThreeVerticalBold className="w-[16px] h-[16px]" />}
              >
                <ViewMenu />
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-auto relative"
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
              <h2>Chapter 3</h2>
              <p>There was music from my neighbor's house through the summer nights. In his blue gardens men and girls came and went like moths among the whisperings and the champagne and the stars.</p>
              <p>At high tide in the afternoon I watched his guests diving from the tower of his raft, or taking the sun on the hot sand of his beach while his two motor-boats slit the waters of the Sound, drawing aquaplanes over cataracts of foam.</p>
              <p>On week-ends his Rolls-Royce became an omnibus, bearing parties to and from the city between nine in the morning and long past midnight, while his station wagon scampered like a brisk yellow bug to meet all trains.</p>
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
                <span>Chapter 1 of {book.toc.length}</span>
                <span>•</span>
                <span>Page 12 of 180</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="btn btn-ghost btn-sm">
                  ← Prev
                </button>
                <button className="btn btn-ghost btn-sm">
                  Next →
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
              <button className="btn btn-ghost btn-sm btn-circle" title="Table of Contents">
                <IoIosList className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle" title="Font Size">
                <RiFontSize className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle" title="Margins">
                <TbBoxMargin className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle" title="Line Height">
                <RxLineHeight className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle" title="Text to Speech">
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
                  className={clsx('dialog-tabs ms-1 flex h-10 w-full items-center gap-1 sm:ms-0')}
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