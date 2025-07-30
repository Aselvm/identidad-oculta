import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Identidad Oculta',
  description: 'Un juego de adivinanza de identidades multijugador',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}