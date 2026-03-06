"use client";

import React, { useRef, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import KineticText from "@/components/KineticText";
import MagneticButton from "@/components/MagneticButton";
import ProductCard from "@/components/ProductCard";
import FloatingGlow from "@/components/FloatingGlow";
import { Zap } from "lucide-react";

interface CyberLandingProps {
    products: any[];
}

export default function CyberLanding({ products }: CyberLandingProps) {
    const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / 25;
            const y = (e.clientY - innerHeight / 2) / 25;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <main className="relative bg-organic-charcoal min-h-screen text-white pb-20">
            <FloatingGlow />

            {/* Hero Section */}
            <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden px-4">
                {/* Background Visual Element */}
                <motion.div
                    style={{
                        x: mouseX,
                        y: mouseY,
                        rotate: useTransform(mouseX, [-20, 20], [-5, 5]),
                    }}
                    className="absolute z-10 w-[800px] h-[800px] border border-white/5 rounded-full flex items-center justify-center opacity-30"
                >
                    <div className="w-[600px] h-[600px] border border-white/10 rounded-full" />
                    <div className="w-[400px] h-[400px] border border-white/20 rounded-full" />
                </motion.div>

                <div className="relative z-30 text-center space-y-6">
                    <KineticText as="h1" className="text-6xl md:text-9xl font-black tracking-tighter leading-none">
                        GUAPO DROPS
                    </KineticText>
                    <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="font-mono text-xl md:text-3xl text-neon-teal uppercase tracking-[0.3em] font-bold"
                    >
                        High Performance <span className="text-white">Redefined</span>
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="font-mono text-sm md:text-base text-chrome-dark uppercase tracking-widest max-w-xl mx-auto"
                    >
                        Shop the rarest gaming gear before it sells out.
                        Fresh drops, real stock, fully authentic.
                    </motion.p>
                </div>
            </section>

            {/* Live Drops Grid - Functional Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-10">
                <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                        <Zap className="text-neon-teal animate-pulse" />
                        <KineticText as="h2" className="text-3xl font-bold tracking-tight">
                            Live Now
                        </KineticText>
                    </div>
                    <span className="font-mono text-xs text-chrome-dark uppercase tracking-widest">
                        [{products.length}] products available
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {products.map((p, index) => (
                        <div key={p.id} className={index % 2 === 0 ? "md:translate-y-8" : ""}>
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="py-20 text-center liquid-glass rounded-3xl">
                        <p className="font-mono text-chrome-dark uppercase tracking-[0.3em]">No active drops at the moment.</p>
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="relative py-40 flex flex-col items-center justify-center text-center">
                <KineticText as="h2" className="text-4xl md:text-6xl font-black mb-8">
                    Ready for the <br /> Next Phase?
                </KineticText>
                <MagneticButton className="px-12 py-4 rounded-none bg-white text-black font-display font-black text-lg uppercase shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-all">
                    Join the Network
                </MagneticButton>
            </section>
        </main>
    );
}
