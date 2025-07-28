/**
 * CJK (中文、日文、韩文) 环境检测工具
 * 参考 readest 项目的实现
 */

/**
 * 检测当前是否为CJK环境
 * @returns {boolean} 是否为CJK环境
 */
export const isCJKEnv = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const browserLanguage = navigator.language || '';
  const uiLanguage = localStorage?.getItem('i18nextLng') || '';
  
  // 检测UI语言是否为CJK
  const isCJKUI = ['zh', 'ja', 'ko'].some((lang) => uiLanguage.startsWith(lang));
  
  // 检测浏览器语言是否为CJK  
  const isCJKLocale = ['zh', 'ja', 'ko'].some((lang) => browserLanguage.startsWith(lang));
  
  return isCJKLocale || isCJKUI;
};

/**
 * 检测字符串是否包含CJK字符
 * @param str 待检测的字符串
 * @returns {boolean} 是否包含CJK字符
 */
export const isCJKStr = (str: string): boolean => {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(str ?? '');
};

/**
 * 检测语言代码是否为CJK语言
 * @param lang 语言代码 (如 'zh-CN', 'ja', 'ko-KR')
 * @returns {boolean} 是否为CJK语言
 */
export const isCJKLang = (lang: string | null | undefined): boolean => {
  if (!lang) return false;
  const normalizedLang = lang.split('-')[0]!.toLowerCase();
  return ['zh', 'ja', 'ko'].includes(normalizedLang);
};

/**
 * 检测书籍或内容是否需要CJK字体支持
 * @param bookKey 书籍标识
 * @param contentSample 内容样本 (可选)
 * @returns {boolean} 是否需要CJK字体支持
 */
export const shouldUseCJKFont = (bookKey?: string, contentSample?: string): boolean => {
  // 检测环境
  if (isCJKEnv()) return true;
  
  // 检测书籍标识中是否包含CJK相关信息
  if (bookKey && isCJKStr(bookKey)) return true;
  
  // 检测内容样本中是否包含CJK字符
  if (contentSample && isCJKStr(contentSample)) return true;
  
  return false;
}; 