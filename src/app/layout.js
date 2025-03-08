import './globals.css';
import Link from 'next/link';
export const metadata = {
  title: 'smartER',
  description: 'A Secure Portal for Authorized Medical Staff',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>{children}</body>
    </html>
  )
}
