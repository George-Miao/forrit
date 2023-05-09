import './shim.css'

import { Inter } from 'next/font/google'

import GlobalLayout from '@/components/GlobalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lol',
  description: ''
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-neutral-500/5 min-h-[100vh] min-w-[10-vw]`}
      >
        <GlobalLayout>
          <div>{children}</div>
        </GlobalLayout>
      </body>
    </html>
  )
}
