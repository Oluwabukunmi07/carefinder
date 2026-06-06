import "./globals.css";
import SiteHeader from "../components/SiteHeader";

export const metadata = {
  title: "Carefinder",
  description: "Find hospitals near you across Nigeria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossOrigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  />
</head>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
