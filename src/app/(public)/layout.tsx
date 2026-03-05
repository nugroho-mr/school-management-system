import React from 'react'
import type { Metadata } from 'next'
import '@/app/styles.css'
import './styles.css'

export const metadata: Metadata = {
  title: 'Crescent Wonder School Management System',
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
