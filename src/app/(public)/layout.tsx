import React from 'react'
import type { Metadata } from 'next'
import '@/app/styles.css'

export const metadata: Metadata = {
  title: 'IdeaFest 2025 - (Cult)ivate the Culture',
  description:
    'The Biggest Creative & Collaborative Festival is Back! One spark ignites a movement. One voice shifts the culture. This year, we’re ready to Cult)ivate the Culture with BIG IdeaTalks where bold ideas grow into something even BIGGER!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
