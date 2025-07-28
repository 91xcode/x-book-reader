// 全局字体管理器 - 确保字体设置能正确应用到所有内容

import { ViewSettings } from '@/types/book';
import { applyFontStyles } from './fontStyles';

let currentFontSettings: ViewSettings | null = null;

/**
 * 设置全局字体配置
 */
export const setGlobalFontSettings = (settings: ViewSettings) => {
  currentFontSettings = settings;
  console.log('🌍 设置全局字体配置:', settings);
  
  // 应用到主页面
  applyFontStyles(settings);
  
  // 应用到所有iframe（如果有）
  applyFontToIframes(settings);
  
  // 触发自定义事件，通知其他组件
  const event = new CustomEvent('globalFontChanged', { 
    detail: settings 
  });
  window.dispatchEvent(event);
};

/**
 * 获取当前全局字体配置
 */
export const getGlobalFontSettings = (): ViewSettings | null => {
  return currentFontSettings;
};

/**
 * 应用字体到所有iframe
 */
const applyFontToIframes = (settings: ViewSettings) => {
  const iframes = document.querySelectorAll('iframe');
  
  iframes.forEach((iframe) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        console.log('📄 应用字体到iframe:', iframe.src || 'about:blank');
        
        // 移除旧的字体样式
        const existingStyle = iframeDoc.getElementById('global-font-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        // 创建新的字体样式
        const style = iframeDoc.createElement('style');
        style.id = 'global-font-styles';
        style.textContent = generateIframeFontStyles(settings);
        
        if (iframeDoc.head) {
          iframeDoc.head.appendChild(style);
        } else {
          // 如果head不存在，等待DOM加载
          iframe.addEventListener('load', () => {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc && doc.head) {
              doc.head.appendChild(style);
            }
          });
        }
      }
    } catch (error) {
      // 跨域iframe可能无法访问，忽略错误
      console.log('⚠️ 无法访问iframe内容:', error instanceof Error ? error.message : String(error));
    }
  });
};

/**
 * 为iframe生成字体样式
 */
const generateIframeFontStyles = (settings: ViewSettings): string => {
  const {
    serifFont = 'Bitter',
    sansSerifFont = 'Roboto',
    monospaceFont = 'Consolas',
    defaultFont = 'Serif',
    defaultCJKFont = 'LXGW WenKai', // 使用真实的CDN字体名称
    defaultFontSize = 16,
    fontWeight = 400,
    overrideFont = false // 与readest保持一致的默认值
  } = settings;

  const fontFamily = defaultFont.toLowerCase() === 'serif' 
    ? `"${serifFont}", serif` 
    : `"${sansSerifFont}", sans-serif`;

  return `
    /* 全局字体设置 */
    html, body {
      font-family: ${fontFamily} ${overrideFont ? '!important' : ''};
      font-size: ${defaultFontSize}px !important;
      font-weight: ${fontWeight} !important;
    }
    
    /* 等宽字体 */
    code, pre, tt, kbd, samp {
      font-family: "${monospaceFont}", monospace !important;
    }
    
    /* 中文字体 */
    [lang*="zh"], [lang*="ja"], [lang*="ko"], .cjk {
      font-family: "${defaultCJKFont}", ${fontFamily} !important;
    }
    
    /* 强制覆盖 */
    ${overrideFont ? `
    * {
      font-family: inherit !important;
    }
    p, div, span, h1, h2, h3, h4, h5, h6 {
      font-family: ${fontFamily} !important;
    }
    ` : ''}
  `;
};

/**
 * 监听iframe加载，自动应用字体设置
 */
export const setupIframeMonitoring = () => {
  // 监听新iframe的加载
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const iframes = element.tagName === 'IFRAME' 
            ? [element as HTMLIFrameElement] 
            : Array.from(element.querySelectorAll('iframe'));
          
          iframes.forEach((iframe) => {
            iframe.addEventListener('load', () => {
              if (currentFontSettings) {
                console.log('🔄 新iframe加载，应用字体设置');
                applyFontToIframes(currentFontSettings);
              }
            });
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
};

/**
 * 初始化全局字体管理器
 */
export const initializeGlobalFontManager = () => {
  console.log('🚀 初始化全局字体管理器');
  
  // 设置iframe监听
  setupIframeMonitoring();
  
  // 监听页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (currentFontSettings) {
        applyFontToIframes(currentFontSettings);
      }
    });
  }
  
  return {
    setGlobalFontSettings,
    getGlobalFontSettings,
  };
}; 