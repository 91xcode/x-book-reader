// 字体 CDN 加载器 - 基于 readest 项目的字体加载机制

import { detectCJKEnvironment } from './misc';

// 基础 Google Fonts 字体配置（来自 readest）
const basicGoogleFonts = [
  { family: 'Bitter', weights: 'ital,wght@0,100..900;1,100..900' },
  { family: 'Fira Code', weights: 'wght@300..700' },
  { family: 'Literata', weights: 'ital,opsz,wght@0,7..72,200..900;1,7..72,200..900' },
  { family: 'Merriweather', weights: 'ital,opsz,wght@0,18..144,300..900;1,18..144,300..900' },
  { family: 'Noto Sans', weights: 'ital,wght@0,100..900;1,100..900' },
  { family: 'Open Sans', weights: 'ital,wght@0,300..800;1,300..800' },
  { family: 'Roboto', weights: 'ital,wght@0,100..900;1,100..900' },
  { family: 'Vollkorn', weights: 'ital,wght@0,400..900;1,400..900' },
];

// CJK 字体配置（基于 zeoseven 字体服务的真实字体）
const cjkFonts = [
  { 
    id: '292', 
    family: 'LXGW WenKai', 
    name: '霞鹜文楷',
    style: '文楷风格'
  },
  { 
    id: '256', 
    family: 'Huiwen-mincho', 
    name: '汇文明朝体',
    style: '明朝体风格'
  },
  { 
    id: '309', 
    family: 'KingHwaOldSong', 
    name: '京华老宋体',
    style: '宋体风格'
  },
  { 
    id: '285', 
    family: 'Noto Serif CJK', 
    name: '思源宋体',
    style: '现代宋体'
  },
  { 
    id: '427', 
    family: 'GuanKiapTsingKhai', 
    name: '原俠正楷',
    style: '楷体风格'
  },
];

// 生成基础字体的 CDN 链接
const getBasicFontLinks = () => `
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${basicGoogleFonts
    .map(
      ({ family, weights }) =>
        `family=${encodeURIComponent(family)}${weights ? `:${weights}` : ''}`,
    )
    .join('&')}&display=swap" crossorigin="anonymous">
`;

// 生成 CJK 字体的 CDN 链接（使用 preload 策略和备用链接）
const getCJKFontLinks = () => {
  return cjkFonts.map(font => `
    <link rel="preload" as="style" crossorigin
        href="https://fontsapi.zeoseven.com/${font.id}/main/result.css"
        onload="this.rel='stylesheet'"
        onerror="this.href='https://fontsapi-storage.zeoseven.com/${font.id}/main/result.css'" />
    <noscript>
        <link rel="stylesheet" href="https://fontsapi.zeoseven.com/${font.id}/main/result.css" />
    </noscript>
  `).join('\n');
};

// 生成 CJK 字体的样式定义
const getCJKFontFaces = () => `
  /* 
   * ZeoSeven 字体通过 CDN 链接直接加载，真实字体名称：
   * - LXGW WenKai (292) - 霞鹜文楷 (文楷风格)
   * - Huiwen-mincho (256) - 汇文明朝体 (明朝体风格)
   * - KingHwaOldSong (309) - 京华老宋体 (宋体风格)  
   * - Noto Serif CJK (285) - 思源宋体 (现代宋体)
   * - GuanKiapTsingKhai (427) - 原俠正楷 (楷体风格)
   */
   
   /* 字体可用性CSS类，使用真实字体名称 */
   .font-lxgw-wenkai { 
     font-family: "LXGW WenKai", serif; 
     font-weight: normal;
   }
   .font-huiwen-mincho { 
     font-family: "Huiwen-mincho", serif; 
     font-weight: normal;
   }
   .font-kinghwa-oldsong { 
     font-family: "KingHwaOldSong", serif; 
     font-weight: normal;
     /* font-feature-settings: "hwid"; 启用等宽变化字形 */
   }
   .font-noto-serif-cjk { 
     font-family: "Noto Serif CJK", serif; 
     font-weight: normal;
     /* font-feature-settings: "hwid"; 启用等宽变化字形 */
   }
   .font-guankiap-tsingkhai { 
     font-family: "GuanKiapTsingKhai", serif; 
     font-weight: normal;
   }
`;

// CDN 字体加载器（改进版，支持 preload 和错误回退）
export const loadCDNFonts = (document: Document, forceCJK = false) => {
  const shouldLoadCJK = forceCJK || detectCJKEnvironment();
  let links = getBasicFontLinks();
  
  if (shouldLoadCJK) {
    // 添加 CJK 字体的样式规则
    const style = document.createElement('style');
    style.textContent = getCJKFontFaces();
    style.id = 'cjk-font-faces';
    document.head.appendChild(style);

    // 添加 CJK 字体的 CDN 链接（使用 preload 策略）
    links = `${links}\n${getCJKFontLinks()}`;
  }

  // 解析并添加字体链接
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(links, 'text/html');

  Array.from(parsedDocument.head.children).forEach((child) => {
    if (child.tagName === 'LINK') {
      const link = document.createElement('link');
      
      // 复制所有属性
      Array.from(child.attributes).forEach(attr => {
        link.setAttribute(attr.name, attr.value);
      });
      
      // 复制 onload 和 onerror 事件（如果存在）
      if (child.getAttribute('onload')) {
        const onloadCode = child.getAttribute('onload');
        link.onload = (ev: Event) => {
          const func = new Function('event', onloadCode!);
          func.call(link, ev);
        };
      }
      
      if (child.getAttribute('onerror')) {
        const onerrorCode = child.getAttribute('onerror');
        link.onerror = (event: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) => {
          const func = new Function('event', 'source', 'lineno', 'colno', 'error', onerrorCode!);
          func.call(link, event, source, lineno, colno, error);
        };
      }
      
      // 添加标识符以便后续管理
      link.dataset.fontLoader = 'cdn';

      document.head.appendChild(link);
    }
  });
  
  console.log(`🎨 CDN 字体加载完成 - 基础字体 + ${shouldLoadCJK ? 'CJK字体(preload策略)' : '无CJK字体'}`);
};

// 移除 CDN 字体
export const removeCDNFonts = (document: Document) => {
  // 移除通过 CDN 加载的字体链接
  const cdnLinks = document.querySelectorAll('link[data-font-loader="cdn"]');
  cdnLinks.forEach(link => link.remove());
  
  // 移除 CJK 字体样式
  const cjkStyle = document.getElementById('cjk-font-faces');
  if (cjkStyle) {
    cjkStyle.remove();
  }
  
  console.log('🧹 CDN 字体已移除');
};

// 字体加载策略选项
export type FontLoadStrategy = 'local-only' | 'cdn-only' | 'local-first' | 'cdn-first';

// 智能字体加载器
export const loadFontsWithStrategy = (
  document: Document, 
  strategy: FontLoadStrategy = 'local-first',
  forceCJK = false
) => {
  console.log(`🚀 启动字体加载策略: ${strategy}`);
  
  switch (strategy) {
    case 'local-only':
      console.log('📁 仅使用本地字体，无需额外加载');
      break;
      
    case 'cdn-only':
      loadCDNFonts(document, forceCJK);
      break;
      
    case 'local-first':
    case 'cdn-first':
      // 两种策略的实现相同：先加载 CDN 字体作为补充
      // 本地字体通过 CSS 已经配置，CDN 字体作为回退
      loadCDNFonts(document, forceCJK);
      break;
  }
};

// 检查特定 CDN 字体是否已加载（使用真实字体名称）
export const isCDNFontLoaded = (fontFamily: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!document.fonts) {
      // 不支持 Font Loading API，假设已加载
      resolve(true);
      return;
    }
    
    document.fonts.load(`16px "${fontFamily}"`).then(() => {
      const loaded = document.fonts.check(`16px "${fontFamily}"`);
      resolve(loaded);
    }).catch(() => {
      resolve(false);
    });
  });
};

// 获取所有 CJK 字体的真实名称
export const getCJKFontFamilies = () => {
  return cjkFonts.map(font => ({
    id: font.id,
    family: font.family,
    name: font.name,
    style: font.style
  }));
};

// 获取 LXGW WenKai 字体的具体资源 URL（如用户提到的 L3_20_64.woff2）
export const getLXGWWenKaiResourceUrls = () => {
  const baseUrl = 'https://cdn.jsdelivr.net/npm/cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6';
  
  return {
    css: `${baseUrl}/font.min.css`,
    woff2: {
      regular: `${baseUrl}/L3_20_64.woff2`,
      light: `${baseUrl}/L3_20_63.woff2`,
      bold: `${baseUrl}/L3_20_65.woff2`,
    },
    woff: {
      regular: `${baseUrl}/L3_20_64.woff`,
      light: `${baseUrl}/L3_20_63.woff`,
      bold: `${baseUrl}/L3_20_65.woff`,
    }
  };
}; 