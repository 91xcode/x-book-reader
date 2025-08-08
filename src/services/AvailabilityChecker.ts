/**
 * 🔍 书籍可用性检查器
 * 简化版PreloadManager，只保留文件可用性检查功能
 * 符合Readest延迟解析策略
 */

import { Book } from '@/types/book'
import { BookServiceV2 } from './BookServiceV2'

export class AvailabilityChecker {
  private static instance: AvailabilityChecker
  private isChecking = false

  static getInstance(): AvailabilityChecker {
    if (!AvailabilityChecker.instance) {
      AvailabilityChecker.instance = new AvailabilityChecker()
    }
    return AvailabilityChecker.instance
  }

  /**
   * 🎯 批量后台检查书籍文件可用性
   */
  async backgroundCheckAvailability(books: Book[]): Promise<void> {
    if (books.length === 0) return
    
    // 🔧 防止重复执行
    if (this.isChecking) {
      console.debug('🔍 AvailabilityChecker: 正在执行检查，跳过重复调用')
      return
    }
    
    this.isChecking = true
    console.log('🔍 AvailabilityChecker: 后台检查书籍可用性', { count: books.length })
    
    try {
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
              console.error('❌ AvailabilityChecker: 检查失败:', book.hash, error)
            }
          })
        )

        // 每批之间稍作停顿，避免阻塞主线程
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } finally {
      this.isChecking = false
    }
  }

  /**
   * 创建批次数组
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }
}
