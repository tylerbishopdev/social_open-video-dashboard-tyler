import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Open Video Dashboard - Daily Discussion Tracker',
  description: 'Track daily discussions about Open Video and creator economy topics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Open Video Dashboard - Daily Discussion Tracker</title>
        <meta name="description" content="Track daily discussions about Open Video and creator economy topics" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}