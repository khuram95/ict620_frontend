import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InterActRx',
  description: 'InterActRx',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      {/* <head>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </head> */}
      <body>{children}</body>
    </html>
  )
}
