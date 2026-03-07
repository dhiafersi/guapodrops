import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Nav from "@/components/Nav";

const fontOrbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const fontShareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GUAPO | Y2K Cyber Drops",
  description: "High-performance bidding and drops for premium gaming and cyber gear.",
};

import CartSidebar from "@/components/CartSidebar";
import ParticleEffect from "@/components/ParticleEffect";
import AnimatedBackground from "@/components/AnimatedBackground";
import FloatingGlow from "@/components/FloatingGlow";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontOrbitron.variable} ${fontShareTechMono.variable} antialiased bg-organic-charcoal text-white selection:bg-neon-teal/30`}>
        <Providers>
          <AnimatedBackground />
          <ParticleEffect />
          <FloatingGlow />
          <Nav />
          <CartSidebar />
          <div className="relative z-10" style={{ paddingTop: "var(--nav-height)" }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
