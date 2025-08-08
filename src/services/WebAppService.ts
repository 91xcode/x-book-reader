/**
 * Web应用服务
 * 使用IndexedDB进行文件存储
 * 参考readest项目的WebAppService设计
 */

import { BaseAppService, FileSystemInterface, AppPlatform } from './base/BaseAppService';

// IndexedDB相关常量
const DB_NAME = 'BookFileSystem';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// 🔧 数据库连接缓存，避免重复连接和日志
let dbCache: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * 打开IndexedDB数据库（带缓存）
 */
async function openIndexedDB(): Promise<IDBDatabase> {
  // 如果已有缓存的连接，直接返回
  if (dbCache && !dbCache.isClosed) {
    return dbCache;
  }
  
  // 如果正在连接中，返回相同的Promise
  if (dbPromise) {
    return dbPromise;
  }
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // 创建对象存储，使用路径作为主键
        db.createObjectStore(STORE_NAME, { keyPath: 'path' });
        console.log('📊 IndexedDB: 创建文件存储结构');
      }
    };

    request.onsuccess = () => {
      dbCache = request.result;
      console.log('📊 IndexedDB: 数据库连接成功');
      
      // 监听数据库关闭事件，清除缓存
      dbCache.onclose = () => {
        dbCache = null;
        dbPromise = null;
      };
      
      resolve(dbCache);
    };
    
    request.onerror = () => {
      dbPromise = null;
      console.error('❌ IndexedDB: 数据库连接失败:', request.error);
      reject(request.error);
    };
  });
  
  return dbPromise;
}

/**
 * 检测用户设备平台
 */
function detectMobilePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

/**
 * Web文件系统实现（基于IndexedDB）
 */
class WebFileSystem implements FileSystemInterface {
  /**
   * 保存书籍文件到IndexedDB
   */
  async saveBookFile(hash: string, file: File): Promise<void> {
    console.log('💾 IndexedDB: 保存文件', {
      hash: hash.substring(0, 8) + '...',
      fileName: file.name,
      size: file.size
    });
    
    const db = await openIndexedDB();
    const arrayBuffer = await file.arrayBuffer();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore('files');
      
      // 存储文件数据和元数据
      const fileData = {
        path: `book_${hash}`,
        content: arrayBuffer,
        metadata: {
          fileName: file.name,
          fileType: file.type,
          size: file.size,
          savedAt: Date.now()
        }
      };
      
      store.put(fileData);
      
      transaction.oncomplete = () => {
        console.log('✅ IndexedDB: 文件保存成功');
        resolve();
      };
      
      transaction.onerror = () => {
        console.error('❌ IndexedDB: 文件保存失败:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * 从IndexedDB获取书籍文件
   */
  async getBookFile(hash: string): Promise<File | null> {
    console.debug('💾 IndexedDB: 获取文件', {
      hash: hash.substring(0, 8) + '...'
    });
    
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(`book_${hash}`);
      
      request.onsuccess = () => {
        if (request.result) {
          const { content, metadata } = request.result;
          const file = new File([content], metadata.fileName, { 
            type: metadata.fileType 
          });
          console.debug('✅ IndexedDB: 文件获取成功', {
            fileName: file.name,
            size: file.size
          });
          resolve(file);
        } else {
          console.log('📂 IndexedDB: 文件不存在');
          resolve(null);
        }
      };
      
      request.onerror = () => {
        console.error('❌ IndexedDB: 文件获取失败:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 从IndexedDB删除书籍文件
   */
  async deleteBookFile(hash: string): Promise<void> {
    console.log('💾 IndexedDB: 删除文件', {
      hash: hash.substring(0, 8) + '...'
    });
    
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore('files');
      
      store.delete(`book_${hash}`);
      
      transaction.oncomplete = () => {
        console.log('✅ IndexedDB: 文件删除成功');
        resolve();
      };
      
      transaction.onerror = () => {
        console.error('❌ IndexedDB: 文件删除失败:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(hash: string): Promise<boolean> {
    try {
      const file = await this.getBookFile(hash);
      return file !== null;
    } catch {
      return false;
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0
        };
      } catch (error) {
        console.warn('⚠️ IndexedDB: 无法获取存储使用情况:', error);
        return { used: 0, available: 0 };
      }
    }
    return { used: 0, available: 0 };
  }
}

/**
 * Web应用服务
 */
export class WebAppService extends BaseAppService {
  readonly appPlatform: AppPlatform = 'web';
  readonly fs: FileSystemInterface = new WebFileSystem();
  readonly isMobile: boolean = detectMobilePlatform();

  /**
   * 检查Web环境是否支持IndexedDB
   */
  static isIndexedDBSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  /**
   * 加载Web特定设置
   */
  async loadSettings(): Promise<void> {
    await super.loadSettings();
    
    console.log('⚙️ Web: 加载平台特定设置');
    
    // 检查IndexedDB支持
    if (!WebAppService.isIndexedDBSupported()) {
      console.error('❌ Web: IndexedDB不支持，文件存储功能将受限');
      throw new Error('IndexedDB is not supported in this environment');
    }
    
    // 获取存储使用情况
    const usage = await this.getStorageUsage();
    if (usage) {
      const usedMB = Math.round(usage.used / 1024 / 1024);
      const availableMB = Math.round(usage.available / 1024 / 1024);
      console.log(`💾 Web: 存储使用情况 - 已用: ${usedMB}MB / 可用: ${availableMB}MB`);
      
      // 警告存储空间不足
      if (usage.available > 0 && usage.used / usage.available > 0.8) {
        console.warn('⚠️ Web: 存储空间不足，建议清理部分文件');
      }
    }
  }

  /**
   * 获取详细的平台信息
   */
  getPlatformInfo() {
    const baseInfo = super.getPlatformInfo();
    return {
      ...baseInfo,
      isIndexedDBSupported: WebAppService.isIndexedDBSupported(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      language: typeof navigator !== 'undefined' ? navigator.language : 'unknown'
    };
  }

  /**
   * 检查是否为PWA环境
   */
  isPWA(): boolean {
    return typeof window !== 'undefined' && 
           window.matchMedia('(display-mode: standalone)').matches;
  }

  /**
   * 获取Web应用特有的信息
   */
  getWebAppInfo() {
    return {
      ...this.getPlatformInfo(),
      isPWA: this.isPWA(),
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      cookieEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : false
    };
  }
} 