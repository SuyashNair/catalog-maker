import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Catalog Maker - Premium Product Catalog",
  description: "Browse our curated collection of premium products. Fast, mobile-first product catalog with WhatsApp enquiry.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
