import type { Metadata } from "next";
import { Inter, Poppins, Fira_Code } from "next/font/google";
import { MainNav } from "@/components/layout/main-nav";
import "./globals.css";

// Fuente principal para interfaz y cuerpo de texto
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Fuente para titulares y marca
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${firaCode.variable} antialiased min-h-screen bg-background`}
      >
        <MainNav />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
