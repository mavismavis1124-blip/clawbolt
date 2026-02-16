import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'SimpleClaw - AI Agents Made Simple',
  description: 'Deploy autonomous AI agents in minutes. No complex infrastructure, no steep learning curve — just describe what you want and let it run.',
  keywords: ['AI', 'agents', 'automation', 'deployment', 'simple', 'cloud'],
  authors: [{ name: 'SimpleClaw' }],
  openGraph: {
    title: 'SimpleClaw - AI Agents Made Simple',
    description: 'Deploy autonomous AI agents in minutes.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen bg-bg-void text-text-primary antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
