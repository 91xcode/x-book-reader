import { Book, BookFormat } from '@/types/book'
import { DocumentLoader, getBaseFilename, getFilename } from '@/libs/document'
import { TxtToEpubConverter } from '@/utils/txt'

export interface ImportBookOptions {
  saveBook?: boolean
  saveCover?: boolean
  overwrite?: boolean
  transient?: boolean
}

export interface ProgressHandler {
  (progress: { progress: number; total: number; transferSpeed?: number }): void
}

export class BookService {
  private books: Book[] = []
  private isClient = typeof window !== 'undefined'

  constructor() {
    // 只在客户端环境下加载数据
    if (this.isClient) {
      this.loadBooksFromStorage()
    }
  }

  /**
   * 导入书籍文件
   */
  async importBook(
    file: File,
    options: ImportBookOptions = {}
  ): Promise<Book | null> {
    const {
      saveBook = true,
      saveCover = true,
      overwrite = false,
      transient = false
    } = options

    try {
      let processedFile = file
      let filename = file.name

      // 如果是TXT文件，先转换为EPUB
      if (filename.toLowerCase().endsWith('.txt')) {
        const txt2epub = new TxtToEpubConverter()
        const result = await txt2epub.convert({ file })
        processedFile = result.file
      }

      // 使用DocumentLoader解析书籍
      const { book: loadedBook, format } = await new DocumentLoader(processedFile).open()

      // 如果书籍没有标题，使用文件名
      if (!loadedBook.metadata.title) {
        loadedBook.metadata.title = getBaseFilename(filename)
      }

      // 生成书籍hash
      const hash = await this.generateBookHash(processedFile)

      // 检查是否已存在相同的书籍
      const existingBook = this.books.find(b => b.hash === hash)
      if (existingBook && !overwrite) {
        if (!transient) {
          existingBook.deletedAt = null
        }
        existingBook.createdAt = Date.now()
        existingBook.updatedAt = Date.now()
        return existingBook
      }

      // 创建新的Book对象
      const book: Book = {
        hash,
        format,
        title: this.formatTitle(loadedBook.metadata.title),
        sourceTitle: this.formatTitle(loadedBook.metadata.title),
        author: this.formatAuthors(loadedBook.metadata.author),
        primaryLanguage: loadedBook.metadata.language || 'zh-CN',
        metadata: loadedBook.metadata,
        createdAt: existingBook ? existingBook.createdAt : Date.now(),
        uploadedAt: existingBook ? existingBook.uploadedAt : null,
        deletedAt: transient ? Date.now() : null,
        downloadedAt: Date.now(),
        updatedAt: Date.now(),
      }

      // 保存书籍文件和封面
      if (saveBook && !transient) {
        await this.saveBookFile(book, processedFile, overwrite)
      }

      if (saveCover) {
        await this.saveBookCover(book, loadedBook, overwrite)
      }

      // 更新书籍列表
      if (!existingBook) {
        this.books.unshift(book) // 添加到开头
        await this.saveBooksToStorage()
      }

      return book
    } catch (error) {
      console.error('导入书籍失败:', error)
      throw new Error(`导入书籍失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 上传书籍到云端
   */
  async uploadBook(book: Book, onProgress?: ProgressHandler): Promise<void> {
    try {
      // 这里是云端上传的简化实现
      // 实际应用中需要连接到真实的云存储服务
      console.log('上传书籍到云端:', book.title)

      if (onProgress) {
        // 模拟上传进度
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          onProgress({
            progress: i,
            total: 100,
            transferSpeed: 1024 * 1024 // 1MB/s
          })
        }
      }

      // 更新书籍状态
      book.uploadedAt = Date.now()
      book.updatedAt = Date.now()
      await this.saveBooksToStorage()

      console.log('书籍上传完成:', book.title)
    } catch (error) {
      console.error('上传书籍失败:', error)
      throw new Error(`上传书籍失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 获取所有书籍
   */
  getBooks(): Book[] {
    return this.books.filter(book => !book.deletedAt)
  }

  /**
   * 初始化服务（用于客户端hydration）
   */
  async initialize(): Promise<void> {
    if (this.isClient && this.books.length === 0) {
      this.loadBooksFromStorage()
    }
  }

  /**
   * 根据hash获取书籍
   */
  getBookByHash(hash: string): Book | undefined {
    return this.books.find(book => book.hash === hash && !book.deletedAt)
  }

  /**
   * 删除书籍
   */
  async deleteBook(hash: string): Promise<void> {
    const book = this.books.find(b => b.hash === hash)
    if (book) {
      book.deletedAt = Date.now()
      await this.saveBooksToStorage()
    }
  }

  /**
   * 永久删除书籍
   */
  async permanentDeleteBook(hash: string): Promise<void> {
    const index = this.books.findIndex(b => b.hash === hash)
    if (index !== -1) {
      this.books.splice(index, 1)
      await this.saveBooksToStorage()

      // 删除相关文件
      await this.deleteBookFiles(hash)
    }
  }

  /**
   * 恢复已删除的书籍
   */
  async restoreBook(hash: string): Promise<void> {
    const book = this.books.find(b => b.hash === hash)
    if (book) {
      book.deletedAt = null
      book.updatedAt = Date.now()
      await this.saveBooksToStorage()
    }
  }

  /**
   * 生成书籍hash
   */
  private async generateBookHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 格式化标题
   */
  private formatTitle(title: any): string {
    if (typeof title === 'string') {
      return title.trim()
    }
    if (typeof title === 'object' && title !== null) {
      // 处理多语言标题
      return title.zh || title.en || title['zh-CN'] || title['en-US'] || Object.values(title)[0] as string || '未知标题'
    }
    return '未知标题'
  }

  /**
   * 格式化作者
   */
  private formatAuthors(author: any): string {
    if (typeof author === 'string') {
      return author.trim()
    }
    if (Array.isArray(author)) {
      return author.map(a => typeof a === 'string' ? a : a.name || '').join(', ')
    }
    if (typeof author === 'object' && author !== null) {
      return author.name || '未知作者'
    }
    return '未知作者'
  }

  /**
   * 保存书籍文件
   */
  private async saveBookFile(book: Book, file: File, overwrite: boolean): Promise<void> {
    if (!this.isClient) return

    try {
      // 在实际应用中，这里应该保存到文件系统或数据库
      // 目前使用IndexedDB或localStorage作为简化实现
      const key = `book_file_${book.hash}`

      if (!overwrite && localStorage.getItem(key)) {
        return // 文件已存在且不覆盖
      }

      // 将文件转换为base64保存（简化实现）
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      localStorage.setItem(key, base64)

      console.log('书籍文件已保存:', book.title)
    } catch (error) {
      console.error('保存书籍文件失败:', error)
    }
  }

  /**
   * 保存书籍封面
   */
  private async saveBookCover(book: Book, loadedBook: any, overwrite: boolean): Promise<void> {
    if (!this.isClient) return

    try {
      const key = `book_cover_${book.hash}`

      if (!overwrite && localStorage.getItem(key)) {
        return // 封面已存在且不覆盖
      }

      // 获取封面
      const cover = await loadedBook.getCover()
      if (cover) {
        const arrayBuffer = await cover.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        localStorage.setItem(key, base64)

        // 生成封面URL
        book.metadata = book.metadata || {}
        book.metadata.cover = `data:${cover.type};base64,${base64}`

        console.log('书籍封面已保存:', book.title)
      }
    } catch (error) {
      console.error('保存书籍封面失败:', error)
    }
  }

  /**
   * 删除书籍相关文件
   */
  private async deleteBookFiles(hash: string): Promise<void> {
    if (!this.isClient) return

    try {
      localStorage.removeItem(`book_file_${hash}`)
      localStorage.removeItem(`book_cover_${hash}`)
      localStorage.removeItem(`book_config_${hash}`)
      console.log('书籍文件已删除:', hash)
    } catch (error) {
      console.error('删除书籍文件失败:', error)
    }
  }

  /**
   * 从存储中加载书籍列表
   */
  private loadBooksFromStorage(): void {
    if (!this.isClient) {
      this.books = []
      return
    }

    try {
      const stored = localStorage.getItem('books')
      if (stored) {
        this.books = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载书籍列表失败:', error)
      this.books = []
    }
  }

  /**
   * 保存书籍列表到存储
   */
  private async saveBooksToStorage(): Promise<void> {
    if (!this.isClient) return

    try {
      localStorage.setItem('books', JSON.stringify(this.books))
    } catch (error) {
      console.error('保存书籍列表失败:', error)
    }
  }
}

// 单例实例
export const bookService = new BookService() 