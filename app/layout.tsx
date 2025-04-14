import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Summary AI",
  description: "AI summary for files pdf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
