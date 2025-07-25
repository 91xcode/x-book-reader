'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RiArrowLeftLine, RiSettingsLine, RiMenuLine, RiFontSize, RiDashboardLine } from 'react-icons/ri'
import { IoIosList } from 'react-icons/io'
import { VscSymbolColor } from 'react-icons/vsc'
import { LiaHandPointerSolid } from 'react-icons/lia'
import { IoAccessibilityOutline } from 'react-icons/io5'
import { MdOutlineHeadphones as TTSIcon } from 'react-icons/md'
import { TbBoxMargin } from 'react-icons/tb'
import { RxLineHeight } from 'react-icons/rx'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import 'overlayscrollbars/overlayscrollbars.css'
import clsx from 'clsx'

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'toc' | 'bookmarks' | 'annotations'>('toc')
  const [progress, setProgress] = useState(45)
  const [isHovered, setIsHovered] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [margins, setMargins] = useState(20)
  const [theme, setTheme] = useState('light')
  const contentRef = useRef<HTMLDivElement>(null)

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

  return (
    <div 
      className="h-screen flex bg-base-100 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sidebar */}
      <div className={clsx(
        'sidebar-container flex-shrink-0 bg-base-200 border-r border-base-300 transition-all duration-300 z-20',
        isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-base-300 bg-base-200">
            <div className="flex items-center justify-between mb-3">
              <button
                className="btn btn-ghost btn-sm flex items-center gap-2 text-base-content/80 hover:text-base-content"
                onClick={handleBackToLibrary}
              >
                <RiArrowLeftLine className="w-4 h-4" />
                <span className="text-sm">Library</span>
              </button>
              <button
                className="sidebar-pin-btn btn btn-ghost btn-sm btn-circle"
                onClick={() => setIsSidebarOpen(false)}
              >
                <RiMenuLine className="w-4 h-4" />
              </button>
            </div>
            
            {/* Book Info Card */}
            <div className="bg-base-100 rounded-lg p-3 shadow-sm">
              <div className="flex gap-3">
                <div className="w-12 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-mono text-base-content/60 uppercase">
                    {book.format}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm mb-1 line-clamp-2 leading-tight">{book.title}</h2>
                  <p className="text-xs text-base-content/70 line-clamp-1 mb-2">{book.author}</p>
                  <div className="w-full bg-base-300 rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all" 
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-base-content/60 mt-1">
                    {book.progress}% complete
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                      <RiSettingsLine className="w-6 h-6 text-base-content/50" />
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
        {/* Top Bar */}
        <div className={clsx(
          'absolute top-0 left-0 right-0 z-10 bg-base-100/95 backdrop-blur-sm transition-all duration-300',
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        )}>
          <div className="flex items-center justify-between px-6 py-3 border-b border-base-300/50">
            <div className="flex items-center space-x-4">
              {!isSidebarOpen && (
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <IoIosList className="w-5 h-5" />
                </button>
              )}
              <div className="text-sm font-medium text-base-content/80 max-w-md truncate">
                {book.title}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setIsSettingsOpen(true)}
              >
                <RiSettingsLine className="w-5 h-5" />
              </button>
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

        {/* Bottom Bar */}
        <div className={clsx(
          'absolute bottom-0 left-0 right-0 z-10 bg-base-100/95 backdrop-blur-sm transition-all duration-300',
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden m-4 shadow-2xl">
            <div className="flex h-full">
              {/* Settings Sidebar */}
              <div className="w-48 bg-base-200 border-r border-base-300 flex-shrink-0">
                <div className="p-4 border-b border-base-300">
                  <h3 className="font-semibold text-base">Settings</h3>
                </div>
                <div className="p-2">
                  {[
                    { id: 'font', icon: RiFontSize, label: 'Font' },
                    { id: 'layout', icon: RiDashboardLine, label: 'Layout' },
                    { id: 'color', icon: VscSymbolColor, label: 'Color' },
                    { id: 'control', icon: LiaHandPointerSolid, label: 'Behavior' },
                    { id: 'custom', icon: IoAccessibilityOutline, label: 'Custom' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-base-300 rounded-lg transition-colors text-sm"
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold">Font Settings</h4>
                    <button
                      className="btn btn-ghost btn-sm btn-circle"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Font Size</label>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-base-content/70 w-8">12</span>
                        <input 
                          type="range" 
                          min="12" 
                          max="24" 
                          value={fontSize}
                          onChange={handleFontSizeChange}
                          className="range range-sm flex-1" 
                        />
                        <span className="text-sm text-base-content/70 w-8">24</span>
                        <span className="text-sm font-medium w-8">{fontSize}px</span>
                      </div>
                    </div>

                    {/* Line Height */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Line Height</label>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-base-content/70 w-8">1.0</span>
                        <input 
                          type="range" 
                          min="10" 
                          max="25" 
                          value={lineHeight * 10}
                          onChange={handleLineHeightChange}
                          className="range range-sm flex-1" 
                        />
                        <span className="text-sm text-base-content/70 w-8">2.5</span>
                        <span className="text-sm font-medium w-8">{lineHeight.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Margins */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Margins</label>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-base-content/70 w-8">0</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="80" 
                          value={margins}
                          onChange={handleMarginsChange}
                          className="range range-sm flex-1" 
                        />
                        <span className="text-sm text-base-content/70 w-8">80</span>
                        <span className="text-sm font-medium w-12">{margins}px</span>
                      </div>
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'sepia'].map((themeOption) => (
                          <button
                            key={themeOption}
                            className={clsx('btn btn-outline btn-sm', {
                              'btn-active': theme === themeOption
                            })}
                            onClick={() => setTheme(themeOption)}
                          >
                            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Font Family</label>
                      <select className="select select-bordered w-full">
                        <option>System Default</option>
                        <option>Georgia</option>
                        <option>Times New Roman</option>
                        <option>Arial</option>
                        <option>Helvetica</option>
                      </select>
                    </div>

                    {/* Layout Options */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Layout</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="btn btn-outline btn-sm">Single Column</button>
                        <button className="btn btn-outline btn-sm">Double Column</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-base-300">
                    <button 
                      className="btn btn-ghost"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      Apply Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 