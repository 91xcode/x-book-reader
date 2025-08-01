import { useRef, useCallback, useEffect } from 'react'

interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  stage: string
  bookKey: string
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean
  logToConsole?: boolean
}

export const usePerformanceMonitor = (
  bookKey: string, 
  options: UsePerformanceMonitorOptions = {}
) => {
  const { enabled = true, logToConsole = process.env.NODE_ENV === 'development' } = options
  const metricsRef = useRef<PerformanceMetrics[]>([])
  const stageStartTimes = useRef<Record<string, number>>({})

  // 开始测量阶段
  const startStage = useCallback((stage: string) => {
    if (!enabled) return
    
    const startTime = performance.now()
    stageStartTimes.current[stage] = startTime
    
    if (logToConsole) {
      console.log(`🚀 [${bookKey}] Starting stage: ${stage}`)
    }
  }, [bookKey, enabled, logToConsole])

  // 结束测量阶段
  const endStage = useCallback((stage: string) => {
    if (!enabled) return
    
    const endTime = performance.now()
    const startTime = stageStartTimes.current[stage]
    
    if (startTime) {
      const duration = endTime - startTime
      const metric: PerformanceMetrics = {
        startTime,
        endTime,
        duration,
        stage,
        bookKey
      }
      
      metricsRef.current.push(metric)
      
      if (logToConsole) {
        console.log(`✅ [${bookKey}] Completed stage: ${stage} in ${duration.toFixed(2)}ms`)
      }
      
      delete stageStartTimes.current[stage]
    }
  }, [bookKey, enabled, logToConsole])

  // 获取所有指标
  const getMetrics = useCallback(() => {
    return metricsRef.current
  }, [])

  // 获取总加载时间
  const getTotalLoadTime = useCallback(() => {
    const metrics = metricsRef.current
    if (metrics.length === 0) return 0
    
    const firstStart = Math.min(...metrics.map(m => m.startTime))
    const lastEnd = Math.max(...metrics.map(m => m.endTime || 0))
    
    return lastEnd - firstStart
  }, [])

  // 清除指标
  const clearMetrics = useCallback(() => {
    metricsRef.current = []
    stageStartTimes.current = {}
  }, [])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (logToConsole && metricsRef.current.length > 0) {
        const totalTime = getTotalLoadTime()
        console.log(`📊 [${bookKey}] Performance Summary:`)
        console.table(metricsRef.current.map(m => ({
          Stage: m.stage,
          Duration: `${m.duration?.toFixed(2)}ms`,
          'Start Time': `${m.startTime.toFixed(2)}ms`
        })))
        console.log(`⏱️ [${bookKey}] Total Load Time: ${totalTime.toFixed(2)}ms`)
      }
    }
  }, [bookKey, logToConsole, getTotalLoadTime])

  return {
    startStage,
    endStage,
    getMetrics,
    getTotalLoadTime,
    clearMetrics
  }
}