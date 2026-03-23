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
  title: "GUAPO DROPS",
  description: "High-performance bidding and drops for premium gaming and cyber gear.",
};

import CartSidebar from "@/components/CartSidebar";
import ParticleEffect from "@/components/ParticleEffect";
import AnimatedBackground from "@/components/AnimatedBackground";
import FloatingGlow from "@/components/FloatingGlow";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3F541PEGN8"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-3F541PEGN8');
            `,
          }}
        />
      </head>
      <body className={`${fontOrbitron.variable} ${fontShareTechMono.variable} antialiased bg-organic-charcoal text-white selection:bg-neon-teal/30 flex flex-col min-h-screen`}>
        <Providers>
          <AnimatedBackground />
          <ParticleEffect />
          <FloatingGlow />
          <Nav />
          <CartSidebar />
          <div className="relative z-10 flex-grow" style={{ paddingTop: "var(--nav-height)" }}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
