import { create } from 'zustand'
import { ViewSettings, PageInfo } from '@/types/book'
import { DEFAULT_VIEW_SETTINGS } from '@/utils/constants'

interface ReaderState {
  bookKeys: string[]
  views: Record<string, any>
  viewSettings: Record<string, ViewSettings>
  progress: Record<string, PageInfo>
  hoveredBookKey: string | null
}

interface ReaderStore extends ReaderState {
  // Actions
  setBookKeys: (keys: string[]) => void
  setView: (key: string, view: any) => void
  getView: (key: string) => any
  setViewSettings: (key: string, settings: ViewSettings) => void
  getViewSettings: (key: string) => ViewSettings | null
  setProgress: (key: string, current: number, total: number, section?: string, location?: any) => void
  getProgress: (key: string) => PageInfo | null
  setHoveredBookKey: (key: string | null) => void
}

export const useReaderStore = create<ReaderStore>((set, get) => ({
  bookKeys: [],
  views: {},
  viewSettings: {},
  progress: {},
  hoveredBookKey: null,

  setBookKeys: (keys) => set({ bookKeys: keys }),

  setView: (key, view) => set((state) => ({
    views: { ...state.views, [key]: view }
  })),

  getView: (key) => get().views[key],

  setViewSettings: (key, settings) => set((state) => ({
    viewSettings: { ...state.viewSettings, [key]: settings }
  })),

  getViewSettings: (key) => {
    const settings = get().viewSettings[key]
    return settings || { ...DEFAULT_VIEW_SETTINGS }
  },

  setProgress: (key, current, total, section, location) => set((state) => ({
    progress: {
      ...state.progress,
      [key]: { current, total, section, location }
    }
  })),

  getProgress: (key) => get().progress[key] || null,

  setHoveredBookKey: (key) => set({ hoveredBookKey: key }),
})) 