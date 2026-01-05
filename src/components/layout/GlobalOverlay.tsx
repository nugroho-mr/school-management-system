'use client'

import { useGlobalProcessing } from '@/lib/store/useGlobalProcessing'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'

export const GlobalProcessingOverlay = () => {
  const isLoading = useGlobalProcessing((state) => state.count > 0)

  if (!isLoading) return null

  return (
    <div className="z-99999 fixed inset-0 bg-neutral-900/50 flex items-center justify-center">
      <Item className="bg-white">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">Memproses...</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  )
}
