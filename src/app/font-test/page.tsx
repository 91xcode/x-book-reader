'use client';

import { useState } from 'react';

// 字体配置
const ZEOSEVEN_FONTS = [
  { id: 292, name: 'LXGW WenKai', label: '霞鹜文楷' },
  { id: 256, name: 'Huiwen-mincho', label: '汇文明朝体' },
  { id: 309, name: 'KingHwaOldSong', label: '京华老宋体' },
  { id: 285, name: 'Noto Serif CJK', label: '思源宋体' },
  { id: 427, name: 'GuanKiapTsingKhai', label: '原俠正楷' },
];

const TEST_TEXT = {
  chinese: '中文字体测试：春江潮水连海平，海上明月共潮生。滟滟随波千万里，何处春江无月明！',
  punctuation: '《春江花月夜》—— 张若虚',
  numbers: '1234567890 ℃ ℉ ① ② ③ ④ ⑤',
  mixed: 'Mixed文本Test：English + 中文 = 完美组合！'
};

export default function FontTestPage() {
  const [currentFont, setCurrentFont] = useState(ZEOSEVEN_FONTS[0]);
  const [isLoaded, setIsLoaded] = useState<Record<string, boolean>>({});

  // 检查字体是否加载
  const checkFontLoaded = async (fontName: string) => {
    try {
      await document.fonts.ready;
      const available = document.fonts.check(`16px "${fontName}"`);
      setIsLoaded(prev => ({ ...prev, [fontName]: available }));
      return available;
    } catch (error) {
      console.error(`Error checking font ${fontName}:`, error);
      return false;
    }
  };

  // 检查所有字体
  const checkAllFonts = async () => {
    for (const font of ZEOSEVEN_FONTS) {
      await checkFontLoaded(font.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">ZeoSeven 字体测试页面</h1>
        
        {/* 字体选择器 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">选择字体</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ZEOSEVEN_FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => setCurrentFont(font)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentFont.id === font.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">{font.label}</div>
                  <div className="text-sm text-gray-600">{font.name}</div>
                  <div className="text-xs font-mono text-gray-500 mt-1">{font.name}</div>
                  <div className={`text-xs mt-1 ${isLoaded[font.name] ? 'text-green-600' : 'text-red-600'}`}>
                    {isLoaded[font.name] ? '✅ 已加载' : '❌ 未加载'}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={checkAllFonts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            检查字体加载状态
          </button>
        </div>

        {/* 字体预览区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            当前字体预览: {currentFont.label} ({currentFont.name})
          </h2>
          
          <div 
            style={{ fontFamily: `"${currentFont.name}", serif` }}
            className="space-y-6"
          >
            {/* 不同字号预览 */}
            <div>
              <h3 className="text-lg font-semibold mb-2 font-sans">字号测试</h3>
              <div className="space-y-2">
                <div style={{ fontSize: '24px' }}>24px: {TEST_TEXT.chinese}</div>
                <div style={{ fontSize: '20px' }}>20px: {TEST_TEXT.chinese}</div>
                <div style={{ fontSize: '16px' }}>16px: {TEST_TEXT.chinese}</div>
                <div style={{ fontSize: '14px' }}>14px: {TEST_TEXT.chinese}</div>
              </div>
            </div>

            {/* 文本类型测试 */}
            <div>
              <h3 className="text-lg font-semibold mb-2 font-sans">文本类型测试</h3>
              <div className="space-y-2">
                <div><strong className="font-sans">古诗:</strong> {TEST_TEXT.chinese}</div>
                <div><strong className="font-sans">标点:</strong> {TEST_TEXT.punctuation}</div>
                <div><strong className="font-sans">数字:</strong> {TEST_TEXT.numbers}</div>
                <div><strong className="font-sans">混合:</strong> {TEST_TEXT.mixed}</div>
              </div>
            </div>

            {/* 字重测试 */}
            <div>
              <h3 className="text-lg font-semibold mb-2 font-sans">字重测试</h3>
              <div className="space-y-2">
                <div style={{ fontWeight: 100 }}>Thin (100): {TEST_TEXT.chinese.substring(0, 20)}</div>
                <div style={{ fontWeight: 300 }}>Light (300): {TEST_TEXT.chinese.substring(0, 20)}</div>
                <div style={{ fontWeight: 400 }}>Normal (400): {TEST_TEXT.chinese.substring(0, 20)}</div>
                <div style={{ fontWeight: 500 }}>Medium (500): {TEST_TEXT.chinese.substring(0, 20)}</div>
                <div style={{ fontWeight: 700 }}>Bold (700): {TEST_TEXT.chinese.substring(0, 20)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CDN 加载状态 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">CDN 加载信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ZEOSEVEN_FONTS.map((font) => (
              <div key={font.id} className="p-3 bg-gray-50 rounded">
                <div className="font-semibold">{font.label}</div>
                <div className="text-sm text-gray-600">
                  CDN: https://fontsapi.zeoseven.com/{font.id}/main/result.css
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  字体名称: "{font.name}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 