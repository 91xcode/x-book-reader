'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { loadSettings } = useSettingsStore()

  useEffect(() => {
    // Load settings on app initialization
    loadSettings()
  }, [loadSettings])

  return <>{children}</>
} 