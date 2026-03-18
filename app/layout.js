import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'ZüriHub – Entdecke Zürich',
  description: 'Dein Guide für den Kanton Zürich – Essen & Trinken, Shops, Kultur & Natur, Events und Unterhaltung & Spass.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏙️</text></svg>",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
