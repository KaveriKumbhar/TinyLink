import './globals.css'

export const metadata = {
  title: 'TinyLink - URL Shortener',
  description: 'Shorten your URLs and track clicks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

