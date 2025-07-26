// 本地字体检测系统 - 基于readest项目策略

interface FontLoadResult {
  fontFamily: string;
  loaded: boolean;
  source: 'local' | 'cdn' | 'system';
  loadTime: number;
}

interface FontLogger {
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
}

// 简洁的日志记录器
const createLogger = (): FontLogger => {
  const log = (level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [FONT-${level}] ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  };

  return {
    info: (message: string, data?: any) => log('INFO', message, data),
    warn: (message: string, data?: any) => log('WARN', message, data),
    error: (message: string, data?: any) => log('ERROR', message, data),
  };
};

// 等待字体加载完成
const waitForFontsLoading = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!document.fonts) {
      // 如果不支持Font Loading API，等待5秒给TTF字体更多时间
      setTimeout(resolve, 5000);
      return;
    }

    // 使用Font Loading API等待字体加载
    if (document.fonts.status === 'loaded') {
      // 即使状态是loaded，也等待2秒确保TTF字体完全渲染
      setTimeout(resolve, 2000);
    } else {
      document.fonts.ready.then(() => {
        // TTF字体需要更多时间，等待2秒确保完全加载
        setTimeout(resolve, 2000);
      }).catch(() => {
        // 如果出错，等待5秒后继续
        setTimeout(resolve, 5000);
      });
    }
  });
};

// 检测本地字体文件是否可用
const checkLocalFontFile = async (fontPath: string): Promise<boolean> => {
  try {
    const response = await fetch(fontPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// 高级字体可用性检测
const isSystemFontAvailable = (fontName: string): boolean => {
  const testTexts = [
    'abcdefghijklmnopqrstuvwxyz0123456789',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
    '中文测试字体渲染效果检测',
    'WwMmIiLl1234567890'
  ];
  const fontSize = 72;
  
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return false;

    // 设置更大的canvas提高检测精度
    canvas.width = 2000;
    canvas.height = 400;

    let totalDifference = 0;
    let testCount = 0;

    for (const testText of testTexts) {
      // 测试默认字体宽度（使用serif作为基准）
      context.font = `${fontSize}px serif`;
      const serifWidth = context.measureText(testText).width;
      
      // 测试sans-serif作为另一个基准
      context.font = `${fontSize}px sans-serif`;
      const sansWidth = context.measureText(testText).width;
      
      // 测试目标字体宽度
      context.font = `${fontSize}px "${fontName}", serif`;
      const targetWidth = context.measureText(testText).width;
      
      // 计算与两个基准字体的差异
      const serifDiff = Math.abs(serifWidth - targetWidth);
      const sansDiff = Math.abs(sansWidth - targetWidth);
      
      // 至少与一个基准字体有明显差异才认为字体加载成功
      const minDifference = Math.min(serifDiff, sansDiff);
      if (minDifference > 1) {
        totalDifference += minDifference;
        testCount++;
      }
    }
    
    // 如果多个测试文本都显示字体差异，认为字体可用
    return testCount >= testTexts.length / 2 && totalDifference > 5;
  } catch {
    return false;
  }
};

// 强制触发字体加载
const forceFontLoad = async (fontFamily: string, fontPath: string): Promise<void> => {
  try {
    // 方法1: 使用FontFace API强制加载
    if ('FontFace' in window) {
      const fontFace = new FontFace(fontFamily, `url(${fontPath})`);
      await fontFace.load();
      document.fonts.add(fontFace);
    }
    
    // 方法2: 创建隐藏元素强制渲染字体
    const testElement = document.createElement('div');
    testElement.style.fontFamily = `"${fontFamily}", serif`;
    testElement.style.fontSize = '100px';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.visibility = 'hidden';
    testElement.textContent = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz中文测试字体加载';
    
    document.body.appendChild(testElement);
    
    // 强制重排和重绘
    testElement.offsetHeight;
    
    // 等待一小段时间让字体渲染
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 清理测试元素
    document.body.removeChild(testElement);
    
  } catch (error) {
    console.warn(`字体预加载失败: ${fontFamily}`, error);
  }
};

// 检测本地和关键字体
export const detectAndLogFonts = async (): Promise<FontLoadResult[]> => {
  const logger = createLogger();
  
  logger.info('🚀 启动本地字体系统检测');
  
  // 等待字体加载完成
  logger.info('⏳ 等待字体文件加载完成...');
  await waitForFontsLoading();
  logger.info('✅ 字体加载等待完成');
  
  // 检测本地字体文件
  const localFonts = [
    { name: 'Roboto', path: '/fonts/roboto/Roboto-Regular.woff2' },
    { name: 'Bitter', path: '/fonts/bitter/Bitter-Variable.ttf' },
    { name: 'LXGW WenKai GB Screen', path: '/fonts/lxgw/LXGWWenKai-Regular.ttf' },
  ];
  
  // 检测CDN/系统字体
  const cdnFonts = [
    'Fira Code',            // Google Fonts 等宽字体
  ];
  
  const results: FontLoadResult[] = [];
  
  // 检测本地字体文件
  for (const font of localFonts) {
    const startTime = performance.now();
    
    // 检查文件是否存在
    const fileExists = await checkLocalFontFile(font.path);
    
    if (fileExists) {
      // 强制加载字体
      logger.info(`🔄 强制加载字体: ${font.name}`);
      await forceFontLoad(font.name, font.path);
      
      // 额外等待时间让TTF字体完全渲染
      if (font.path.endsWith('.ttf')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 检查字体是否已加载到系统
    const isRenderable = isSystemFontAvailable(font.name);
    
    const loadTime = performance.now() - startTime;
    const isLoaded = fileExists && isRenderable;
    
    const result: FontLoadResult = {
      fontFamily: font.name,
      loaded: isLoaded,
      source: 'local',
      loadTime
    };
    
    results.push(result);
    
    if (isLoaded) {
      logger.info(`📁✅ ${font.name}`, {
        状态: '本地字体可用',
        文件路径: font.path,
        检测时间: `${loadTime.toFixed(2)}ms`
      });
    } else {
      logger.warn(`📁⚠️ ${font.name}`, {
        状态: fileExists ? '文件存在但未渲染' : '文件不存在',
        文件路径: font.path,
        检测时间: `${loadTime.toFixed(2)}ms`,
        建议: fileExists ? '可能需要更多加载时间或格式转换' : '检查字体文件路径'
      });
    }
  }
  
  // 检测CDN字体
  for (const fontName of cdnFonts) {
    const startTime = performance.now();
    const isAvailable = isSystemFontAvailable(fontName);
    const loadTime = performance.now() - startTime;
    
    const result: FontLoadResult = {
      fontFamily: fontName,
      loaded: isAvailable,
      source: 'cdn',
      loadTime
    };
    
    results.push(result);
    
    if (isAvailable) {
      logger.info(`🌐✅ ${fontName}`, {
        状态: 'CDN字体可用',
        检测时间: `${loadTime.toFixed(2)}ms`
      });
    } else {
      logger.warn(`🌐⚠️ ${fontName}`, {
        状态: '使用系统字体回退',
        检测时间: `${loadTime.toFixed(2)}ms`
      });
    }
  }
  
  // 生成总结报告
  const localLoaded = results.filter(r => r.source === 'local' && r.loaded).length;
  const cdnLoaded = results.filter(r => r.source === 'cdn' && r.loaded).length;
  const totalLocal = localFonts.length;
  const totalCdn = cdnFonts.length;
  
  logger.info('📊 字体系统状态', {
    本地字体: `${localLoaded}/${totalLocal} 可用`,
    CDN字体: `${cdnLoaded}/${totalCdn} 可用`,
    策略: '本地优先 + 智能回退',
    性能: '本地加载，速度提升'
  });
  
  if (localLoaded === totalLocal) {
    logger.info('🎉 所有本地字体加载成功！最佳阅读体验');
  } else if (localLoaded > 0) {
    logger.info('⚡ 部分本地字体可用，阅读体验良好');
  } else {
    logger.warn('🔄 本地字体不可用，使用系统字体回退');
  }
  
  return results;
};

// 设置字体加载监听器（简化版）
export const setupFontLoadListener = (logger: FontLogger) => {
  if (!document.fonts) {
    logger.info('ℹ️ 浏览器不支持Font Loading API，使用传统加载方式');
    return;
  }

  logger.info('🔧 启用Font Loading API监听');
  
  document.fonts.addEventListener('loading', () => {
    logger.info('⏳ 检测到字体开始加载');
  });

  document.fonts.addEventListener('loadingdone', () => {
    logger.info('✅ 字体加载完成');
  });

  document.fonts.addEventListener('loadingerror', () => {
    logger.warn('⚠️ 字体加载遇到问题，将使用回退字体');
  });
};

export { createLogger };
export type { FontLoadResult, FontLogger };

// 导出字体检测辅助函数供控制台使用
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.fontDebug = {
    // 检测单个字体
    checkFont: (fontName: string) => {
      const isAvailable = isSystemFontAvailable(fontName);
      console.log(`字体 "${fontName}" 可用性:`, isAvailable);
      return isAvailable;
    },
    
    // 列出所有已加载的字体
    listLoadedFonts: () => {
      if (document.fonts) {
        console.log('已加载的字体:');
        document.fonts.forEach(font => {
          console.log(`- ${font.family} (${font.weight}, ${font.style})`);
        });
      } else {
        console.log('浏览器不支持Font Loading API');
      }
    },
    
    // 测试字体渲染差异
    testFontRendering: (fontName: string) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      
      canvas.width = 1000;
      canvas.height = 200;
      
      const testText = 'The quick brown fox jumps over the lazy dog. 快速的棕色狐狸跳过懒狗。';
      
      ctx.font = '48px serif';
      const serifWidth = ctx.measureText(testText).width;
      
      ctx.font = `48px "${fontName}", serif`;
      const fontWidth = ctx.measureText(testText).width;
      
      const difference = Math.abs(serifWidth - fontWidth);
      
      console.log(`字体渲染测试: ${fontName}`);
      console.log(`- 基准宽度 (serif): ${serifWidth}px`);
      console.log(`- 目标宽度 (${fontName}): ${fontWidth}px`);
      console.log(`- 差异: ${difference}px`);
      console.log(`- 是否可用: ${difference > 2}`);
      
      return difference > 2;
    },
    
    // 强制重新加载所有本地字体
    reloadLocalFonts: async () => {
      console.log('开始重新加载本地字体...');
      const fonts = [
        { name: 'Roboto', path: '/fonts/roboto/Roboto-Regular.woff2' },
        { name: 'Bitter', path: '/fonts/bitter/Bitter-Variable.ttf' },
        { name: 'LXGW WenKai GB Screen', path: '/fonts/lxgw/LXGWWenKai-Regular.ttf' },
      ];
      
      for (const font of fonts) {
        try {
          console.log(`加载字体: ${font.name}`);
          await forceFontLoad(font.name, font.path);
          console.log(`✅ ${font.name} 加载完成`);
        } catch (error) {
          console.error(`❌ ${font.name} 加载失败:`, error);
        }
      }
      console.log('字体重新加载完成');
    }
  };
  
  console.log('字体调试工具已加载！使用方法:');
  console.log('- window.fontDebug.checkFont("字体名") - 检测字体可用性');
  console.log('- window.fontDebug.listLoadedFonts() - 列出已加载字体');
  console.log('- window.fontDebug.testFontRendering("字体名") - 测试字体渲染');
  console.log('- window.fontDebug.reloadLocalFonts() - 重新加载所有本地字体');
} 