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
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}