import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aitana",
  description: "Widget de chat con Aitana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
