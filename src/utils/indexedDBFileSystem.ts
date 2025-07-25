/**
 * IndexedDB文件系统实现
 * 参考readest项目的WebAppService设计
 * 支持大文件存储，容量比localStorage大得多
 */

const DB_NAME = 'BookFileSystem';
const DB_VERSION = 1;
const STORE_NAME = 'files';

/**
 * 打开IndexedDB数据库
 */
async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // 创建对象存储，使用路径作为主键
        db.createObjectStore(STORE_NAME, { keyPath: 'path' });
      }
    };

    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

/**
 * IndexedDB文件系统服务
 */
export class IndexedDBFileSystem {
  /**
   * 保存文件到IndexedDB
   */
  async saveFile(hash: string, file: File): Promise<void> {
    console.log('IndexedDB: 保存文件', { hash, fileName: file.name, size: file.size });
    
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
   * 从IndexedDB获取文件
   */
  async getFile(hash: string): Promise<File | null> {
    console.log('IndexedDB: 获取文件', { hash });
    
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
          console.log('✅ IndexedDB: 文件获取成功');
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
   * 删除文件
   */
  async deleteFile(hash: string): Promise<void> {
    console.log('IndexedDB: 删除文件', { hash });
    
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
      const file = await this.getFile(hash);
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
      } catch {
        return { used: 0, available: 0 };
      }
    }
    return { used: 0, available: 0 };
  }

  /**
   * 列出所有文件
   */
  async listFiles(): Promise<string[]> {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore('files');
      const request = store.getAllKeys();
      
      request.onsuccess = () => {
        const keys = request.result as string[];
        const hashes = keys
          .filter(key => key.startsWith('book_'))
          .map(key => key.replace('book_', ''));
        resolve(hashes);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// 导出单例实例
export const indexedDBFileSystem = new IndexedDBFileSystem(); 