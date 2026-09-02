import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { WhatsAppFloatingButton } from "@/components/shell/WhatsAppFloatingButton";
import { GoogleAdsTag } from "@/components/analytics/GoogleAdsTag";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Conecta Direito | Encontre o advogado ideal para o seu caso",
  description:
    "Marketplace jurídico que conecta clientes a advogados especializados em minutos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans">
        <GoogleAdsTag />
        <SessionProvider>{children}</SessionProvider>
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
