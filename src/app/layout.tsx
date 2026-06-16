import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SpendLens — AI Cost Auditor",
  description:
    "Find out exactly how much your company wastes on AI tools — and where to reinvest the savings.",
  openGraph: {
    title: "SpendLens — AI Cost Auditor",
    description: "Free AI spend audit. Find your waste. Fix it in minutes.",
    url: "https://spendlens.io",
    siteName: "SpendLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — AI Cost Auditor",
    description: "Free AI spend audit. Find your waste. Fix it in minutes.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
  <ClerkProvider>
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-bg text-primary antialiased`}>
        {children}
      </body>
    </html>
  </ClerkProvider>
)
}
