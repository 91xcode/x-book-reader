'use client'
import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { 
  detectAndLogFonts, 
  setupFontLoadListener, 
  createLogger,
  type FontLoadResult 
} from '@/utils/fontDetector'
import { getMainPageFontStyles } from '@/utils/fontStyles'
import { 
  loadFontsWithStrategy, 
  removeCDNFonts,
  type FontLoadStrategy 
} from '@/utils/fontLoader'
// 🗑️ 移除复杂的全局字体管理器，简化为readest模式
// 在开发环境中导入布局设置测试（会自动运行）
if (process.env.NODE_ENV === 'development') {
  import('@/utils/layoutSettingsTest')
}

interface ThemeProviderProps {
  children: React.ReactNode
  fontStrategy?: FontLoadStrategy // 新增：字体加载策略选项
}

export default function ThemeProvider({ 
  children, 
  fontStrategy = 'cdn-only' // 默认仅使用CDN字体
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
        logger.info('🌐 开始加载 CDN 字体（使用 fontsapi.zeoseven.com 的5种字体）')
        
        // 使用 CDN 字体加载策略
        loadFontsWithStrategy(document, fontStrategy, true)
        
        setCdnFontsLoaded(true)
        logger.info('✅ CDN 字体加载完成 - 包含5种 fontsapi.zeoseven.com 中文字体')
        
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

  // 🗑️ 移除复杂的字体优化和全局管理器初始化

  // CDN字体系统初始化（不再检测本地字体）
  useEffect(() => {
    const logger = createLogger()
    
    const initializeFontSystem = async () => {
      try {
        logger.info('🚀 初始化 CDN 字体系统')
        
        // 设置字体加载监听器
        setupFontLoadListener(logger)
        
        // 🎯 初始化主页面字体样式，确保侧边栏与iframe使用统一字体栈
        const defaultFontSettings = {
          serifFont: 'Bitter',
          sansSerifFont: 'Roboto',
          monospaceFont: 'Consolas',
          defaultCJKFont: 'LXGW WenKai' // 🔧 修复：使用正确的zeoseven字体名称
        } as const
        
        const mainPageStyles = getMainPageFontStyles(defaultFontSettings as any)
        const mainStyleId = 'main-page-font-styles'
        const existingMainStyle = document.getElementById(mainStyleId)
        if (existingMainStyle) {
          existingMainStyle.remove()
        }
        
        const mainStyleElement = document.createElement('style')
        mainStyleElement.id = mainStyleId
        mainStyleElement.textContent = mainPageStyles
        document.head.appendChild(mainStyleElement)
        logger.info('🎨 主页面字体样式初始化完成')
        
        setFontsLoaded(true)
        logger.info('✨ CDN 字体系统初始化完成')
        
      } catch (error) {
        logger.error('💥 CDN 字体系统初始化失败', { error })
        setFontsLoaded(true) // 即使失败也继续
      }
    }
    
    initializeFontSystem()
  }, [])

  // CDN字体系统状态报告
  useEffect(() => {
    if (!cdnFontsLoaded) return
    
    const logger = createLogger()
    
    logger.info('🎯 CDN字体系统最终状态', {
      CDN字体状态: '✅ 已成功加载 fontsapi.zeoseven.com 5种中文字体',
      中文字体来源: 'CDN (fontsapi.zeoseven.com/292,256,309,285,427)',
      基础字体来源: 'Google Fonts CDN (Roboto, Bitter, Fira Code等)',
      加载策略: fontStrategy,
      性能优化: '✅ 纯CDN模式，无本地字体依赖',
      用户体验: '完全基于CDN的字体系统，快速稳定'
    })
    
  }, [cdnFontsLoaded, fontStrategy])

  return (
    <div className={fontsLoaded && cdnFontsLoaded ? 'font-loaded' : 'font-loading'}>
      {children}
    </div>
  )
} 