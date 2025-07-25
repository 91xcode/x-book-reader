'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RiAddLine, RiSearchLine, RiGridLine, RiListCheck, RiMoreLine } from 'react-icons/ri'
import { MdViewList, MdViewModule } from 'react-icons/md'
import clsx from 'clsx'

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])

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
    // TODO: Implement file import
    console.log('Import books')
  }

  const filteredBooks = mockBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-base-300 bg-base-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Library</h1>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered input-sm pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="join">
              <button
                className={clsx('btn btn-sm join-item', {
                  'btn-active': viewMode === 'grid'
                })}
                onClick={() => setViewMode('grid')}
              >
                <MdViewModule className="w-4 h-4" />
              </button>
              <button
                className={clsx('btn btn-sm join-item', {
                  'btn-active': viewMode === 'list'
                })}
                onClick={() => setViewMode('list')}
              >
                <MdViewList className="w-4 h-4" />
              </button>
            </div>

            {/* Import Button */}
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleImportBooks}
            >
              <RiAddLine className="w-4 h-4" />
              Import
            </button>

            {/* More Options */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                <RiMoreLine className="w-4 h-4" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <a onClick={() => setIsSelectMode(!isSelectMode)}>
                    <RiListCheck className="w-4 h-4" />
                    Select Mode
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Select Mode Actions */}
        {isSelectMode && (
          <div className="border-t border-base-300 px-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/70">
                {selectedBooks.length} selected
              </span>
              <div className="flex space-x-2">
                <button className="btn btn-sm btn-error">Delete</button>
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setIsSelectMode(false)
                    setSelectedBooks([])
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-base-content/60 mb-4">
              <RiGridLine className="w-16 h-16 mx-auto mb-4" />
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
                <RiAddLine className="w-4 h-4" />
                Import Books
              </button>
            )}
          </div>
        ) : (
          <div className={clsx({
            'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4': viewMode === 'grid',
            'space-y-2': viewMode === 'list'
          })}>
            {filteredBooks.map((book) => (
              <div
                key={book.hash}
                className={clsx(
                  'cursor-pointer transition-all duration-200',
                  {
                    'card bg-base-200 shadow-sm hover:shadow-md': viewMode === 'grid',
                    'card card-side bg-base-200 shadow-sm hover:shadow-md h-32': viewMode === 'list',
                    'ring-2 ring-primary': selectedBooks.includes(book.hash)
                  }
                )}
                onClick={() => handleBookClick(book.hash)}
              >
                {viewMode === 'grid' ? (
                  <div className="card-body p-4">
                    {/* Book Cover Placeholder */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded mb-3 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs font-mono text-base-content/60 uppercase">
                          {book.format}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{book.title}</h3>
                      <p className="text-xs text-base-content/70 line-clamp-1 mb-2">{book.author}</p>
                      
                      {/* Progress Bar */}
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

                    {isSelectMode && (
                      <div className="absolute top-2 right-2">
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
                ) : (
                  <div className="flex w-full">
                    {/* Book Cover */}
                    <div className="w-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-l flex items-center justify-center flex-shrink-0">
                      <div className="text-xs font-mono text-base-content/60 uppercase">
                        {book.format}
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
      </main>
    </div>
  )
} 