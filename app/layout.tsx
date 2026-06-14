import type { Metadata } from "next";
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
    default: `${SITE_NAME} · Conoce gente cerca de ti`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Publica tu perfil y conoce gente verificada cerca de ti. Citas por ciudad y país.",
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
      </body>
    </html>
  );
}
