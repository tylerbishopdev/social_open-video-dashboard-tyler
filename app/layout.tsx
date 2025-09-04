import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tyler OV Daily Discussion Tracker',
  description: 'Track discussions and news about Open Video and creator economy topic sources to engage with',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>

      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-r from-cyan-600 via-cyan-800 to-cyan-500">
          {children}
        </div>
      </body>
    </html>
  )
}