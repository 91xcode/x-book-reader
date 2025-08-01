/**
 * 书籍服务 V2
 * 使用环境感知的应用服务架构
 * 参考readest项目的设计模式
 */

import { Book, BookFormat, BookDoc } from '@/types/book';
import { getAppService } from './environment';
import { DocumentLoader } from '@/libs/document';
import { TxtToEpubConverter } from '@/utils/txt';
import { getBaseFilename, formatTitle, formatAuthors, getPrimaryLanguage } from '@/utils/book';

export interface BookImportOptions {
  overwrite?: boolean;
  onProgress?: (progress: number) => void;
  onStatusChange?: (status: string) => void;
}

export class BookServiceV2 {
  private static instance: BookServiceV2;
  private isClient: boolean;

  private constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  static getInstance(): BookServiceV2 {
    if (!BookServiceV2.instance) {
      BookServiceV2.instance = new BookServiceV2();
    }
    return BookServiceV2.instance;
  }

  /**
   * 导入书籍
   */
  async importBook(
    file: File, 
    options: BookImportOptions = {}
  ): Promise<{ success: boolean; book?: Book; error?: string }> {
    if (!this.isClient) {
      return { success: false, error: '服务器端不支持文件操作' };
    }

    const { overwrite = false, onProgress, onStatusChange } = options;

    try {
      console.log('📚 BookService: 开始导入书籍', {
        fileName: file.name,
        size: file.size,
        type: file.type
      });

      onStatusChange?.('正在分析文件...');
      onProgress?.(10);

      let processedFile = file;
      let originalFilename = file.name;
      let loadedBook: BookDoc;
      let format: BookFormat;

      // 按照Readest的流程：如果是TXT文件，先转换为EPUB
      if (originalFilename.toLowerCase().endsWith('.txt')) {
        onStatusChange?.('正在转换TXT文件为EPUB...');
        onProgress?.(25);
        
        const txt2epub = new TxtToEpubConverter();
        const result = await txt2epub.convert({ file });
        processedFile = result.file;
        console.log('📝 BookService: TXT文件已转换为EPUB');
      }

      onStatusChange?.('正在解析书籍内容...');
      onProgress?.(40);

      // 使用DocumentLoader解析书籍（按照Readest的流程）
      ({ book: loadedBook, format } = await new DocumentLoader(processedFile).open());
      
      // 如果书籍没有标题，使用文件名
      if (!loadedBook.metadata.title) {
        loadedBook.metadata.title = getBaseFilename(originalFilename);
      }

      // 生成书籍哈希（使用处理后的文件）
      const hash = await this.generateBookHash(processedFile);
      console.log('🔑 BookService: 书籍哈希:', hash.substring(0, 8) + '...');

      onStatusChange?.('正在检查文件是否已存在...');
      onProgress?.(50);

      // 获取环境感知的应用服务
      const appService = await getAppService();
      
      // 检查书籍是否已存在
      if (!overwrite && await appService.bookFileExists(hash)) {
        console.log('📖 BookService: 书籍已存在，跳过导入');
        
        // 尝试从存储中获取书籍信息
        const existingBooks = this.getBooksFromStorage();
        const existingBook = existingBooks.find(book => book.hash === hash);
        
        if (existingBook) {
          // 更新现有书籍的时间戳
          existingBook.deletedAt = null;
          existingBook.createdAt = Date.now();
          existingBook.updatedAt = Date.now();
          this.updateBook(existingBook);
          return { success: true, book: existingBook };
        }
      }

      onStatusChange?.('正在保存书籍文件...');
      onProgress?.(70);

      // 保存处理后的文件到存储（按照Readest的流程，保存转换后的EPUB）
      await appService.importBookFile(hash, processedFile);

      onStatusChange?.('正在生成书籍信息...');
      onProgress?.(80);

      // 创建书籍对象（按照Readest的格式）
      const book: Book = {
        hash,
        format, // 使用DocumentLoader检测到的格式
        title: formatTitle(loadedBook.metadata.title || ''),
        sourceTitle: formatTitle(loadedBook.metadata.title || ''),
        author: formatAuthors(loadedBook.metadata.author || ''),
        primaryLanguage: getPrimaryLanguage(loadedBook.metadata.language) || 'zh-CN',
        createdAt: Date.now(),
        uploadedAt: null,
        deletedAt: null,
        downloadedAt: Date.now(),
        updatedAt: Date.now(),
        readingStatus: 'unread' as const,
        metadata: loadedBook.metadata
      };

      onStatusChange?.('正在保存书籍信息...');
      onProgress?.(90);

      // 保存书籍信息到本地存储
      this.saveBookToStorage(book);

      // 生成并保存封面
      try {
        const cover = await loadedBook.getCover();
        if (cover) {
          await this.saveBookCover(hash, cover);
        }
      } catch (error) {
        console.warn('⚠️ BookService: 获取封面失败:', error);
      }

      onStatusChange?.('导入完成！');
      onProgress?.(100);

      console.log('✅ BookService: 书籍导入成功', {
        title: book.title,
        author: book.author,
        format: book.format
      });

      return { success: true, book };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('❌ BookService: 导入书籍失败:', error);
      
      onStatusChange?.(`导入失败: ${errorMessage}`);
      
      return { 
        success: false, 
        error: `导入书籍失败: ${errorMessage}` 
      };
    }
  }

  /**
   * 获取书籍文件
   */
  async getBookFile(hash: string): Promise<File | null> {
    if (!this.isClient) return null;
    
    try {
      const appService = await getAppService();
      return await appService.getBookFile(hash);
    } catch (error) {
      console.error('❌ BookService: 获取书籍文件失败:', error);
      return null;
    }
  }

  /**
   * 删除书籍
   */
  async deleteBook(hash: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isClient) {
      return { success: false, error: '服务器端不支持删除操作' };
    }

    try {
      console.log('🗑️ BookService: 删除书籍', hash.substring(0, 8) + '...');

      // 获取环境感知的应用服务
      const appService = await getAppService();
      
      // 删除书籍文件
      await appService.deleteBookFile(hash);
      
      // 删除书籍信息
      this.removeBookFromStorage(hash);
      
      // 删除封面
      this.removeBookCover(hash);
      
      console.log('✅ BookService: 书籍删除成功');
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('❌ BookService: 删除书籍失败:', error);
      
      return { 
        success: false, 
        error: `删除书籍失败: ${errorMessage}` 
      };
    }
  }

  /**
   * 获取所有书籍
   */
  getBooks(): Book[] {
    if (!this.isClient) return [];
    return this.getBooksFromStorage();
  }

  /**
   * 根据哈希获取书籍
   */
  getBookByHash(hash: string): Book | null {
    if (!this.isClient) return null;
    
    const books = this.getBooksFromStorage();
    return books.find(book => book.hash === hash) || null;
  }

  /**
   * 更新书籍信息
   */
  updateBook(book: Book): void {
    if (!this.isClient) return;
    
    const books = this.getBooksFromStorage();
    const index = books.findIndex(b => b.hash === book.hash);
    
    if (index !== -1) {
      books[index] = { ...book };
      this.saveBooksToStorage(books);
      console.log('✅ BookService: 书籍信息更新成功', book.title);
    }
  }

  /**
   * 检查书籍是否可用 - 类似readest的isBookAvailable
   */
  async isBookAvailable(book: Book): Promise<boolean> {
    if (!this.isClient) return false;
    
    try {
      const appService = await getAppService();
      const bookFile = await appService.getBookFile(book.hash);
      return !!bookFile;
    } catch (error) {
      console.error('❌ BookService: 检查书籍可用性失败:', error);
      return false;
    }
  }

  /**
   * 预处理书籍，确保其可用 - 类似readest的makeBookAvailable
   */
  async makeBookAvailable(
    book: Book,
    options: {
      onLoadingStart?: () => void;
      onLoadingEnd?: () => void;
      loadingDelay?: number;
      useCache?: boolean;
    } = {}
  ): Promise<boolean> {
    if (!this.isClient) return false;
    
    const { onLoadingStart, onLoadingEnd, loadingDelay = 200, useCache = true } = options;
    const startTime = performance.now();
    
    try {
      console.log('🔧 BookService: 预处理书籍:', book.title);
      
      // 🆕 1. 检查缓存的可用性状态
      if (useCache) {
        const { useBookDataStore } = await import('@/store/bookDataStore');
        const bookDataStore = useBookDataStore.getState();
        
        if (!bookDataStore.isAvailabilityStatusExpired(book.hash)) {
          const cachedStatus = bookDataStore.getAvailabilityStatus(book.hash);
          if (cachedStatus?.available) {
            console.log('✅ BookService: 使用缓存的可用性状态');
            return true;
          }
        }
      }
      
      // 2. 检查书籍是否实际可用
      const isAvailable = await this.isBookAvailable(book);
      const endTime = performance.now();
      const checkDuration = endTime - startTime;
      
      // 🆕 3. 缓存可用性状态
      if (useCache) {
        const { useBookDataStore } = await import('@/store/bookDataStore');
        const bookDataStore = useBookDataStore.getState();
        
        bookDataStore.setAvailabilityStatus(book.hash, {
          available: isAvailable,
          fileExists: isAvailable,
          lastChecked: Date.now(),
          checkDuration
        });
      }
      
      if (isAvailable) {
        console.log('✅ BookService: 书籍已可用', { duration: `${checkDuration.toFixed(2)}ms` });
        return true;
      }
      
      // 4. 书籍不可用，需要进行处理
      console.warn('⚠️ BookService: 书籍文件不可用，需要重新处理');
      
      // 5. 延迟显示加载状态，避免闪烁
      const loadingTimeout = setTimeout(() => {
        onLoadingStart?.();
      }, loadingDelay);
      
      try {
        // 6. 这里可以添加重新下载、修复等逻辑
        // 目前先返回false，因为我们主要依赖本地文件系统
        return false;
      } finally {
        // 7. 清理加载状态
        if (loadingTimeout) clearTimeout(loadingTimeout);
        onLoadingEnd?.();
      }
      
    } catch (error) {
      console.error('❌ BookService: 预处理书籍失败:', error);
      
      // 缓存失败状态
      if (useCache) {
        try {
          const { useBookDataStore } = await import('@/store/bookDataStore');
          const bookDataStore = useBookDataStore.getState();
          
          bookDataStore.setAvailabilityStatus(book.hash, {
            available: false,
            fileExists: false,
            lastChecked: Date.now(),
            checkDuration: performance.now() - startTime
          });
        } catch {
          // 忽略缓存错误
        }
      }
      
      return false;
    }
  }

  /**
   * 预验证书籍数据和文件 - 新增的预处理方法
   */
  async prevalidateBook(book: Book): Promise<{
    available: boolean;
    fileExists: boolean;
    needsReprocessing: boolean;
    lastChecked: number;
  }> {
    if (!this.isClient) {
      return {
        available: false,
        fileExists: false,
        needsReprocessing: false,
        lastChecked: Date.now()
      };
    }
    
    try {
      const fileExists = await this.isBookAvailable(book);
      const available = fileExists; // 可以添加更多检查条件
      
      return {
        available,
        fileExists,
        needsReprocessing: !available,
        lastChecked: Date.now()
      };
    } catch (error) {
      console.error('❌ BookService: 预验证书籍失败:', error);
      return {
        available: false,
        fileExists: false,
        needsReprocessing: true,
        lastChecked: Date.now()
      };
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage(): Promise<{
    used: number;
    available: number;
    platform: string;
  } | null> {
    if (!this.isClient) return null;

    try {
      const appService = await getAppService();
      const usage = await appService.getStorageUsage();
      const platformInfo = appService.getPlatformInfo();
      
      return usage ? {
        ...usage,
        platform: platformInfo.platform
      } : null;
      
    } catch (error) {
      console.error('❌ BookService: 获取存储使用情况失败:', error);
      return null;
    }
  }

  // 私有方法

  /**
   * 检测书籍格式（备用方法，主要使用 DocumentLoader 检测）
   */
  private detectBookFormat(file: File): BookFormat {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'epub':
        return 'EPUB';
      case 'pdf':
        return 'PDF';
      case 'txt':
        return 'EPUB'; // TXT文件转换后为EPUB格式
      case 'mobi':
        return 'MOBI';
      case 'azw3':
        return 'AZW3';
      case 'fb2':
        return 'FB2';
      case 'fbz':
        return 'FBZ';
      case 'cbz':
        return 'CBZ';
      default:
        return 'EPUB'; // 默认格式
    }
  }

  /**
   * 生成书籍哈希
   */
  private async generateBookHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }



  /**
   * 从本地存储获取书籍列表
   */
  private getBooksFromStorage(): Book[] {
    try {
      const booksData = localStorage.getItem('books');
      return booksData ? JSON.parse(booksData) : [];
    } catch (error) {
      console.error('❌ BookService: 获取书籍列表失败:', error);
      return [];
    }
  }

  /**
   * 保存书籍列表到本地存储
   */
  private saveBooksToStorage(books: Book[]): void {
    try {
      localStorage.setItem('books', JSON.stringify(books));
    } catch (error) {
      console.error('❌ BookService: 保存书籍列表失败:', error);
    }
  }

  /**
   * 保存单个书籍到本地存储
   */
  private saveBookToStorage(book: Book): void {
    const books = this.getBooksFromStorage();
    const existingIndex = books.findIndex(b => b.hash === book.hash);
    
    if (existingIndex !== -1) {
      books[existingIndex] = book;
    } else {
      books.push(book);
    }
    
    this.saveBooksToStorage(books);
  }

  /**
   * 从本地存储移除书籍
   */
  private removeBookFromStorage(hash: string): void {
    const books = this.getBooksFromStorage();
    const filteredBooks = books.filter(book => book.hash !== hash);
    this.saveBooksToStorage(filteredBooks);
  }

  /**
   * 保存书籍封面
   */
  private async saveBookCover(hash: string, coverBlob: Blob): Promise<void> {
    try {
      const base64 = await this.blobToBase64(coverBlob);
      localStorage.setItem(`book_cover_${hash}`, base64);
    } catch (error) {
      console.error('❌ BookService: 保存封面失败:', error);
    }
  }

  /**
   * 移除书籍封面
   */
  private removeBookCover(hash: string): void {
    localStorage.removeItem(`book_cover_${hash}`);
  }

  /**
   * Blob转Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// 导出单例实例
export const bookServiceV2 = BookServiceV2.getInstance(); 