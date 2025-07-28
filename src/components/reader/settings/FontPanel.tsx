import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { useViewSettingsSync } from '@/utils/viewSettingsHelper';
import { shouldUseCJKFont } from '@/utils/cjkDetection';
import NumberInput from './NumberInput';
import FontDropdown from './FontDropdown';

interface FontPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

// CJK字体配置
const CJK_FONTS = [
  { value: 'LXGW WenKai', label: '霞鹜文楷' },
  { value: 'Huiwen-mincho', label: '汇文明朝体' },
  { value: 'KingHwaOldSong', label: '京华老宋体' },
  { value: 'Noto Serif CJK', label: '思源宋体' },
  { value: 'GuanKiapTsingKhai', label: '原俠正楷' },
];

const FONT_NAME_MAP: Record<string, string> = {
  '霞鹜文楷': 'LXGW WenKai',
  '汇文明朝体': 'Huiwen-mincho',
  '京华老宋体': 'KingHwaOldSong',
  '思源宋体': 'Noto Serif CJK',
  '原俠正楷': 'GuanKiapTsingKhai',
};

// 反向映射
const REVERSE_FONT_NAME_MAP: Record<string, string> = {
  'LXGW WenKai': '霞鹜文楷',
  'Huiwen-mincho': '汇文明朝体',
  'KingHwaOldSong': '京华老宋体',
  'Noto Serif CJK': '思源宋体',
  'GuanKiapTsingKhai': '原俠正楷',
};

// 字体常量
const SERIF_FONTS = ['Bitter', 'Literata', 'Merriweather', 'Vollkorn'];
const SANS_SERIF_FONTS = ['Roboto', 'Noto Sans', 'Open Sans', 'Helvetica Neue', 'Arial'];
const MONOSPACE_FONTS = ['Consolas', 'Monaco', 'Courier New'];

interface FontFaceProps {
  className?: string;
  family: string;
  label: string;
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const handleFontFaceFont = (option: string, family: string) => {
  const fontName = FONT_NAME_MAP[option] || option;
  return `'${fontName}', ${family}`;
};

const FontFace = ({
  className,
  family,
  label,
  options,
  selected,
  onSelect,
}: FontFaceProps) => {
  return (
    <div className={className}>
      <span className='min-w-10'>{label}</span>
      <FontDropdown
        family={family}
        options={options.map((option) => ({ option, label: option }))}
        selected={selected}
        onSelect={onSelect}
        onGetFontFamily={handleFontFaceFont}
      />
    </div>
  );
};

const FontPanel: React.FC<FontPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getViewSettings, getView } = useReaderStore();
  const { saveViewSettings } = useViewSettingsSync();
  const isInitialized = useRef(false);

  // 获取当前视图设置
  const viewSettings = getViewSettings(bookKey);

  // 🎛️ 调试开关：控制调试工具的显示
  const [showDebugTools, setShowDebugTools] = useState(false);

  // 字体设置状态
  const [overrideFont, setOverrideFont] = useState(viewSettings?.overrideFont ?? false);
  const [defaultFont, setDefaultFont] = useState(viewSettings?.defaultFont ?? 'Serif');
  const [serifFont, setSerifFont] = useState(viewSettings?.serifFont ?? 'Bitter');
  const [sansSerifFont, setSansSerifFont] = useState(viewSettings?.sansSerifFont ?? 'Roboto');
  const [monospaceFont, setMonospaceFont] = useState(viewSettings?.monospaceFont ?? 'Consolas');
  const [defaultCJKFont, setDefaultCJKFont] = useState(viewSettings?.defaultCJKFont ?? 'LXGW WenKai');
  const [defaultFontSize, setDefaultFontSize] = useState(viewSettings?.defaultFontSize ?? 16);
  const [minFontSize, setMinFontSize] = useState(viewSettings?.minimumFontSize ?? 12);
  const [fontWeight, setFontWeight] = useState(viewSettings?.fontWeight ?? 400);

  // CJK环境检测
  const needsCJKFont = shouldUseCJKFont(bookKey);

  const fontFamilyOptions = [
    { option: 'Serif', label: '衬线字体' },
    { option: 'Sans-serif', label: '无衬线字体' },
  ];

  // 重置函数
  const reset = useCallback(() => {
    setOverrideFont(false);
    setDefaultFont('Serif');
    setSerifFont('Bitter');
    setSansSerifFont('Roboto');
    setMonospaceFont('Consolas');
    setDefaultCJKFont('LXGW WenKai');
    setDefaultFontSize(16);
    setMinFontSize(8);
    setFontWeight(400);
  }, []);

  useEffect(() => {
    onRegisterReset(reset);
    isInitialized.current = true;
  }, [onRegisterReset, reset]);

  // 🎯 readest风格的独立useEffect模式 - 每个字体设置单独监听
  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'defaultFont', defaultFont);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFont]);

  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'defaultCJKFont', defaultCJKFont);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCJKFont]);

  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'defaultFontSize', defaultFontSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFontSize]);

  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'minimumFontSize', minFontSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minFontSize]);

  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'fontWeight', fontWeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontWeight]);

  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'serifFont', serifFont);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serifFont]);

  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'sansSerifFont', sansSerifFont);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sansSerifFont]);

  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'monospaceFont', monospaceFont);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monospaceFont]);

  useEffect(() => {
    if (!isInitialized.current || !viewSettings) return;
    saveViewSettings(bookKey, 'overrideFont', overrideFont);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideFont]);

  // 🎯 简化版强制CJK优先函数（保留作为调试工具）
  const applyForceCJKPriority = useCallback((targetCJKFont: string) => {
    console.log('💪 ===== 手动强制CJK字体优先 =====');
    const view = getView(bookKey);
    const currentViewSettings = getViewSettings(bookKey);
    if (!view || !view.renderer || !currentViewSettings) {
      console.error('❌ 缺少必要组件');
      return;
    }
    const forceCJKStyle = `
      /* 强制CJK字体优先 */
      html, body { font-family: "${targetCJKFont}", serif !important; }
      p, div, span, h1, h2, h3, h4, h5, h6 { font-family: "${targetCJKFont}", serif !important; }
      *:lang(zh), *:lang(ja), *:lang(ko) { font-family: "${targetCJKFont}", serif !important; }
      @font-face { font-family: "force-cjk"; src: local("${targetCJKFont}"); unicode-range: U+4E00-9FFF, U+3400-4DBF, U+20000-2A6DF, U+2A700-2B73F, U+2B740-2B81F, U+2B820-2CEAF; }
      * { font-family: "force-cjk", "${targetCJKFont}", serif !important; }
    `;
    
    try {
      const { getCompleteStyles } = require('@/utils/style');
      const baseStyles = getCompleteStyles(currentViewSettings);
      const combinedStyles = baseStyles + '\n\n' + forceCJKStyle;
      
      if (view.renderer?.setStyles) {
        view.renderer.setStyles(combinedStyles);
        if (typeof (view.renderer as any).render === 'function') {
          (view.renderer as any).render();
        }
      }
      console.log('✅ 手动强制CJK字体优先应用完成');
    } catch (error) {
      console.error('❌ 手动强制CJK字体失败:', error);
    }
  }, [bookKey, getView, getViewSettings]);

  const handleFontFamilyFont = (option: string) => {
    switch (option) {
      case 'Serif':
        return `'${serifFont}', serif`;
      case 'Sans-serif':
        return `'${sansSerifFont}', sans-serif`;
      case 'Monospace':
        return `'${monospaceFont}', monospace`;
      default:
        return 'serif';
    }
  };

  return (
    <div className='my-4 w-full space-y-6'>
      {/* 覆盖书籍字体 - 关键开关 */}
      <div className={`p-4 rounded-lg border-2 transition-all ${
        overrideFont 
          ? 'border-primary bg-primary/10' 
          : 'border-warning bg-warning/10'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">覆盖书籍字体</h2>
            {!overrideFont && (
              <span className="badge badge-warning badge-sm">重要</span>
            )}
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={overrideFont}
            onChange={() => setOverrideFont(!overrideFont)}
          />
        </div>
        <p className="text-sm opacity-70">
          {overrideFont 
            ? "✅ 已启用：字体设置将强制覆盖电子书原始字体"
            : "⚠️ 未启用：字体设置可能被电子书原始字体覆盖，如中文字体不生效时请启用此选项"
          }
        </p>
      </div>

      <div className='w-full'>
        <h2 className='mb-2 font-medium'>字号</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <NumberInput
              label='默认字号'
              value={defaultFontSize}
              onChange={setDefaultFontSize}
              min={minFontSize}
              max={120}
            />
            <NumberInput
              label='最小字号'
              value={minFontSize}
              onChange={setMinFontSize}
              min={1}
              max={120}
            />
          </div>
        </div>
      </div>

      <div className='w-full'>
        <h2 className='mb-2 font-medium'>字重</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <NumberInput
              label='字重'
              value={fontWeight}
              onChange={setFontWeight}
              min={100}
              max={900}
              step={100}
            />
          </div>
        </div>
      </div>

      <div className='w-full'>
        <h2 className='mb-2 font-medium'>字族</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <div className='config-item'>
              <span className=''>默认字体</span>
              <FontDropdown
                options={fontFamilyOptions}
                selected={defaultFont}
                onSelect={setDefaultFont}
                onGetFontFamily={handleFontFamilyFont}
              />
            </div>

            {/* 中文字体选择 */}
            {needsCJKFont && (
              <FontFace
                className="config-item"
                family="Chinese Font"
                label="中文字体"
                options={CJK_FONTS.map(font => font.label)}
                selected={REVERSE_FONT_NAME_MAP[defaultCJKFont] || defaultCJKFont}
                onSelect={(displayName) => {
                  const fontName = FONT_NAME_MAP[displayName] || displayName;
                  console.log('🔥 用户选择字体:', { 显示名称: displayName, 字体名称: fontName });
                  setDefaultCJKFont(fontName);
                }}
              />
            )}

            <FontFace
              className='config-item'
              family='serif'
              label='衬线字体'
              options={SERIF_FONTS}
              selected={serifFont}
              onSelect={setSerifFont}
            />
            <FontFace
              className='config-item'
              family='sans-serif'
              label='无衬线字体'
              options={SANS_SERIF_FONTS}
              selected={sansSerifFont}
              onSelect={setSansSerifFont}
            />
            <FontFace
              className='config-item'
              family='monospace'
              label='等宽字体'
              options={MONOSPACE_FONTS}
              selected={monospaceFont}
              onSelect={setMonospaceFont}
            />
          </div>
        </div>
      </div>

      {/* 🎛️ 调试工具开关 */}
      <div className='w-full'>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='p-4'>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium">字体调试工具</h2>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={showDebugTools}
                onChange={() => setShowDebugTools(!showDebugTools)}
              />
            </div>
            <p className="text-sm opacity-70">
              用于调试字体切换问题的开发工具
            </p>
          </div>
        </div>
      </div>

      {/* 🧪 调试工具区域 */}
      {showDebugTools && (
        <div className='w-full'>
          <div className='card border-base-200 bg-base-100 border shadow'>
            <div className='p-4'>
              <h3 className='font-medium mb-4'>调试工具</h3>
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  <button 
                    className='btn btn-sm btn-success'
                    onClick={() => {
                      console.log('🔄 快速字体切换测试');
                      const allFonts = ['LXGW WenKai', 'Huiwen-mincho', 'KingHwaOldSong', 'Noto Serif CJK', 'GuanKiapTsingKhai'];
                      const currentIndex = allFonts.indexOf(defaultCJKFont);
                      const nextIndex = (currentIndex + 1) % allFonts.length;
                      const nextFont = allFonts[nextIndex];
                      
                      console.log(`切换字体: ${defaultCJKFont} -> ${nextFont}`);
                      setDefaultCJKFont(nextFont);
                      
                      // 显示切换提示
                      const notification = document.createElement('div');
                      notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #10b981;
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        z-index: 10000;
                        font-weight: bold;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                      `;
                      notification.textContent = `已切换到: ${nextFont}`;
                      document.body.appendChild(notification);
                      
                      setTimeout(() => notification.remove(), 2000);
                    }}
                  >
                    快速切换字体
                  </button>
                  
                  <button 
                    className='btn btn-sm btn-info'
                    onClick={() => {
                      console.log('🔍 ===== 检测实际使用的字体 =====');
                      
                      const view = getView(bookKey);
                      if (!view || !view.renderer) {
                        console.error('❌ 未找到view或renderer');
                        return;
                      }
                      
                      try {
                        const contents = view.renderer.getContents();
                        contents.forEach(({ doc }, i) => {
                          console.log(`📖 文档 ${i} 字体检测:`);
                          
                          // 创建测试文本来检测实际字体
                          const testTexts = [
                            '测试中文字体显示效果', // 中文测试
                            'English font test',    // 英文测试
                            '日本語フォントテスト',   // 日文测试
                            '한국어 폰트 테스트'       // 韩文测试
                          ];
                          
                          testTexts.forEach((text) => {
                            // 创建测试元素
                            const testEl = doc.createElement('span');
                            testEl.textContent = text;
                            testEl.style.cssText = `
                              position: absolute;
                              top: -9999px;
                              left: -9999px;
                              font-size: 16px;
                              font-family: inherit;
                            `;
                            
                            doc.body.appendChild(testEl);
                            
                            // 检测实际字体
                            if (doc.defaultView && typeof doc.defaultView.getComputedStyle === 'function') {
                              const computedStyle = doc.defaultView.getComputedStyle(testEl);
                              if (computedStyle) {
                                console.log(`  "${text}":`, {
                                  fontFamily: computedStyle.fontFamily,
                                  actualFont: computedStyle.fontFamily.split(',')[0].trim().replace(/['"]/g, '')
                                });
                              }
                            }
                            
                            // 清理测试元素
                            doc.body.removeChild(testEl);
                          });
                          
                          // 检测CJK字体是否真的可用
                          const cjkFonts = ['LXGW WenKai', 'Huiwen-mincho', 'KingHwaOldSong', 'Noto Serif CJK', 'GuanKiapTsingKhai'];
                          console.log('🎯 CJK字体可用性检测:');
                          
                          cjkFonts.forEach(fontName => {
                            try {
                              if (doc.fonts && typeof (doc.fonts as any).check === 'function') {
                                const isAvailable = (doc.fonts as any).check(`16px "${fontName}"`, '测试');
                                console.log(`  "${fontName}": ${isAvailable ? '✅ 可用' : '❌ 不可用'}`);
                              }
                            } catch (e) {
                              console.log(`  "${fontName}": ❌ 检测失败`);
                            }
                          });
                        });
                        
                        // 创建检测结果提示
                        const detectNotification = document.createElement('div');
                        detectNotification.style.cssText = `
                          position: fixed;
                          top: 140px;
                          right: 20px;
                          background: #0ea5e9;
                          color: white;
                          padding: 12px 20px;
                          border-radius: 8px;
                          z-index: 10000;
                          font-weight: bold;
                          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                        `;
                        detectNotification.textContent = '🔍 字体检测完成，请查看控制台';
                        document.body.appendChild(detectNotification);
                        
                        setTimeout(() => detectNotification.remove(), 4000);
                        
                      } catch (error) {
                        console.error('❌ 字体检测失败:', error);
                      }
                    }}
                  >
                    🔍 检测实际字体
                  </button>
                  
                  <button 
                    className='btn btn-sm btn-warning'
                    onClick={() => {
                      console.log('💪 ===== 手动强制CJK字体优先 =====');
                      
                      // 🎯 直接调用复用的函数
                      applyForceCJKPriority(defaultCJKFont);
                      
                      // 创建成功提示
                      const forceNotification = document.createElement('div');
                      forceNotification.style.cssText = `
                        position: fixed;
                        top: 180px;
                        right: 20px;
                        background: #16a34a;
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        z-index: 10000;
                        font-weight: bold;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                      `;
                      forceNotification.textContent = `💪 手动强制应用 ${defaultCJKFont} 完成！`;
                      document.body.appendChild(forceNotification);
                      
                      setTimeout(() => forceNotification.remove(), 4000);
                    }}
                  >
                    💪 强制CJK优先
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontPanel; 