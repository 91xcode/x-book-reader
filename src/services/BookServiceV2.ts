/**
 * 书籍服务 V2
 * 使用环境感知的应用服务架构
 * 参考readest项目的设计模式
 */

import { Book, BookFormat } from '@/types/book';
import { getAppService } from './environment';

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

      // 生成书籍哈希（简化实现）
      const hash = await this.generateBookHash(file);
      console.log('🔑 BookService: 书籍哈希:', hash.substring(0, 8) + '...');

      onStatusChange?.('正在检查文件是否已存在...');
      onProgress?.(20);

      // 获取环境感知的应用服务
      const appService = await getAppService();
      
      // 检查书籍是否已存在
      if (!overwrite && await appService.bookFileExists(hash)) {
        console.log('📖 BookService: 书籍已存在，跳过导入');
        
        // 尝试从存储中获取书籍信息
        const existingBooks = this.getBooksFromStorage();
        const existingBook = existingBooks.find(book => book.hash === hash);
        
        if (existingBook) {
          return { success: true, book: existingBook };
        }
      }

      onStatusChange?.('正在解析书籍内容...');
      onProgress?.(40);

      // 解析书籍（简化实现）
      const bookData = await this.parseBookFile(file);

      onStatusChange?.('正在保存书籍文件...');
      onProgress?.(60);

      // 保存书籍文件到存储（使用环境感知的文件系统）
      await appService.importBookFile(hash, file);

      onStatusChange?.('正在生成书籍信息...');
      onProgress?.(80);

      // 创建书籍对象
      const book: Book = {
        hash,
        title: bookData.title || file.name.replace(/\.[^/.]+$/, ''),
        author: bookData.author || '未知作者',
        description: bookData.description || '',
        primaryLanguage: bookData.language || 'zh-CN',
        format: this.detectBookFormat(file),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        readingStatus: 'unread' as const,
        metadata: {
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          language: bookData.language,
          publisher: bookData.publisher,
          published: bookData.published,
          series: bookData.series,
          identifier: bookData.isbn
        }
      };

      onStatusChange?.('正在保存书籍信息...');
      onProgress?.(90);

      // 保存书籍信息到本地存储
      this.saveBookToStorage(book);

      // 生成并保存封面
      if (bookData.cover) {
        await this.saveBookCover(hash, bookData.cover);
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
   * 检测书籍格式
   */
  private detectBookFormat(file: File): BookFormat {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'epub':
        return 'EPUB';
      case 'pdf':
        return 'PDF';
      case 'txt':
        return 'TXT';
      case 'mobi':
        return 'MOBI';
      case 'azw3':
        return 'AZW3';
      case 'fb2':
        return 'FB2';
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
   * 解析书籍文件（简化实现）
   */
  private async parseBookFile(file: File): Promise<any> {
    // 简化的书籍解析，返回基础信息
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    
    return {
      title: fileName,
      author: '未知作者',
      description: '',
      language: 'zh-CN',
      publisher: '',
      published: '',
      series: '',
      isbn: '',
      cover: null,
      spine: []
    };
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