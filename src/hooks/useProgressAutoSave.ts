import { useCallback, useEffect } from 'react';
import { useReaderStore } from '@/store/readerStore';

// 简单的throttle函数
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    const self = this;
    if (!inThrottle) {
      func.apply(self, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const useProgressAutoSave = (bookKey: string) => {
  const { getProgress } = useReaderStore();
  const progress = getProgress(bookKey);

  // 节流保存函数
  const saveBookConfig = useCallback(
    throttle(async () => {
      if (!progress) return;
      
      // 简化的本地保存实现
      // 在实际应用中，这里应该保存到文件系统或数据库
      try {
        const configKey = `book_config_${bookKey}`;
        const configData = {
          bookKey,
          progress,
          updatedAt: Date.now(),
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(configKey, JSON.stringify(configData));
          console.log('Auto-saved book config:', bookKey);
        }
      } catch (error) {
        console.error('Failed to auto-save book config:', error);
      }
    }, 10000), // 10秒节流
    [bookKey, progress]
  );

  useEffect(() => {
    if (progress) {
      saveBookConfig();
    }
  }, [progress, saveBookConfig]);
}; 