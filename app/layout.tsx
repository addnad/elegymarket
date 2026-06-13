import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Web3Provider } from '@/components/web3-provider'
import { ElegyProvider } from '@/context/elegy-context'
import { PendoInitializer } from '@/components/pendo-initializer'
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track','trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})('12ca1c2f-dccf-4182-b6ae-d867c162fea0');`
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <Web3Provider>
          <PendoInitializer />
          <ElegyProvider>
            {children}
          </ElegyProvider>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
