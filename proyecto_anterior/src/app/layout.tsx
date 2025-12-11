import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/modal.css";
import { InventarioProvider } from "@/contexts/InventarioContext";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "IGLOO LAB - Servicio Técnico e Inventario",
  description: "Sistema de gestión de inventario y servicio técnico",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <InventarioProvider>
          {children}
        </InventarioProvider>
      </body>
    </html>
  );
}
