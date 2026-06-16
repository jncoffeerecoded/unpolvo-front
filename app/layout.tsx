import type { Metadata } from "next";
import Script from "next/script";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AgeGate } from "@/components/AgeGate";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Chicas disponibles en tu ciudad`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "El mejor portal de contactos para adultos: anuncios clasificados eróticos gratis. Disfruta de encuentros sexuales en tu ciudad. Escorts, gay, travestis, swingers y más en CitasAlDia.",
  keywords: [
    "contactos",
    "escorts",
    "anuncios eróticos",
    "encuentros sexuales",
    "citas",
    "masajes eróticos",
    "swingers",
  ],
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <AgeGate />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </Providers>

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-73GPE0TKHE"
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-73GPE0TKHE');
          `}
        </Script>
      </body>
    </html>
  );
}
