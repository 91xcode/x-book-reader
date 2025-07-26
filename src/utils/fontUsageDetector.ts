// 字体使用检测工具 - 检测实际渲染使用的字体

export interface FontUsageResult {
  fontFamily: string;
  actualFont: string;
  source: 'local' | 'cdn' | 'system' | 'unknown';
  confidence: number;
  details: string;
}

// 创建测试元素并检测实际使用的字体
const createFontTestElement = (fontFamily: string, text: string = '测试Abc'): HTMLElement => {
  const element = document.createElement('div');
  element.style.fontFamily = fontFamily;
  element.style.fontSize = '16px';
  element.style.position = 'absolute';
  element.style.top = '-9999px';
  element.style.left = '-9999px';
  element.style.visibility = 'hidden';
  element.textContent = text;
  document.body.appendChild(element);
  return element;
};

// 测量文本宽度来检测字体差异
const measureTextWidth = (element: HTMLElement): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  
  const styles = window.getComputedStyle(element);
  context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
  return context.measureText(element.textContent || '').width;
};

// 检测字体是否为本地字体
const detectLocalFont = async (fontFamily: string): Promise<boolean> => {
  if (!document.fonts) return false;
  
  try {
    // 尝试加载字体
    await document.fonts.load(`16px "${fontFamily}"`);
    return document.fonts.check(`16px "${fontFamily}"`);
  } catch {
    return false;
  }
};

// 检测实际使用的字体
export const detectActualFontUsage = async (fontFamily: string): Promise<FontUsageResult> => {
  // 创建测试元素
  const testElement = createFontTestElement(`"${fontFamily}", sans-serif`, '测试文字Abc123');
  const fallbackElement = createFontTestElement('sans-serif', '测试文字Abc123');
  
  try {
    // 等待字体加载
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 测量宽度
    const testWidth = measureTextWidth(testElement);
    const fallbackWidth = measureTextWidth(fallbackElement);
    
    // 检测字体加载状态
    const isLoaded = await detectLocalFont(fontFamily);
    
    // 获取计算样式
    const computedStyle = window.getComputedStyle(testElement);
    const actualFontFamily = computedStyle.fontFamily;
    
    // 分析结果
    let source: FontUsageResult['source'] = 'unknown';
    let confidence = 0;
    let details = '';
    
    if (isLoaded && Math.abs(testWidth - fallbackWidth) > 1) {
      // 字体已加载且渲染不同
      if (actualFontFamily.includes(fontFamily)) {
        // 检查是否为本地字体
        const localPaths = [
          '/fonts/roboto/',
          '/fonts/bitter/',
          '/fonts/lxgw/'
        ];
        
        const isLocalFont = localPaths.some(path => 
          fontFamily.toLowerCase().includes('roboto') && path.includes('roboto') ||
          fontFamily.toLowerCase().includes('bitter') && path.includes('bitter') ||
          fontFamily.toLowerCase().includes('lxgw') && path.includes('lxgw')
        );
        
        if (isLocalFont) {
          source = 'local';
          confidence = 0.9;
          details = '使用本地字体文件';
        } else {
          source = 'cdn';
          confidence = 0.8;
          details = '使用 CDN 字体';
        }
      } else {
        source = 'system';
        confidence = 0.7;
        details = '使用系统字体';
      }
    } else {
      source = 'system';
      confidence = 0.6;
      details = '回退到系统字体';
    }
    
    return {
      fontFamily,
      actualFont: actualFontFamily,
      source,
      confidence,
      details: `${details} (宽度差异: ${Math.abs(testWidth - fallbackWidth).toFixed(1)}px)`
    };
    
  } finally {
    // 清理测试元素
    document.body.removeChild(testElement);
    document.body.removeChild(fallbackElement);
  }
};

// 批量检测字体使用情况
export const detectAllFontUsage = async (): Promise<FontUsageResult[]> => {
  const fontsToCheck = [
    'Roboto',
    'Bitter', 
    'LXGW WenKai GB Screen',
    'Fira Code'
  ];
  
  const results: FontUsageResult[] = [];
  
  for (const font of fontsToCheck) {
    try {
      const result = await detectActualFontUsage(font);
      results.push(result);
    } catch (error) {
      results.push({
        fontFamily: font,
        actualFont: 'unknown',
        source: 'unknown',
        confidence: 0,
        details: `检测失败: ${error}`
      });
    }
  }
  
  return results;
};

// 创建字体使用报告
export const generateFontUsageReport = async (): Promise<string> => {
  const results = await detectAllFontUsage();
  
  let report = '📊 字体使用情况报告\n';
  report += '========================\n\n';
  
  results.forEach((result, index) => {
    const icon = result.source === 'local' ? '📁' : 
                result.source === 'cdn' ? '🌐' : 
                result.source === 'system' ? '💻' : '❓';
    
    report += `${index + 1}. ${icon} ${result.fontFamily}\n`;
    report += `   来源: ${result.source}\n`;
    report += `   详情: ${result.details}\n`;
    report += `   实际字体: ${result.actualFont}\n`;
    report += `   可信度: ${(result.confidence * 100).toFixed(0)}%\n\n`;
  });
  
  return report;
};

// 检测 LXGW 字体的具体来源
export const detectLXGWFontSource = async (): Promise<{
  source: 'local-ttf' | 'cdn-woff2' | 'system-fallback' | 'unknown';
  evidence: string[];
}> => {
  const evidence: string[] = [];
  
  // 检查是否有本地 TTF 字体
  const localElement = createFontTestElement('"LXGW WenKai GB Screen", monospace', '中文测试');
  const systemElement = createFontTestElement('monospace', '中文测试');
  
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const localWidth = measureTextWidth(localElement);
    const systemWidth = measureTextWidth(systemElement);
    
    evidence.push(`本地字体宽度: ${localWidth.toFixed(1)}px`);
    evidence.push(`系统字体宽度: ${systemWidth.toFixed(1)}px`);
    evidence.push(`宽度差异: ${Math.abs(localWidth - systemWidth).toFixed(1)}px`);
    
    // 检查 DOM 中的字体链接
    const cdnLinks = document.querySelectorAll('link[href*="cn-fontsource-lxgw-wen-kai-gb-screen"]');
    const localLinks = document.querySelectorAll('link[href*="/fonts/lxgw/"]');
    
    evidence.push(`CDN 链接数量: ${cdnLinks.length}`);
    evidence.push(`本地预加载数量: ${localLinks.length}`);
    
    // 检查字体加载 API
    if (document.fonts) {
      const isLoaded = document.fonts.check('16px "LXGW WenKai GB Screen"');
      evidence.push(`Font Loading API 检测: ${isLoaded ? '已加载' : '未加载'}`);
    }
    
    // 判断来源
    if (localLinks.length > 0 && Math.abs(localWidth - systemWidth) > 2) {
      return { source: 'local-ttf', evidence };
    } else if (cdnLinks.length > 0 && Math.abs(localWidth - systemWidth) > 2) {
      return { source: 'cdn-woff2', evidence };
    } else if (Math.abs(localWidth - systemWidth) <= 2) {
      return { source: 'system-fallback', evidence };
    } else {
      return { source: 'unknown', evidence };
    }
    
  } finally {
    document.body.removeChild(localElement);
    document.body.removeChild(systemElement);
  }
}; 