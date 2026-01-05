import { create } from 'zustand'

type GlobalProcessingState = {
  count: number
  show: () => void
  hide: () => void
  reset: () => void
  isLoading: () => boolean
}

export const useGlobalProcessing = create<GlobalProcessingState>((set, get) => ({
  count: 0,
  show: () => {
    set((curState) => ({ count: curState.count + 1 }))
  },
  hide: () => {
    set((curState) => ({ count: Math.max(0, curState.count - 1) }))
  },
  reset: () => {
    set(() => ({ count: 0 }))
  },
  isLoading: () => get().count > 0,
}))
