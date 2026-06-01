import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
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
      <body className="min-h-full bg-gray-50 text-gray-900">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
