import { create } from 'zustand'

export type ViewType = 'dashboard' | 'portfolio' | 'case-studies' | 'case-study-detail' | 'pitch-decks' | 'pitch-deck-detail' | 'project-rooms' | 'project-room-detail'

interface AppState {
  currentView: ViewType
  selectedId: string | null
  sidebarOpen: boolean
  setView: (view: ViewType, id?: string | null) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  selectedId: null,
  sidebarOpen: true,
  setView: (view, id = null) => set({ currentView: view, selectedId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
