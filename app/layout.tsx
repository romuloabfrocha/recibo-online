import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recibo Online",
  description: "Emissão de recibos online para sua empresa",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
