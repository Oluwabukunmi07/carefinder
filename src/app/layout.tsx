import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carefinder",
  description:
    "A hospital directory for finding, exporting, and sharing hospital information across Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
