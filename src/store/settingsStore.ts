import { create } from 'zustand'
import { SystemSettings, ReadSettings } from '@/types/settings'
import { ViewSettings } from '@/types/book'
import { DEFAULT_SYSTEM_SETTINGS, DEFAULT_READSETTINGS, DEFAULT_VIEW_SETTINGS } from '@/utils/constants'

interface SettingsStore {
  settings: SystemSettings
  isFontLayoutSettingsGlobal: boolean
  fontLayoutSettingsDialogOpen: boolean
  
  // Actions
  setSettings: (settings: SystemSettings) => void
  saveSettings: (settings: SystemSettings) => Promise<void>
  loadSettings: () => Promise<void>
  setFontLayoutSettingsDialogOpen: (open: boolean) => void
  setIsFontLayoutSettingsGlobal: (global: boolean) => void
  updateGlobalViewSettings: (newSettings: Partial<ViewSettings>) => void
}

const createDefaultSettings = (): SystemSettings => ({
  ...DEFAULT_SYSTEM_SETTINGS,
  globalReadSettings: { ...DEFAULT_READSETTINGS },
  globalViewSettings: { ...DEFAULT_VIEW_SETTINGS },
} as SystemSettings)

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: createDefaultSettings(),
  isFontLayoutSettingsGlobal: true,
  fontLayoutSettingsDialogOpen: false,

  setSettings: (settings) => set({ settings }),

  saveSettings: async (settings) => {
    // TODO: Implement actual saving to Electron filesystem
    try {
      localStorage.setItem('settings', JSON.stringify(settings))
      set({ settings })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },

  updateGlobalViewSettings: (newSettings: Partial<ViewSettings>) => {
    const { settings } = get()
    const updatedSettings = {
      ...settings,
      globalViewSettings: {
        ...settings.globalViewSettings,
        ...newSettings,
      },
    }
    set({ settings: updatedSettings })
    get().saveSettings(updatedSettings)
  },

  loadSettings: async () => {
    try {
      const saved = localStorage.getItem('settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        const settings = {
          ...createDefaultSettings(),
          ...parsed,
          globalReadSettings: {
            ...DEFAULT_READSETTINGS,
            ...parsed.globalReadSettings,
          },
          globalViewSettings: {
            ...DEFAULT_VIEW_SETTINGS,
            ...parsed.globalViewSettings,
          },
        }
        set({ settings })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      set({ settings: createDefaultSettings() })
    }
  },

  setFontLayoutSettingsDialogOpen: (open) => set({ fontLayoutSettingsDialogOpen: open }),
  
  setIsFontLayoutSettingsGlobal: (global) => set({ isFontLayoutSettingsGlobal: global }),
})) 