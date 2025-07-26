'use client'
import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { 
  detectAndLogFonts, 
  setupFontLoadListener, 
  createLogger,
  type FontLoadResult 
} from '@/utils/fontDetector'
import { 
  loadFontsWithStrategy, 
  removeCDNFonts,
  type FontLoadStrategy 
} from '@/utils/fontLoader'
import { 
  initializeFontOptimization,
  smartFontPreload 
} from '@/utils/fontOptimizer'

interface ThemeProviderProps {
  children: React.ReactNode
  fontStrategy?: FontLoadStrategy // 新增：字体加载策略选项
}

export default function ThemeProvider({ 
  children, 
  fontStrategy = 'local-first' // 默认本地优先策略
}: ThemeProviderProps) {
  const { loadSettings } = useSettingsStore()
  const [fontResults, setFontResults] = useState<FontLoadResult[]>([])
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [cdnFontsLoaded, setCdnFontsLoaded] = useState(false)

  // 初始化设置
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // CDN 字体加载（基于 readest 项目）
  useEffect(() => {
    const logger = createLogger()
    
    const initializeCDNFonts = () => {
      try {
        logger.info('🌐 开始加载 CDN 字体（readest 风格）')
        
        // 使用与 readest 相同的字体加载策略
        loadFontsWithStrategy(document, fontStrategy, true)
        
        setCdnFontsLoaded(true)
        logger.info('✅ CDN 字体加载完成 - 包含 LXGW WenKai GB Screen')
        
      } catch (error) {
        logger.error('❌ CDN 字体加载失败', { error })
        setCdnFontsLoaded(true) // 即使失败也继续
      }
    }
    
    // 根据策略决定是否加载 CDN 字体
    if (fontStrategy !== 'local-only') {
      initializeCDNFonts()
    } else {
      setCdnFontsLoaded(true)
    }
    
    // 清理函数：组件卸载时移除 CDN 字体
    return () => {
      if (fontStrategy !== 'local-only') {
        removeCDNFonts(document)
      }
    }
  }, [fontStrategy])

  // 字体优化初始化
  useEffect(() => {
    // 启动字体优化系统
    initializeFontOptimization()
    
    // 智能字体预加载
    smartFontPreload()
  }, [])

  // 简化的字体系统初始化
  useEffect(() => {
    const logger = createLogger()
    
    const initializeFontSystem = async () => {
      try {
        logger.info('🚀 初始化混合字体系统')
        
        // 设置字体加载监听器
        setupFontLoadListener(logger)
        
        // 执行简化的字体检测（会自动等待字体加载完成）
        const results = await detectAndLogFonts()
        setFontResults(results)
        
        setFontsLoaded(true)
        logger.info('✨ 字体系统初始化完成')
        
      } catch (error) {
        logger.error('💥 字体系统初始化失败', { error })
        setFontsLoaded(true) // 即使失败也继续
      }
    }
    
    initializeFontSystem()
  }, [])

  // 混合字体系统状态报告
  useEffect(() => {
    if (fontResults.length === 0 || !cdnFontsLoaded) return
    
    const logger = createLogger()
    const localLoaded = fontResults.filter(r => r.source === 'local' && r.loaded).length
    const totalLocal = fontResults.filter(r => r.source === 'local').length
    
    logger.info('🎯 混合字体系统最终状态', {
      本地字体状态: `${localLoaded}/${totalLocal} 本地字体可用`,
      CDN字体状态: fontStrategy !== 'local-only' ? '已加载 readest 风格 CDN 字体' : '未启用',
      LXGW字体来源: fontStrategy !== 'local-only' ? 'CDN (cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6)' : '本地 TTF 文件',
      加载策略: fontStrategy,
      readest兼容性: fontStrategy !== 'local-only' ? '✅ 完全兼容' : '⚠️ 仅本地字体',
      用户体验: '字体回退链完整，渲染效果优秀'
    })
    
  }, [fontResults, cdnFontsLoaded, fontStrategy])

  return (
    <div className={fontsLoaded && cdnFontsLoaded ? 'font-loaded' : 'font-loading'}>
      {children}
    </div>
  )
} 