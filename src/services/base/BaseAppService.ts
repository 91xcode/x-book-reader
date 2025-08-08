/**
 * 基础应用服务抽象类
 * 定义所有平台通用的接口和方法
 * 参考readest项目的BaseAppService设计
 */

export type AppPlatform = 'electron' | 'web';

export interface FileSystemInterface {
  saveBookFile(hash: string, file: File): Promise<void>;
  getBookFile(hash: string): Promise<File | null>;
  deleteBookFile(hash: string): Promise<void>;
  fileExists(hash: string): Promise<boolean>;
  getBooksDirectory?(): Promise<string | null>;
  getStorageUsage?(): Promise<{ used: number; available: number }>;
}

export abstract class BaseAppService {
  // 平台标识
  abstract readonly appPlatform: AppPlatform;
  
  // 文件系统接口
  abstract readonly fs: FileSystemInterface;
  
  // 是否为移动端
  abstract readonly isMobile: boolean;

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    console.log(`🚀 初始化 ${this.appPlatform} 应用服务`);
    await this.loadSettings();
  }

  /**
   * 加载设置
   */
  async loadSettings(): Promise<void> {
    // 子类可以重写此方法
    console.log(`📋 加载 ${this.appPlatform} 平台设置`);
  }

  /**
   * 导入书籍文件
   */
  async importBookFile(hash: string, file: File): Promise<void> {
    console.log(`📚 导入书籍 [${this.appPlatform}]:`, { 
      hash: hash.substring(0, 8) + '...', 
      fileName: file.name, 
      size: this.formatFileSize(file.size) 
    });
    
    try {
      await this.fs.saveBookFile(hash, file);
      console.log(`✅ 书籍导入成功 [${this.appPlatform}]`);
    } catch (error) {
      console.error(`❌ 书籍导入失败 [${this.appPlatform}]:`, error);
      throw error;
    }
  }

  /**
   * 获取书籍文件
   */
  async getBookFile(hash: string): Promise<File | null> {
    console.debug(`📖 获取书籍文件 [${this.appPlatform}]:`, hash.substring(0, 8) + '...');
    
    try {
      const file = await this.fs.getBookFile(hash);
      if (file) {
        console.debug(`✅ 书籍文件获取成功 [${this.appPlatform}]:`, file.name);
      } else {
        console.debug(`📂 书籍文件不存在 [${this.appPlatform}]`);
      }
      return file;
    } catch (error) {
      console.error(`❌ 书籍文件获取失败 [${this.appPlatform}]:`, error);
      throw error;
    }
  }

  /**
   * 删除书籍文件
   */
  async deleteBookFile(hash: string): Promise<void> {
    console.log(`🗑️ 删除书籍文件 [${this.appPlatform}]:`, hash.substring(0, 8) + '...');
    
    try {
      await this.fs.deleteBookFile(hash);
      console.log(`✅ 书籍文件删除成功 [${this.appPlatform}]`);
    } catch (error) {
      console.error(`❌ 书籍文件删除失败 [${this.appPlatform}]:`, error);
      throw error;
    }
  }

  /**
   * 检查书籍文件是否存在
   */
  async bookFileExists(hash: string): Promise<boolean> {
    try {
      return await this.fs.fileExists(hash);
    } catch (error) {
      console.error(`❌ 检查文件存在性失败 [${this.appPlatform}]:`, error);
      return false;
    }
  }

  /**
   * 获取存储目录（如果支持）
   */
  async getBooksDirectory(): Promise<string | null> {
    if (this.fs.getBooksDirectory) {
      return await this.fs.getBooksDirectory();
    }
    return null;
  }

  /**
   * 获取存储使用情况（如果支持）
   */
  async getStorageUsage(): Promise<{ used: number; available: number } | null> {
    if (this.fs.getStorageUsage) {
      return await this.fs.getStorageUsage();
    }
    return null;
  }

  /**
   * 格式化文件大小
   */
  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取平台信息
   */
  getPlatformInfo(): { platform: AppPlatform; isMobile: boolean } {
    return {
      platform: this.appPlatform,
      isMobile: this.isMobile
    };
  }
} 