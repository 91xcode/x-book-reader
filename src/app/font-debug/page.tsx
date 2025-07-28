'use client';

import { useState, useEffect } from 'react';
import { isCJKEnv, shouldUseCJKFont } from '@/utils/cjkDetection';

// 测试字体配置
const TEST_FONTS = [
  { name: 'LXGW WenKai', display: '霞鹜文楷' },
  { name: 'Huiwen-mincho', display: '汇文明朝体' },
  { name: 'KingHwaOldSong', display: '京华老宋体' },
  { name: 'Noto Serif CJK', display: '思源宋体' },
  { name: 'GuanKiapTsingKhai', display: '原俠正楷' },
];

const TEST_TEXT = '这是中文字体测试：春江潮水连海平，海上明月共潮生。滟滟随波千万里，何处春江无月明！';

export default function FontDebugPage() {
  const [currentFont, setCurrentFont] = useState(TEST_FONTS[0].name);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const bookKey = 'test-book-key';
    const envInfo = {
      browserLang: navigator.language,
      uiLang: localStorage.getItem('i18nextLng'),
      isCJKEnv: isCJKEnv(),
      shouldUseCJKFont: shouldUseCJKFont(bookKey),
      fontCheckResults: {} as Record<string, boolean>
    };

    // 检查字体可用性
    TEST_FONTS.forEach(font => {
      try {
        const available = document.fonts.check(`16px "${font.name}"`);
        envInfo.fontCheckResults[font.name] = available;
      } catch (error) {
        envInfo.fontCheckResults[font.name] = false;
      }
    });

    setDebugInfo(envInfo);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">字体修复调试页面</h1>
        
        {/* 环境信息 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">环境检测信息</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>浏览器语言: <span className="text-blue-600">{debugInfo.browserLang}</span></div>
            <div>UI语言: <span className="text-blue-600">{debugInfo.uiLang || 'null'}</span></div>
            <div>CJK环境: <span className={debugInfo.isCJKEnv ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.isCJKEnv ? '✅ 是' : '❌ 否'}
            </span></div>
            <div>应该使用CJK字体: <span className={debugInfo.shouldUseCJKFont ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.shouldUseCJKFont ? '✅ 是' : '❌ 否'}
            </span></div>
          </div>
        </div>

        {/* 字体可用性检查 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">字体可用性检查</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEST_FONTS.map(font => (
              <div key={font.name} className="p-3 bg-gray-50 rounded">
                <div className="font-semibold">{font.display}</div>
                <div className="text-sm text-gray-600 font-mono">{font.name}</div>
                <div className={`text-sm ${debugInfo.fontCheckResults?.[font.name] ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo.fontCheckResults?.[font.name] ? '✅ 可用' : '❌ 不可用'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 字体切换测试 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">字体切换测试</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">选择字体:</label>
            <select 
              value={currentFont} 
              onChange={(e) => setCurrentFont(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {TEST_FONTS.map(font => (
                <option key={font.name} value={font.name}>
                  {font.display} ({font.name})
                </option>
              ))}
            </select>
          </div>

          {/* 字体预览 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">当前字体预览</h3>
              <div 
                style={{ 
                  fontFamily: `"${currentFont}", serif`,
                  fontSize: '18px',
                  lineHeight: '1.6'
                }}
                className="p-4 bg-gray-50 rounded border"
              >
                {TEST_TEXT}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">对比：系统默认字体</h3>
              <div 
                style={{ 
                  fontFamily: 'serif',
                  fontSize: '18px',
                  lineHeight: '1.6'
                }}
                className="p-4 bg-gray-50 rounded border"
              >
                {TEST_TEXT}
              </div>
            </div>
          </div>
        </div>

        {/* 修复状态总结 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">修复状态总结</h2>
          <div className="space-y-2 text-blue-700">
            <div>✅ 字体名称映射已修复（使用真实的zeoseven字体名称）</div>
            <div>✅ CJK字体变更条件判断已移除（总是应用变更）</div>
            <div>✅ 字体栈生成逻辑与readest保持一致</div>
            <div>🔍 现在CJK字体切换应该能正常工作了</div>
          </div>
        </div>
      </div>
    </div>
  );
} 