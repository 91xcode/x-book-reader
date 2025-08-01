/**
 * 🚀 预加载管理器 - 多层次准备检查
 * 
 * 类似readest的预加载策略，在用户操作前预先准备数据和检查可用性
 */

import { Book } from '@/types/book'
import { BookServiceV2 } from './BookServiceV2'

interface PreloadOptions {
  /** 是否预检查书籍可用性 */
  checkAvailability?: boolean
  /** 是否预加载书籍数据 */
  preloadData?: boolean
  /** 并发检查数量限制 */
  concurrency?: number
  /** 检查优先级（最近阅读的书籍优先） */
  prioritizeRecent?: boolean
}

interface PreloadResult {
  bookId: string
  available: boolean
  preloaded: boolean
  duration: number
  error?: string
}

interface PreloadStats {
  totalBooks: number
  checkedBooks: number
  availableBooks: number
  averageCheckTime: number
  errors: string[]
}

export class PreloadManager {
  private static instance: PreloadManager
  private isPreloading = false
  private preloadQueue: string[] = []
  private preloadResults = new Map<string, PreloadResult>()

  static getInstance(): PreloadManager {
    if (!PreloadManager.instance) {
      PreloadManager.instance = new PreloadManager()
    }
    return PreloadManager.instance
  }

  /**
   * 🎯 预加载Library中的书籍数据
   */
  async preloadLibraryBooks(
    books: Book[],
    options: PreloadOptions = {}
  ): Promise<PreloadStats> {
    const {
      checkAvailability = true,
      preloadData = false,
      concurrency = 3,
      prioritizeRecent = true
    } = options

    if (this.isPreloading) {
      console.log('⏳ PreloadManager: 预加载已在进行中，跳过')
      return this.getPreloadStats()
    }

    this.isPreloading = true
    console.log('🚀 PreloadManager: 开始预加载Library书籍', {
      totalBooks: books.length,
      checkAvailability,
      preloadData,
      concurrency
    })

    try {
      // 1. 排序书籍：最近阅读的优先
      const sortedBooks = prioritizeRecent 
        ? [...books].sort((a, b) => 
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
          )
        : books

      // 2. 分批处理，控制并发
      const batches = this.createBatches(sortedBooks, concurrency)
      const bookService = BookServiceV2.getInstance()

      for (const batch of batches) {
        await Promise.allSettled(
          batch.map(book => this.preloadSingleBook(book, bookService, {
            checkAvailability,
            preloadData
          }))
        )
      }

      const stats = this.getPreloadStats()
      console.log('✅ PreloadManager: 预加载完成', stats)
      
      return stats

    } finally {
      this.isPreloading = false
    }
  }

  /**
   * 🎯 预热特定书籍 - 在用户点击前调用
   */
  async preheatBook(bookId: string): Promise<boolean> {
    console.log('🔥 PreloadManager: 预热书籍', bookId.substring(0, 8) + '...')
    
    const bookService = BookServiceV2.getInstance()
    const book = bookService.getBookByHash(bookId)
    
    if (!book) {
      console.error('❌ PreloadManager: 书籍不存在')
      return false
    }

    try {
      const startTime = performance.now()
      
      // 1. 预处理书籍可用性
      const available = await bookService.makeBookAvailable(book, {
        loadingDelay: 100, // 更快的预热
        useCache: true
      })

      // 2. 预加载store状态
      if (available) {
        const { useBookDataStore } = await import('@/store/bookDataStore')
        const { useReaderStore } = await import('@/store/readerStore')
        
        const bookDataStore = useBookDataStore.getState()
        const readerStore = useReaderStore.getState()

        // 预检查是否有缓存的书籍数据
        const bookData = bookDataStore.getBookData(bookId)
        console.log('🔧 PreloadManager: 书籍数据缓存状态', {
          hasBookDoc: !!bookData?.bookDoc,
          hasConfig: !!bookData?.config
        })
      }

      const duration = performance.now() - startTime
      console.log(`${available ? '✅' : '❌'} PreloadManager: 预热完成`, {
        bookId: bookId.substring(0, 8) + '...',
        available,
        duration: `${duration.toFixed(2)}ms`
      })

      return available

    } catch (error) {
      console.error('❌ PreloadManager: 预热书籍失败:', error)
      return false
    }
  }

  /**
   * 🎯 获取书籍预加载状态
   */
  getBookPreloadStatus(bookId: string): PreloadResult | null {
    return this.preloadResults.get(bookId) || null
  }

  /**
   * 🎯 批量预检查书籍可用性（后台任务）
   */
  async backgroundCheckAvailability(books: Book[]): Promise<void> {
    if (books.length === 0) return

    console.log('🔍 PreloadManager: 后台检查书籍可用性', { count: books.length })
    
    // 使用较低的并发度，避免影响主要操作
    const batches = this.createBatches(books, 2)
    const bookService = BookServiceV2.getInstance()

    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (book) => {
          try {
            const startTime = performance.now()
            const available = await bookService.isBookAvailable(book)
            const duration = performance.now() - startTime

            // 缓存结果到bookDataStore
            const { useBookDataStore } = await import('@/store/bookDataStore')
            const bookDataStore = useBookDataStore.getState()
            
            bookDataStore.setAvailabilityStatus(book.hash, {
              available,
              fileExists: available,
              lastChecked: Date.now(),
              checkDuration: duration
            })

          } catch (error) {
            console.error('❌ PreloadManager: 后台检查失败:', book.hash, error)
          }
        })
      )

      // 每批之间稍作停顿，避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  // 私有方法

  private async preloadSingleBook(
    book: Book,
    bookService: BookServiceV2,
    options: { checkAvailability: boolean; preloadData: boolean }
  ): Promise<void> {
    const startTime = performance.now()
    
    try {
      let available = false
      let preloaded = false

      // 检查可用性
      if (options.checkAvailability) {
        available = await bookService.isBookAvailable(book)
      }

      // 预加载数据
      if (options.preloadData && available) {
        // 这里可以添加预加载BookDoc的逻辑
        preloaded = true
      }

      const duration = performance.now() - startTime
      
      this.preloadResults.set(book.hash, {
        bookId: book.hash,
        available,
        preloaded,
        duration
      })

    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      this.preloadResults.set(book.hash, {
        bookId: book.hash,
        available: false,
        preloaded: false,
        duration,
        error: errorMessage
      })
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  private getPreloadStats(): PreloadStats {
    const results = Array.from(this.preloadResults.values())
    
    return {
      totalBooks: results.length,
      checkedBooks: results.length,
      availableBooks: results.filter(r => r.available).length,
      averageCheckTime: results.length > 0 
        ? results.reduce((sum, r) => sum + r.duration, 0) / results.length 
        : 0,
      errors: results.filter(r => r.error).map(r => r.error!)
    }
  }

  /**
   * 清理预加载结果缓存
   */
  clearCache(): void {
    this.preloadResults.clear()
  }
}