import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Book, BookConfig } from '@/types/book'
import { BookDoc } from '@/types/book'

interface BookData {
  /** 书籍ID (hash) */
  id: string
  /** 书籍元数据 */
  book: Book | null
  /** 书籍文件 */
  file: File | null
  /** 书籍配置 */
  config: BookConfig | null
  /** 解析后的书籍文档 */
  bookDoc: BookDoc | null
  /** 缓存时间戳 */
  cachedAt: number
  /** 文件更新时间 */
  fileLastModified: number
  /** 🆕 书籍可用性状态缓存 */
  availabilityStatus?: {
    available: boolean
    fileExists: boolean
    lastChecked: number
    checkDuration: number // 检查耗时，用于性能分析
  }
}

interface BookDataState {
  /** 缓存的书籍数据 */
  booksData: { [id: string]: BookData }
  
  /** 内部初始化方法 */
  _initialize: () => void
  
  /** 获取书籍数据 */
  getBookData: (keyOrId: string) => BookData | null
  
  /** 设置书籍数据 */
  setBookData: (id: string, data: Partial<BookData>) => void
  
  /** 获取书籍配置 */
  getConfig: (key: string | null) => BookConfig | null
  
  /** 设置书籍配置 */
  setConfig: (key: string, partialConfig: Partial<BookConfig>) => void
  
  /** 清除过期缓存 */
  clearExpiredCache: () => void
  
  /** 检查缓存是否有效 */
  isCacheValid: (id: string, file: File) => boolean
  
  /** 清除所有缓存 */
  clearAllCache: () => void
  
  /** 获取缓存统计信息 */
  getCacheStats: () => {
    totalBooks: number
    cachedBooks: number
    cacheSize: number
    oldestCacheTime: number | null
  }

  /** 🆕 书籍可用性状态管理 */
  /** 获取书籍可用性状态 */
  getAvailabilityStatus: (id: string) => BookData['availabilityStatus'] | null
  
  /** 设置书籍可用性状态 */
  setAvailabilityStatus: (id: string, status: BookData['availabilityStatus']) => void
  
  /** 检查可用性状态是否过期 */
  isAvailabilityStatusExpired: (id: string, maxAge?: number) => boolean
}

// 缓存过期时间 (24小时)
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000

export const useBookDataStore = create<BookDataState>()(
  persist(
    (set, get) => ({
      booksData: {},

      // 初始化时自动清理过期缓存
      _initialize: () => {
        const state = get()
        state.clearExpiredCache()
        
        // 设置定期清理（每小时）
        if (typeof window !== 'undefined') {
          setInterval(() => {
            state.clearExpiredCache()
          }, 60 * 60 * 1000)
        }
      },

      getBookData: (keyOrId: string) => {
        const id = keyOrId.split('-')[0]!
        return get().booksData[id] || null
      },

      setBookData: (id: string, data: Partial<BookData>) => {
        set((state) => ({
          booksData: {
            ...state.booksData,
            [id]: {
              ...state.booksData[id],
              ...data,
              id,
              cachedAt: Date.now(),
            } as BookData,
          },
        }))
      },

      getConfig: (key: string | null) => {
        if (!key) return null
        const id = key.split('-')[0]!
        return get().booksData[id]?.config || null
      },

      setConfig: (key: string, partialConfig: Partial<BookConfig>) => {
        const id = key.split('-')[0]!
        const state = get()
        const bookData = state.booksData[id]
        
        if (!bookData?.config) {
          console.warn('No config found for book', id)
          return
        }

        const updatedConfig = { ...bookData.config, ...partialConfig }
        
        set((state) => ({
          booksData: {
            ...state.booksData,
            [id]: {
              ...state.booksData[id]!,
              config: updatedConfig,
            },
          },
        }))
      },

      clearExpiredCache: () => {
        const now = Date.now()
        const state = get()
        const updatedBooksData: { [id: string]: BookData } = {}

        Object.entries(state.booksData).forEach(([id, data]) => {
          if (now - data.cachedAt < CACHE_EXPIRY_TIME) {
            updatedBooksData[id] = data
          }
        })

        set({ booksData: updatedBooksData })
      },

      isCacheValid: (id: string, file: File) => {
        const bookData = get().booksData[id]
        if (!bookData) return false

        const now = Date.now()
        const isCacheExpired = now - bookData.cachedAt > CACHE_EXPIRY_TIME
        const isFileModified = file.lastModified !== bookData.fileLastModified

        return !isCacheExpired && !isFileModified && !!bookData.bookDoc
      },

      clearAllCache: () => {
        set({ booksData: {} })
      },

      getCacheStats: () => {
        const state = get()
        const entries = Object.values(state.booksData)
        const cachedEntries = entries.filter(data => data.bookDoc)
        
        return {
          totalBooks: entries.length,
          cachedBooks: cachedEntries.length,
          cacheSize: cachedEntries.reduce((size, data) => {
            // 估算缓存大小 (简化计算)
            return size + (data.bookDoc ? 1 : 0)
          }, 0),
          oldestCacheTime: entries.length > 0 
            ? Math.min(...entries.map(data => data.cachedAt))
            : null
        }
      },

      // 🆕 书籍可用性状态管理
      getAvailabilityStatus: (id: string) => {
        const bookData = get().booksData[id]
        return bookData?.availabilityStatus || null
      },

      setAvailabilityStatus: (id: string, status: BookData['availabilityStatus']) => {
        set((state) => ({
          booksData: {
            ...state.booksData,
            [id]: {
              ...state.booksData[id],
              id,
              availabilityStatus: status,
            } as BookData,
          },
        }))
      },

      isAvailabilityStatusExpired: (id: string, maxAge = 5 * 60 * 1000) => { // 默认5分钟过期
        const status = get().getAvailabilityStatus(id)
        if (!status) return true
        
        const now = Date.now()
        return now - status.lastChecked > maxAge
      },
    }),
    {
      name: 'book-data-storage',
      // 只持久化书籍元数据和配置，不持久化文件和解析后的文档（太大了）
      partialize: (state) => ({
        booksData: Object.fromEntries(
          Object.entries(state.booksData).map(([id, data]) => [
            id,
            {
              ...data,
              file: null, // 不持久化文件
              bookDoc: null, // 不持久化解析后的文档
            },
          ])
        ),
      }),
      onRehydrateStorage: () => (state) => {
        // 在状态恢复后初始化清理机制
        if (state) {
          state._initialize();
        }
      },
    }
  )
)

// 立即初始化 (当store被创建时)
if (typeof window !== 'undefined') {
  // 延迟执行以确保store完全初始化
  setTimeout(() => {
    const store = useBookDataStore.getState();
    store._initialize();
  }, 0);
}