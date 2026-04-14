import { create } from 'zustand'

export type ViewType =
  | 'dashboard'
  | 'revenue'
  | 'finance'
  | 'capacity'
  | 'pricing'
  | 'portfolio'
  | 'case-studies'
  | 'case-study-detail'
  | 'pitch-decks'
  | 'pitch-deck-detail'
  | 'project-rooms'
  | 'project-room-detail'

interface AppState {
  currentView: ViewType
  selectedId: string | null
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  setView: (view: ViewType, id?: string | null) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  selectedId: null,
  sidebarOpen: true,
  mobileMenuOpen: false,
  setView: (view, id = null) => set({ currentView: view, selectedId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
}))
