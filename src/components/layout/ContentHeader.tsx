'use client'

import Link from 'next/link'
import { IoChevronBack } from 'react-icons/io5'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ContentHeader = ({
  title,
  badges,
  prevPath,
}: {
  title: string
  badges?: {
    title: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props?: { [key: string]: any }
  }[]
  prevPath?: string
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      {prevPath && (
        <div>
          <Link href={prevPath}>
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer flex items-center hover"
            >
              <IoChevronBack />
            </Button>
          </Link>
        </div>
      )}
      <div>
        <h1 className="font-bold text-xl">{title}</h1>
      </div>
      {prevPath && (
        <ul className="flex gap-1 items-center">
          {badges?.map((badge, i: number) => (
            <li key={i}>
              <Badge {...badge.props}>{badge.title}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ContentHeader
