'use client'
import { useState, useEffect } from 'react'
import { 
  loadFontsWithStrategy, 
  removeCDNFonts,
  isCDNFontLoaded,
  getLXGWWenKaiResourceUrls,
  type FontLoadStrategy 
} from '@/utils/fontLoader'
import { 
  detectAllFontUsage,
  generateFontUsageReport,
  detectLXGWFontSource,
  type FontUsageResult 
} from '@/utils/fontUsageDetector'

export default function FontDemo() {
  const [currentStrategy, setCurrentStrategy] = useState<FontLoadStrategy>('local-first')
  const [lxgwLoaded, setLxgwLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fontUsageResults, setFontUsageResults] = useState<FontUsageResult[]>([])
  const [lxgwSource, setLxgwSource] = useState<string>('')
  const [detecting, setDetecting] = useState(false)

  // 检查 LXGW 字体加载状态
  const checkFontStatus = async () => {
    const loaded = await isCDNFontLoaded('LXGW WenKai GB Screen')
    setLxgwLoaded(loaded)
  }

  // 检测实际字体使用情况
  const detectFontUsage = async () => {
    setDetecting(true)
    try {
      const results = await detectAllFontUsage()
      setFontUsageResults(results)
      
      const lxgwResult = await detectLXGWFontSource()
      const sourceText = lxgwResult.source === 'local-ttf' ? '本地 TTF 文件' :
                        lxgwResult.source === 'cdn-woff2' ? 'CDN WOFF2 文件' :
                        lxgwResult.source === 'system-fallback' ? '系统回退字体' : '未知来源'
      setLxgwSource(`${sourceText}\n证据: ${lxgwResult.evidence.join(', ')}`)
      
    } catch (error) {
      console.error('字体检测失败:', error)
    } finally {
      setDetecting(false)
    }
  }

  // 切换字体策略
  const handleStrategyChange = async (strategy: FontLoadStrategy) => {
    setLoading(true)
    
    try {
      // 移除现有 CDN 字体
      removeCDNFonts(document)
      
      // 应用新策略
      if (strategy !== 'local-only') {
        loadFontsWithStrategy(document, strategy, true)
      }
      
      setCurrentStrategy(strategy)
      
      // 延迟检查字体状态和使用情况
      setTimeout(async () => {
        await checkFontStatus()
        await detectFontUsage()
        setLoading(false)
      }, 1000)
      
    } catch (error) {
      console.error('字体策略切换失败:', error)
      setLoading(false)
    }
  }

  // 初始检查
  useEffect(() => {
    const initCheck = async () => {
      await checkFontStatus()
      await detectFontUsage()
    }
    initCheck()
  }, [])

  // 获取字体资源信息
  const fontUrls = getLXGWWenKaiResourceUrls()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CDN 字体迁移演示</h1>
      
      {/* 策略选择器 */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">字体加载策略</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['local-only', 'local-first', 'cdn-first', 'cdn-only'] as FontLoadStrategy[]).map((strategy) => (
            <button
              key={strategy}
              onClick={() => handleStrategyChange(strategy)}
              disabled={loading}
              className={`p-3 rounded-md text-sm font-medium transition-colors ${
                currentStrategy === strategy
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {strategy}
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          当前策略: <span className="font-medium">{currentStrategy}</span>
          {loading && <span className="ml-2">⏳ 切换中...</span>}
        </div>
      </div>

      {/* 字体状态 */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">字体状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">LXGW WenKai GB Screen:</span>
            <span className={`ml-2 ${lxgwLoaded ? 'text-green-600' : 'text-red-600'}`}>
              {lxgwLoaded ? '✅ 已加载' : '❌ 未加载'}
            </span>
          </div>
          <div>
            <span className="font-medium">CDN 包版本:</span>
            <span className="ml-2 text-blue-600">1.0.6</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">实际字体使用检测</h3>
            <button
              onClick={detectFontUsage}
              disabled={detecting}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {detecting ? '🔍 检测中...' : '🔍 重新检测'}
            </button>
          </div>
          
          {lxgwSource && (
            <div className="mb-3 p-3 bg-white rounded border">
              <div className="font-medium text-sm mb-1">LXGW 字体来源分析:</div>
              <div className="text-sm text-gray-700 whitespace-pre-line">{lxgwSource}</div>
            </div>
          )}
          
          {fontUsageResults.length > 0 && (
            <div className="space-y-2">
              {fontUsageResults.map((result, index) => {
                const icon = result.source === 'local' ? '📁' : 
                           result.source === 'cdn' ? '🌐' : 
                           result.source === 'system' ? '💻' : '❓';
                           
                return (
                  <div key={index} className="p-2 bg-white rounded border text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {icon} {result.fontFamily}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.source === 'local' ? 'bg-green-100 text-green-700' :
                        result.source === 'cdn' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {result.source}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{result.details}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 字体演示 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">字体渲染测试</h2>
        <div className="space-y-4">
          {/* 英文字体测试 */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Roboto (无衬线)</h3>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '18px' }}>
              The quick brown fox jumps over the lazy dog. 0123456789
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Bitter (衬线)</h3>
            <p style={{ fontFamily: 'Bitter, serif', fontSize: '18px' }}>
              The quick brown fox jumps over the lazy dog. 0123456789
            </p>
          </div>

          {/* 中文字体测试 */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">LXGW WenKai GB Screen (中文)</h3>
            <p style={{ fontFamily: '"LXGW WenKai GB Screen", sans-serif', fontSize: '18px' }}>
              快速的棕色狐狸跳过懒狗。千字文：天地玄黄，宇宙洪荒。
            </p>
            <p style={{ fontFamily: '"LXGW WenKai GB Screen", sans-serif', fontSize: '16px', marginTop: '8px' }}>
              测试标点符号：，。！？；：「」『』（）【】
            </p>
          </div>

          {/* 混合文本测试 */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">混合文本测试</h3>
            <p style={{ fontFamily: '"LXGW WenKai GB Screen", Roboto, sans-serif', fontSize: '18px' }}>
              这是一段混合文本 Mixed Text 测试 Test。包含中文 Chinese 和英文 English。
              数字：12345 符号：@#$%^&*()
            </p>
          </div>
        </div>
      </div>

      {/* 技术信息 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">技术信息</h2>
        <div className="space-y-2 text-sm font-mono">
          <div><strong>CDN 主 CSS:</strong> {fontUrls.css}</div>
          <div><strong>WOFF2 Regular:</strong> {fontUrls.woff2.regular}</div>
          <div><strong>WOFF2 Light:</strong> {fontUrls.woff2.light}</div>
          <div><strong>WOFF2 Bold:</strong> {fontUrls.woff2.bold}</div>
        </div>
      </div>

      {/* 说明文档 */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">使用说明</h2>
        <ul className="space-y-2 text-sm">
          <li><strong>local-only:</strong> 仅使用本地字体文件，不加载 CDN 资源</li>
          <li><strong>local-first:</strong> 本地字体优先，CDN 字体作为补充（推荐）</li>
          <li><strong>cdn-first:</strong> CDN 字体优先，本地字体作为回退</li>
          <li><strong>cdn-only:</strong> 仅使用 CDN 字体，完全 readest 模式</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          💡 提示：切换策略后请观察字体渲染效果的变化。CDN 模式提供更丰富的字体变体，
          而本地模式提供更快的加载速度。
        </p>
      </div>
    </div>
  )
} 