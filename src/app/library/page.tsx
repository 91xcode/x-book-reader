'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaSearch } from 'react-icons/fa'
import { PiPlus, PiSelectionAllDuotone, PiDotsThreeCircle } from 'react-icons/pi'
import { MdOutlineMenu, MdViewList, MdViewModule, MdArrowBackIosNew } from 'react-icons/md'
import { IoMdCloseCircle } from 'react-icons/io'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import 'overlayscrollbars/overlayscrollbars.css'
import clsx from 'clsx'
import Dropdown from '@/components/ui/Dropdown'

// Mock data - will be replaced with real data later
const mockBooks = [
  {
    hash: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    format: 'epub' as const,
    progress: 45,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    hash: '2', 
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    format: 'pdf' as const,
    progress: 78,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    hash: '3',
    title: '1984',
    author: 'George Orwell', 
    format: 'epub' as const,
    progress: 23,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export default function LibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '')
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleBookClick = (bookHash: string) => {
    if (isSelectMode) {
      setSelectedBooks(prev => 
        prev.includes(bookHash) 
          ? prev.filter(id => id !== bookHash)
          : [...prev, bookHash]
      )
    } else {
      router.push(`/reader?ids=${bookHash}`)
    }
  }

  const handleImportBooks = () => {
    console.log('Import books')
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
      setSelectedBooks(filteredBooks.map(book => book.hash))
      setIsSelectAll(true)
    }
  }

  const filteredBooks = mockBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Import Menu Component
  const ImportMenu = () => (
    <>
      <li>
        <button onClick={handleImportBooks}>
          <PiPlus className="w-4 h-4" />
          Import from Files
        </button>
      </li>
      <li>
        <button>
          <PiPlus className="w-4 h-4" />
          Import from URL
        </button>
      </li>
    </>
  )

  // View Menu Component
  const ViewMenu = () => (
    <>
      <li>
        <button 
          onClick={() => setViewMode('grid')}
          className={viewMode === 'grid' ? 'active' : ''}
        >
          <MdViewModule className="w-4 h-4" />
          Grid View
        </button>
      </li>
      <li>
        <button 
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'active' : ''}
        >
          <MdViewList className="w-4 h-4" />
          List View
        </button>
      </li>
      <li><div className="divider"></div></li>
      <li>
        <button>Sort by Title</button>
      </li>
      <li>
        <button>Sort by Author</button>
      </li>
      <li>
        <button>Sort by Date Added</button>
      </li>
    </>
  )

  // Settings Menu Component  
  const SettingsMenu = () => (
    <>
      <li>
        <button>Preferences</button>
      </li>
      <li>
        <button>About</button>
      </li>
      <li><div className="divider"></div></li>
      <li>
        <button>Export Library</button>
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
                  filteredBooks.length > 1
                    ? `Search in ${filteredBooks.length} Book(s)...`
                    : 'Search Books...'
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
                  <div className="lg:tooltip lg:tooltip-bottom" data-tip="Import Books">
                    <PiPlus className="m-0.5 h-5 w-5" />
                  </div>
                }
              >
                <ImportMenu />
              </Dropdown>
              <button
                onClick={toggleSelectMode}
                aria-label="Select Multiple Books"
                className="h-6"
              >
                <div
                  className="lg:tooltip lg:tooltip-bottom cursor-pointer"
                  data-tip="Select Books"
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
                aria-label={isSelectAll ? 'Deselect' : 'Select All'}
              >
                <span className="font-sans text-base font-normal sm:text-sm">
                  {isSelectAll ? 'Deselect' : 'Select All'}
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
              {selectedBooks.length} selected
            </span>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-error">Delete</button>
              <button className="btn btn-sm btn-outline">Download</button>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setIsSelectMode(false)
                  setSelectedBooks([])
                  setIsSelectAll(false)
                }}
              >
                Cancel
              </button>
            </div>
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
            {filteredBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
                <div className="text-base-content/60 mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-base-300 rounded-lg flex items-center justify-center">
                    <PiPlus className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No books found</h3>
                  <p className="text-sm">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Import some books to get started.'}
                  </p>
                </div>
                {!searchQuery && (
                  <button 
                    className="btn btn-primary"
                    onClick={handleImportBooks}
                  >
                    <PiPlus className="w-4 h-4" />
                    Import Books
                  </button>
                )}
              </div>
            ) : (
              <div className={clsx({
                'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4': viewMode === 'grid',
                'space-y-2': viewMode === 'list'
              })}>
                {filteredBooks.map((book) => (
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
                  >
                    {viewMode === 'grid' ? (
                      <div className="space-y-2">
                        {/* Book Cover */}
                        <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg shadow-md flex items-center justify-center relative overflow-hidden">
                          <div className="text-center">
                            <div className="text-xs font-mono text-base-content/60 uppercase tracking-wider">
                              {book.format}
                            </div>
                          </div>
                          
                          {/* Progress indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-base-300">
                            <div 
                              className="h-full bg-primary transition-all" 
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>

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
                            <span>{book.progress}%</span>
                            <span className="uppercase">{book.format}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full">
                        {/* Book Cover */}
                        <div className="w-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-l-lg flex items-center justify-center flex-shrink-0 relative">
                          <div className="text-xs font-mono text-base-content/60 uppercase">
                            {book.format}
                          </div>
                          {/* Progress indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-base-300">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="card-body p-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-base line-clamp-1 mb-1">{book.title}</h3>
                              <p className="text-sm text-base-content/70 line-clamp-1 mb-2">{book.author}</p>
                              
                              {/* Progress */}
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-base-300 rounded-full h-1">
                                  <div 
                                    className="bg-primary h-1 rounded-full" 
                                    style={{ width: `${book.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-base-content/60 whitespace-nowrap">
                                  {book.progress}%
                                </span>
                              </div>
                            </div>

                            {isSelectMode && (
                              <div className="ml-4">
                                <div className={clsx(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                  selectedBooks.includes(book.hash)
                                    ? 'bg-primary border-primary text-primary-content'
                                    : 'border-base-content/30 bg-base-100'
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
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </OverlayScrollbarsComponent>
      </main>
    </div>
  )
} 