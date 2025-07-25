/**
 * 环境感知配置
 * 根据运行环境自动选择合适的应用服务
 * 参考readest项目的environment.ts设计
 */

import { BaseAppService } from './base/BaseAppService';

// 简化的环境检测函数
export const hasElectronAPI = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
};

export const hasIndexedDB = (): boolean => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

/**
 * 环境配置接口
 */
export interface EnvironmentConfig {
  getAppService: () => Promise<BaseAppService>;
  getCurrentEnvironment: () => {
    type: 'electron' | 'web';
    hasElectronAPI: boolean;
    hasIndexedDB: boolean;
  };
}

// 服务实例缓存
let electronAppService: BaseAppService | null = null;
let webAppService: BaseAppService | null = null;

/**
 * 获取Electron应用服务实例
 */
const getElectronAppService = async (): Promise<BaseAppService> => {
  if (!electronAppService) {
    console.log('🔧 Environment: 初始化Electron应用服务');
    
    const { ElectronAppService } = await import('./ElectronAppService');
    electronAppService = new ElectronAppService();
    await electronAppService.initialize();
  }
  return electronAppService;
};

/**
 * 获取Web应用服务实例
 */
const getWebAppService = async (): Promise<BaseAppService> => {
  if (!webAppService) {
    console.log('🔧 Environment: 初始化Web应用服务');
    
    const { WebAppService } = await import('./WebAppService');
    webAppService = new WebAppService();
    await webAppService.initialize();
  }
  return webAppService;
};

/**
 * 环境配置实现 - 简化版本，遵循readest的逻辑
 */
const environmentConfig: EnvironmentConfig = {
  /**
   * 根据环境自动选择合适的应用服务
   * 检测顺序：1. electronAPI -> 2. IndexedDB
   */
  getAppService: async (): Promise<BaseAppService> => {
    console.log('🔍 Environment: 检测运行环境...');
    
    // 第一优先级：检查electronAPI是否可用
    if (hasElectronAPI()) {
      console.log('🚀 Environment: 检测到electronAPI，选择Electron应用服务');
      return await getElectronAppService();
    }
    
    // 第二优先级：检查IndexedDB是否可用
    if (hasIndexedDB()) {
      console.log('🌐 Environment: electronAPI不可用，回退到Web应用服务');
      return await getWebAppService();
    }
    
    // 都不支持就报错
    console.error('❌ Environment: 既没有electronAPI也没有IndexedDB支持');
    throw new Error('No suitable storage available (neither electronAPI nor IndexedDB)');
  },

  /**
   * 获取当前环境信息
   */
  getCurrentEnvironment: () => {
    const electronAPI = hasElectronAPI();
    const indexedDB = hasIndexedDB();
    
    return {
      type: electronAPI ? 'electron' : 'web',
      hasElectronAPI: electronAPI,
      hasIndexedDB: indexedDB
    };
  }
};

/**
 * 全局应用服务实例（懒加载）
 */
let globalAppService: BaseAppService | null = null;

/**
 * 获取全局应用服务实例
 * 这是应用程序的主要入口点
 */
export const getAppService = async (): Promise<BaseAppService> => {
  if (!globalAppService) {
    console.log('🌟 Environment: 初始化全局应用服务');
    globalAppService = await environmentConfig.getAppService();
    
    // 打印服务信息
    const platformInfo = globalAppService.getPlatformInfo();
    console.log('🌟 Environment: 全局应用服务初始化完成', platformInfo);
  }
  
  return globalAppService;
};

/**
 * 重置应用服务（用于测试或环境切换）
 */
export const resetAppService = (): void => {
  console.log('🔄 Environment: 重置应用服务');
  globalAppService = null;
  electronAppService = null;
  webAppService = null;
};

/**
 * 检查特定环境的支持情况
 */
export const checkEnvironmentSupport = (): {
  electron: { available: boolean; reason?: string };
  web: { available: boolean; reason?: string };
} => {
  const result = {
    electron: { available: false, reason: undefined as string | undefined },
    web: { available: false, reason: undefined as string | undefined }
  };

  // 检查Electron支持
  if (typeof window === 'undefined') {
    result.electron.reason = 'Window对象不可用';
  } else if (!window.isElectron) {
    result.electron.reason = 'window.isElectron未设置';
  } else if (!(window as any).electronAPI) {
    result.electron.reason = 'window.electronAPI不可用';
  } else {
    result.electron.available = true;
  }

  // 检查Web支持
  if (typeof window === 'undefined') {
    result.web.reason = 'Window对象不可用';
  } else if (!('indexedDB' in window)) {
    result.web.reason = 'IndexedDB不支持';
  } else {
    result.web.available = true;
  }

  return result;
};

// 导出环境配置（用于高级用法）
export default environmentConfig; 