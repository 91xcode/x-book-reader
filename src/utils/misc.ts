export const uniqueId = () => Math.random().toString(36).substring(2, 9);

// Simple MD5 hash implementation using crypto API
export const md5 = async (content: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data); // Using SHA-256 as substitute
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
};

// Synchronous version for compatibility
export const md5Sync = (content: string): string => {
  // Simple hash using built-in string methods for immediate use
  let hash = 0;
  if (content.length === 0) return hash.toString();
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

export const getContentMd5 = (content: unknown): string => {
  return md5Sync(JSON.stringify(content));
};

export const makeSafeFilename = (filename: string, replacement = '_'): string => {
  // Windows restricted characters + control characters and reserved names
  const unsafeCharacters = /[<>:"\/\\|?*\x00-\x1F]/g;
  const reservedFilenames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  // Unsafe to use filename including file extensions over 255 bytes on Android
  const maxFilenameBytes = 250;

  let safeName = filename.replace(unsafeCharacters, replacement);

  if (reservedFilenames.test(safeName)) {
    safeName = `${safeName}${replacement}`;
  }

  const encoder = new TextEncoder();
  let utf8Bytes = encoder.encode(safeName);

  while (utf8Bytes.length > maxFilenameBytes) {
    safeName = safeName.slice(0, -1);
    utf8Bytes = encoder.encode(safeName);
  }

  return safeName;
}; 

// CJK 环境检测（来自 readest 项目）
export const detectCJKEnvironment = () => {
  const browserLanguage = navigator.language || '';
  const uiLanguage = (typeof localStorage !== 'undefined' && localStorage?.getItem('i18nextLng')) || '';
  const isCJKUI = ['zh', 'ja', 'ko'].some((lang) => uiLanguage.startsWith(lang));
  const isCJKLocale = ['zh', 'ja', 'ko'].some((lang) => browserLanguage.startsWith(lang));
  return isCJKLocale || isCJKUI;
}; 

// 🌐 检测是否为CJK环境
export const isCJKEnv = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // 检查浏览器语言设置
  const userLanguage = navigator.language || (navigator as any).userLanguage;
  const languages = navigator.languages || [userLanguage];
  
  const cjkLanguages = ['zh', 'ja', 'ko', 'zh-CN', 'zh-TW', 'zh-HK', 'ja-JP', 'ko-KR'];
  
  return languages.some(lang => 
    cjkLanguages.some(cjkLang => lang.toLowerCase().startsWith(cjkLang.toLowerCase()))
  );
};

// 📚 获取书籍主要语言
export const getPrimaryLanguage = (language: string | string[] | null | undefined): string => {
  if (!language) return 'en';
  if (Array.isArray(language)) return language[0] || 'en';
  return language;
};

// 📝 格式化标题
export const formatTitle = (title: string | undefined): string => {
  if (!title) return 'Untitled';
  return title.trim();
};

// 📄 获取基础文件名（无扩展名）
export const getBaseFilename = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
};

// 🔗 检查是否为有效URL
export const isValidURL = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// 🎯 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 🔄 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}; 