import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Web3Provider } from '@/components/web3-provider'
import { ElegyProvider } from '@/context/elegy-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Elegy | Trade the Grief',
  description: 'The first sentiment market for World Cup fan grief. Buy and sell grief tokens as fanbases react to elimination.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.svg', media: '(prefers-color-scheme: light)', type: 'image/svg+xml' },
      { url: '/icon-dark-32x32.svg',  media: '(prefers-color-scheme: dark)',  type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <Web3Provider>
          <ElegyProvider>
            {children}
          </ElegyProvider>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
