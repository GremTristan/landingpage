import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SmartBanker",
  description: "Devenez actionnaire de votre réseau financier",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body>
        {children}
      </body>
    </html>
  )
}

