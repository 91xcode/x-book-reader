// 字体优化工具 - 解决预加载警告和性能问题

export interface FontPreloadConfig {
  href: string;
  as: 'font';
  crossOrigin: 'anonymous';
  importance?: 'high' | 'low';
}

// 核心字体配置（只预加载必需的字体）
export const getCriticalFonts = (): FontPreloadConfig[] => [
  {
    href: '/fonts/roboto/Roboto-Regular.woff2',
    as: 'font',
    crossOrigin: 'anonymous',
    importance: 'high'
  },
  {
    href: '/fonts/bitter/Bitter-Variable.ttf', 
    as: 'font',
    crossOrigin: 'anonymous',
    importance: 'high'
  },
  {
    href: '/fonts/lxgw/LXGWWenKai-Regular.ttf',
    as: 'font', 
    crossOrigin: 'anonymous',
    importance: 'high'
  }
];

// 次要字体配置（按需加载）
export const getSecondaryFonts = (): FontPreloadConfig[] => [
  {
    href: '/fonts/roboto/Roboto-Bold.woff2',
    as: 'font',
    crossOrigin: 'anonymous',
    importance: 'low'
  }
];

// 动态字体预加载器
export const preloadFontsOnDemand = (fonts: FontPreloadConfig[]) => {
  if (typeof document === 'undefined') return;
  
  fonts.forEach(font => {
    // 检查是否已经预加载
    const existing = document.querySelector(`link[href="${font.href}"][rel="preload"]`);
    if (existing) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font.href;
    link.as = font.as;
    link.crossOrigin = font.crossOrigin;
    
    if (font.importance === 'high') {
      link.setAttribute('importance', 'high');
    }
    
    document.head.appendChild(link);
  });
};

// 检测页面是否需要粗体字体
export const detectBoldFontUsage = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  // 检查是否有粗体元素
  const boldElements = document.querySelectorAll('b, strong, .font-bold, [style*="font-weight: bold"], [style*="font-weight: 700"]');
  return boldElements.length > 0;
};

// 智能字体预加载
export const smartFontPreload = () => {
  // 立即预加载核心字体
  preloadFontsOnDemand(getCriticalFonts());
  
  // 延迟检查是否需要粗体字体
  setTimeout(() => {
    if (detectBoldFontUsage()) {
      preloadFontsOnDemand(getSecondaryFonts());
    }
  }, 1000);
};

// 字体加载状态检查
export const checkFontLoadingStatus = () => {
  if (typeof document === 'undefined' || !document.fonts) return;
  
  const fontChecks = [
    'Roboto',
    'Bitter',
    'LXGW WenKai GB Screen'
  ];
  
  fontChecks.forEach(fontFamily => {
    document.fonts.load(`16px "${fontFamily}"`).then(() => {
      const loaded = document.fonts.check(`16px "${fontFamily}"`);
      console.log(`🎨 字体 ${fontFamily}: ${loaded ? '✅ 已加载' : '❌ 未加载'}`);
    });
  });
};

// 移除未使用的预加载链接
export const cleanupUnusedPreloads = () => {
  if (typeof document === 'undefined') return;
  
  setTimeout(() => {
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
    
    preloadLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      // 检查字体是否实际被使用
      const fontName = href.includes('Roboto-Bold') ? 'Roboto Bold' :
                      href.includes('Roboto') ? 'Roboto' :
                      href.includes('Bitter') ? 'Bitter' :
                      href.includes('LXGWWenKai') ? 'LXGW WenKai GB Screen' : null;
      
      if (fontName && document.fonts) {
        const isUsed = document.fonts.check(`16px "${fontName}"`);
        if (!isUsed && fontName.includes('Bold')) {
          // 如果是粗体字体且未使用，考虑移除预加载
          console.log(`⚠️ 字体 ${fontName} 已预加载但未使用，考虑优化`);
        }
      }
    });
  }, 5000); // 5秒后检查
};

// 字体性能监控
export const monitorFontPerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;
  
  // 监控字体加载性能
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('/fonts/')) {
        console.log(`📊 字体加载性能 ${entry.name}: ${entry.duration.toFixed(2)}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
  
  // 监控字体显示时间
  if (document.fonts) {
    document.fonts.ready.then(() => {
      console.log('✨ 所有字体加载完成');
    });
  }
};

// 初始化字体优化
export const initializeFontOptimization = () => {
  // 检查字体加载状态
  checkFontLoadingStatus();
  
  // 启动性能监控
  monitorFontPerformance();
  
  // 清理未使用的预加载
  cleanupUnusedPreloads();
}; 