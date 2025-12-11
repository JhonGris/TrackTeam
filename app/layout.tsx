import type { Metadata } from "next";
import { Poppins, Fira_Code } from "next/font/google";
import { MainNav } from "@/components/layout/main-nav";
import "./globals.css";

// Fuente principal (interfaz y titulares)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Fuente monoespaciada para código y logs
const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrackTeam - Sistema de Gestión de Servicio Técnico",
  description: "Sistema de gestión de equipos de cómputo y servicio técnico",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
  icons: {
    icon: ["/icon.svg", "/favicon.ico"],
    apple: "/icon.svg",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${firaCode.variable} antialiased min-h-screen bg-background`}
      >
        <MainNav />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
