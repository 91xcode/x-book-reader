// Declare global types for Electron API
declare global {
  interface Window {
    electronAPI?: {
      saveBookFile: (hash: string, buffer: number[], fileName: string) => Promise<{
        success: boolean;
        path?: string;
        error?: string;
      }>;
      getBookFile: (hash: string) => Promise<{
        success: boolean;
        buffer?: number[];
        fileName?: string;
        error?: string;
      }>;
      deleteBookFile: (hash: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
      getBooksDirectory: () => Promise<string>;
    };
    isElectron?: boolean;
  }
}

/**
 * File system utility for handling book files
 * Uses Electron's file system in desktop app, falls back to localStorage in browser
 */
export class FileSystemService {
  private static instance: FileSystemService;
  private isElectron: boolean;

  private constructor() {
    this.isElectron = typeof window !== 'undefined' && !!window.isElectron;
    
    // 调试信息
    if (typeof window !== 'undefined') {
      console.log('FileSystemService初始化:');
      console.log('- typeof window:', typeof window);
      console.log('- window.isElectron:', window.isElectron);
      console.log('- window.electronAPI:', !!window.electronAPI);
      console.log('- window.electronAPI methods:', window.electronAPI ? Object.keys(window.electronAPI) : 'undefined');
      console.log('- this.isElectron:', this.isElectron);
      console.log('- 最终判断 (isElectron && electronAPI):', this.isElectron && !!window.electronAPI);
      console.log('- 使用文件系统:', this.isElectron && !!window.electronAPI ? 'Electron文件系统' : 'localStorage回退');
      
      // 打印所有window属性，查看有哪些可用
      console.log('- window对象所有属性:', Object.keys(window).filter(key => key.includes('electron') || key.includes('Electron')));
      
      // 检查是否在iframe中
      console.log('- window === top:', window === top);
      console.log('- userAgent:', navigator.userAgent);
      
      // 检查IndexedDB支持
      const indexedDBSupported = 'indexedDB' in window;
      console.log('- IndexedDB支持:', indexedDBSupported);
      
      if (!this.isElectron || !window.electronAPI) {
        console.log('💾 将使用存储方案:', indexedDBSupported ? 'IndexedDB (大容量)' : 'localStorage (受限)');
      }
    }
  }

  static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService();
    }
    return FileSystemService.instance;
  }

  /**
   * Save a book file
   */
  async saveBookFile(hash: string, file: File): Promise<void> {
    console.log('saveBookFile called:');
    console.log('- hash:', hash);
    console.log('- file.name:', file.name);
    console.log('- file.size:', file.size);
    console.log('- this.isElectron:', this.isElectron);
    console.log('- window.electronAPI available:', !!window.electronAPI);
    
    // 强制尝试使用Electron API，不管检测结果如何
    try {
      if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.saveBookFile) {
        console.log('- 尝试使用: Electron文件系统API');
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Array.from(new Uint8Array(arrayBuffer));
        
        const result = await window.electronAPI.saveBookFile(hash, buffer, file.name);
        
        if (result.success) {
          console.log('✅ Book file saved to:', result.path);
          return; // 成功，直接返回
        } else {
          console.warn('⚠️ Electron API failed:', result.error);
          throw new Error(result.error || 'Electron API failed');
        }
      } else {
        throw new Error('Electron API not available');
      }
    } catch (electronError) {
      console.error('❌ Electron文件系统失败:', electronError);
      console.log('🔄 回退到IndexedDB...');
      
      // 如果Electron API失败，使用IndexedDB回退
      const { indexedDBFileSystem } = await import('./indexedDBFileSystem');
      await indexedDBFileSystem.saveFile(hash, file);
    }
  }

  /**
   * Get a book file
   */
  async getBookFile(hash: string): Promise<File | null> {
    console.log('getBookFile called for hash:', hash);
    
    // 强制尝试使用Electron API
    try {
      if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.getBookFile) {
        console.log('- 尝试使用: Electron文件系统API');
        
        const result = await window.electronAPI.getBookFile(hash);
        
        if (result.success) {
          if (!result.buffer || !result.fileName) {
            throw new Error('Invalid file data received');
          }
          
          const uint8Array = new Uint8Array(result.buffer);
          console.log('✅ Book file loaded from Electron filesystem');
          return new File([uint8Array], result.fileName);
        } else {
          if (result.error === 'File not found') {
            console.log('📂 File not found in Electron filesystem');
            return null;
          }
          throw new Error(result.error || 'Electron API failed');
        }
      } else {
        throw new Error('Electron API not available');
      }
    } catch (electronError) {
      console.error('❌ Electron文件系统失败:', electronError);
      console.log('🔄 回退到IndexedDB...');
      
      // 回退到IndexedDB
      const { indexedDBFileSystem } = await import('./indexedDBFileSystem');
      return await indexedDBFileSystem.getFile(hash);
    }
  }

  /**
   * Delete a book file
   */
  async deleteBookFile(hash: string): Promise<void> {
    console.log('deleteBookFile called for hash:', hash);
    
    // 强制尝试使用Electron API
    try {
      if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.deleteBookFile) {
        console.log('- 尝试使用: Electron文件系统API');
        
        const result = await window.electronAPI.deleteBookFile(hash);
        
        if (result.success) {
          console.log('✅ Book file deleted from Electron filesystem');
          return;
        } else {
          throw new Error(result.error || 'Electron API failed');
        }
      } else {
        throw new Error('Electron API not available');
      }
    } catch (electronError) {
      console.error('❌ Electron文件系统失败:', electronError);
      console.log('🔄 回退到IndexedDB...');
      
      // 回退到IndexedDB
      const { indexedDBFileSystem } = await import('./indexedDBFileSystem');
      await indexedDBFileSystem.deleteFile(hash);
    }
  }

  /**
   * Get books directory path (Electron only)
   */
  async getBooksDirectory(): Promise<string | null> {
    if (this.isElectron && window.electronAPI) {
      return await window.electronAPI.getBooksDirectory();
    }
    return null;
  }

  /**
   * Check if file exists
   */
  async fileExists(hash: string): Promise<boolean> {
    try {
      const file = await this.getBookFile(hash);
      return file !== null;
    } catch {
      return false;
    }
  }

  // Private methods for localStorage fallback

  private async saveBookFileToLocalStorage(hash: string, file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Split large files into chunks to avoid localStorage quota
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks: string[] = [];
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      let binaryString = '';
      const subChunkSize = 8192; // 8KB sub-chunks to avoid stack overflow
      
      for (let j = 0; j < chunk.length; j += subChunkSize) {
        const subChunk = chunk.slice(j, j + subChunkSize);
        binaryString += String.fromCharCode.apply(null, Array.from(subChunk));
      }
      
      chunks.push(btoa(binaryString));
    }
    
    // Save file metadata and chunks
    const fileData = {
      fileName: file.name,
      fileType: file.type,
      chunks: chunks.length,
      totalSize: uint8Array.length,
    };
    
    localStorage.setItem(`book_file_${hash}`, JSON.stringify(fileData));
    
    // Save each chunk separately
    chunks.forEach((chunk, index) => {
      localStorage.setItem(`book_file_${hash}_chunk_${index}`, chunk);
    });
  }

  private async getBookFileFromLocalStorage(hash: string): Promise<File | null> {
    try {
      const metadataStr = localStorage.getItem(`book_file_${hash}`);
      if (!metadataStr) return null;

      const metadata = JSON.parse(metadataStr);
      const chunks: string[] = [];
      
      // Read all chunks
      for (let i = 0; i < metadata.chunks; i++) {
        const chunk = localStorage.getItem(`book_file_${hash}_chunk_${i}`);
        if (!chunk) {
          throw new Error(`Missing chunk ${i}`);
        }
        chunks.push(chunk);
      }
      
      // Reconstruct file
      const uint8Array = new Uint8Array(metadata.totalSize);
      let offset = 0;
      
      chunks.forEach(chunk => {
        const binaryString = atob(chunk);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[offset + i] = binaryString.charCodeAt(i);
        }
        offset += binaryString.length;
      });
      
      return new File([uint8Array], metadata.fileName, { type: metadata.fileType });
    } catch (error) {
      console.error('Failed to get book file from localStorage:', error);
      return null;
    }
  }

  private deleteBookFileFromLocalStorage(hash: string): void {
    try {
      const metadataStr = localStorage.getItem(`book_file_${hash}`);
      if (metadataStr) {
        const metadata = JSON.parse(metadataStr);
        
        // Delete all chunks
        for (let i = 0; i < metadata.chunks; i++) {
          localStorage.removeItem(`book_file_${hash}_chunk_${i}`);
        }
      }
      
      // Delete metadata
      localStorage.removeItem(`book_file_${hash}`);
    } catch (error) {
      console.error('Failed to delete book file from localStorage:', error);
    }
  }
}

// Export singleton instance
export const fileSystem = FileSystemService.getInstance(); 