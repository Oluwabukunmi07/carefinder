import SiteHeader from "@/src/components/SiteHeader";
import Footer from "@/src/components/Footer";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <Footer />
    </>
  );
}
