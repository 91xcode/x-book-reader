/**
 * Electron应用服务
 * 使用Electron的IPC和本地文件系统
 * 参考readest项目的NativeAppService设计
 */

import { BaseAppService, FileSystemInterface, AppPlatform } from './base/BaseAppService';

// Electron API类型定义
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
 * Electron文件系统实现
 */
class ElectronFileSystem implements FileSystemInterface {
  /**
   * 保存书籍文件到本地文件系统
   */
  async saveBookFile(hash: string, file: File): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    console.log('📁 Electron: 保存文件到本地文件系统', {
      hash: hash.substring(0, 8) + '...',
      fileName: file.name,
      size: file.size
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Array.from(new Uint8Array(arrayBuffer));
    
    const result = await window.electronAPI.saveBookFile(hash, buffer, file.name);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save book file');
    }
    
    console.log('✅ Electron: 文件保存成功 ->', result.path);
  }

  /**
   * 从本地文件系统获取书籍文件
   */
  async getBookFile(hash: string): Promise<File | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    console.log('📁 Electron: 从本地文件系统获取文件', {
      hash: hash.substring(0, 8) + '...'
    });

    const result = await window.electronAPI.getBookFile(hash);
    
    if (!result.success) {
      if (result.error === 'File not found') {
        console.log('📂 Electron: 文件不存在');
        return null;
      }
      throw new Error(result.error || 'Failed to get book file');
    }
    
    if (!result.buffer || !result.fileName) {
      throw new Error('Invalid file data received from Electron');
    }
    
    const uint8Array = new Uint8Array(result.buffer);
    const file = new File([uint8Array], result.fileName);
    
    console.log('✅ Electron: 文件获取成功', {
      fileName: file.name,
      size: file.size
    });
    
    return file;
  }

  /**
   * 从本地文件系统删除书籍文件
   */
  async deleteBookFile(hash: string): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    console.log('📁 Electron: 从本地文件系统删除文件', {
      hash: hash.substring(0, 8) + '...'
    });

    const result = await window.electronAPI.deleteBookFile(hash);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete book file');
    }
    
    console.log('✅ Electron: 文件删除成功');
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(hash: string): Promise<boolean> {
    try {
      const file = await this.getBookFile(hash);
      return file !== null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('File not found')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * 获取书籍存储目录路径
   */
  async getBooksDirectory(): Promise<string | null> {
    if (!window.electronAPI) {
      return null;
    }
    
    try {
      return await window.electronAPI.getBooksDirectory();
    } catch (error) {
      console.error('❌ Electron: 获取存储目录失败:', error);
      return null;
    }
  }
}

/**
 * Electron应用服务
 */
export class ElectronAppService extends BaseAppService {
  readonly appPlatform: AppPlatform = 'electron';
  readonly fs: FileSystemInterface = new ElectronFileSystem();
  readonly isMobile: boolean = false; // Electron应用通常在桌面端

  /**
   * 检查Electron环境是否可用
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           !!window.isElectron && 
           !!window.electronAPI;
  }

  /**
   * 加载Electron特定设置
   */
  async loadSettings(): Promise<void> {
    await super.loadSettings();
    
    console.log('⚙️ Electron: 加载平台特定设置');
    
    // 检查Electron API可用性
    if (!ElectronAppService.isAvailable()) {
      console.warn('⚠️ Electron: API不可用，某些功能可能受限');
    }
    
    // 获取存储目录信息
    const booksDir = await this.getBooksDirectory();
    if (booksDir) {
      console.log('📁 Electron: 书籍存储目录 ->', booksDir);
    }
  }

  /**
   * 获取详细的平台信息
   */
  getPlatformInfo() {
    const baseInfo = super.getPlatformInfo();
    return {
      ...baseInfo,
      isElectronAvailable: ElectronAppService.isAvailable(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };
  }
} 