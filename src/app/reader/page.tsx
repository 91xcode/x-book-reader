'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RiArrowLeftLine, RiSettingsLine, RiMenuLine } from 'react-icons/ri'
import { IoIosList } from 'react-icons/io'
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
      <h1>The Great Gatsby</h1>
      <h2>Chapter 1</h2>
      <p>In my younger and more vulnerable years my father gave me some advice that I've carried with me ever since.</p>
      <p>"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had."</p>
      <p>He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.</p>
      <h2>Chapter 2</h2>
      <p>About half way between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land.</p>
      <p>This is a valley of ashes—a fantastic farm where ashes grow like wheat into ridges and hills and grotesque gardens...</p>
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

  return (
    <div 
      className="h-screen flex bg-base-100 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sidebar */}
      <div className={clsx(
        'flex-shrink-0 bg-base-200 border-r border-base-300 transition-all duration-300',
        isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center justify-between mb-3">
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleBackToLibrary}
              >
                <RiArrowLeftLine className="w-4 h-4" />
                Library
              </button>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setIsSidebarOpen(false)}
              >
                <RiMenuLine className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h2 className="font-semibold text-sm mb-1 line-clamp-1">{book.title}</h2>
              <p className="text-xs text-base-content/70 line-clamp-1">{book.author}</p>
            </div>
          </div>

          {/* Sidebar Tabs */}
          <div className="tabs tabs-boxed p-2 bg-base-200">
            <button 
              className={clsx('tab tab-sm flex-1', {
                'tab-active': sidebarTab === 'toc'
              })}
              onClick={() => setSidebarTab('toc')}
            >
              Contents
            </button>
            <button 
              className={clsx('tab tab-sm flex-1', {
                'tab-active': sidebarTab === 'bookmarks'
              })}
              onClick={() => setSidebarTab('bookmarks')}
            >
              Bookmarks
            </button>
            <button 
              className={clsx('tab tab-sm flex-1', {
                'tab-active': sidebarTab === 'annotations'
              })}
              onClick={() => setSidebarTab('annotations')}
            >
              Notes
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-auto">
            {sidebarTab === 'toc' && (
              <div className="p-2">
                {book.toc.map((item, index) => (
                  <div key={index} className="mb-1">
                    <button className="w-full text-left p-2 text-sm hover:bg-base-300 rounded transition-colors">
                      {item.label}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {sidebarTab === 'bookmarks' && (
              <div className="p-4 text-center text-base-content/60">
                <p className="text-sm">No bookmarks yet</p>
              </div>
            )}
            
            {sidebarTab === 'annotations' && (
              <div className="p-4 text-center text-base-content/60">
                <p className="text-sm">No annotations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className={clsx(
          'absolute top-0 left-0 right-0 z-10 bg-base-100/90 backdrop-blur-sm border-b border-base-300 transition-all duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-2">
              {!isSidebarOpen && (
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <IoIosList className="w-4 h-4" />
                </button>
              )}
              <span className="text-sm font-medium">{book.title}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setIsSettingsOpen(true)}
              >
                <RiSettingsLine className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-auto p-8 pt-16"
        >
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div dangerouslySetInnerHTML={{ __html: book.content }} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={clsx(
          'absolute bottom-0 left-0 right-0 z-10 bg-base-100/90 backdrop-blur-sm border-t border-base-300 transition-all duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-base-content/70">
                Chapter 1 of 5
              </span>
            </div>
            
            <div className="flex-1 max-w-md mx-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-base-content/60 whitespace-nowrap">
                  {progress}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="range range-sm flex-1"
                />
                <span className="text-xs text-base-content/60 whitespace-nowrap">
                  100%
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="btn btn-ghost btn-sm">
                ← Prev
              </button>
              <button className="btn btn-ghost btn-sm">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Reader Settings</h3>
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Font Settings */}
                <div>
                  <h4 className="font-medium mb-3">Font</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Font Size</span>
                      </label>
                      <input type="range" min="12" max="24" defaultValue="16" className="range range-sm" />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Line Height</span>
                      </label>
                      <input type="range" min="1" max="2" step="0.1" defaultValue="1.6" className="range range-sm" />
                    </div>
                  </div>
                </div>

                {/* Theme Settings */}
                <div>
                  <h4 className="font-medium mb-3">Theme</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="btn btn-outline btn-sm">Light</button>
                    <button className="btn btn-outline btn-sm">Dark</button>
                    <button className="btn btn-outline btn-sm">Sepia</button>
                  </div>
                </div>

                {/* Layout Settings */}
                <div>
                  <h4 className="font-medium mb-3">Layout</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Margins</span>
                      </label>
                      <input type="range" min="0" max="50" defaultValue="20" className="range range-sm" />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Columns</span>
                      </label>
                      <select className="select select-bordered select-sm w-full">
                        <option>Single</option>
                        <option>Double</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
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
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 