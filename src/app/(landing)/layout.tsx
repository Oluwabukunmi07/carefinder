import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteHeader from "@/src/components/SiteHeader";
import Footer from "@/src/components/Footer";

export const metadata: Metadata = {
  title: "Carefinder",
  description: "Find hospitals near you across Nigeria",
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}
