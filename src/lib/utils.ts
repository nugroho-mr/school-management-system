import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { useGlobalProcessing } from './store/useGlobalProcessing'

export async function runWithGlobalProcessing<T>(fn: () => Promise<T>) {
  const { show, hide } = useGlobalProcessing.getState()
  show()
  try {
    return await fn()
  } finally {
    hide()
  }
}
