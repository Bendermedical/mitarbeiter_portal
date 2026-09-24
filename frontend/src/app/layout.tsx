import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BMV Mitarbeiterportal — Bender Medical Vertriebs GmbH",
  description: "Internal Staff Portal for Bender Medical Vertriebs GmbH",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="antialiased bg-neutral-50 min-h-screen text-neutral-900 font-sans">
        {children}
      </body>
    </html>
  );
}
