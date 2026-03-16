import './globals.css'

export const metadata = {
  title: 'ZüriHub – Entdecke Zürich',
  description: 'Dein Guide für den Kanton Zürich – Restaurants, Shops, Museen, Kultur, Events und Entertainment.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏙️</text></svg>",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
