import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SPYVAULT — Competitive Intelligence',
  description: 'Professional market intelligence for media buyers and affiliates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
