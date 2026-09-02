import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "USINOTE — Diagnostic d'usinage",
  description: "Un diagnostic pratique pour les problèmes d'usinage.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}