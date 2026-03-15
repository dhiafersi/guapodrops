"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import KineticText from "@/components/KineticText";
import MagneticButton from "@/components/MagneticButton";
import ProductCard from "@/components/ProductCard";
import FloatingGlow from "@/components/FloatingGlow";
import { Zap } from "lucide-react";
import { useSession } from "next-auth/react";

interface CyberLandingProps {
    products: any[];
}

export default function CyberLanding({ products }: CyberLandingProps) {
    const { status } = useSession();
    const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (window.innerWidth < 768) return; // Disable on mobile to prevent lag
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / 25;
            const y = (e.clientY - innerHeight / 2) / 25;
            mouseX.set(x);
            mouseY.set(y);
        };

        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            window.addEventListener("mousemove", handleMouseMove);
        }
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <main className="relative min-h-screen bg-organic-charcoal pb-20 text-white">
            <FloatingGlow />

            <section className="relative flex min-h-[78svh] flex-col items-center justify-center overflow-hidden px-4 pb-12 pt-8 md:min-h-[80vh] md:px-6">
                <motion.div
                    style={{
                        x: mouseX,
                        y: mouseY,
                        rotate: useTransform(mouseX, [-20, 20], [-5, 5]),
                    }}
                    className="absolute z-10 hidden h-[800px] w-[800px] items-center justify-center rounded-full border border-white/5 opacity-30 md:flex"
                >
                    <div className="w-[600px] h-[600px] border border-white/10 rounded-full" />
                    <div className="w-[400px] h-[400px] border border-white/20 rounded-full" />
                </motion.div>

                <div className="relative z-20 mb-8 w-full max-w-sm self-stretch rounded-[2rem] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-md md:hidden">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
                                Mobile Drop Feed
                            </p>
                            <p className="mt-1 font-display text-lg font-black uppercase tracking-[0.18em] text-white">
                                Fresh gear, fast checkout
                            </p>
                        </div>
                        <div className="rounded-2xl border border-neon-teal/30 bg-neon-teal/10 px-3 py-2 text-right">
                            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-neon-teal">
                                Live
                            </p>
                            <p className="font-display text-xl font-black text-white">{products.length}</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-30 space-y-5 text-center md:space-y-6">
                    <KineticText as="h1" className="mx-auto max-w-[8ch] text-5xl font-black leading-[0.88] tracking-[-0.06em] md:max-w-none md:text-9xl md:tracking-tighter">
                        GUAPO DROPS
                    </KineticText>
                    <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mx-auto max-w-[18rem] font-mono text-xs font-bold uppercase tracking-[0.35em] text-neon-teal md:max-w-none md:text-3xl md:tracking-[0.3em]"
                    >
                        High Performance <span className="text-white">Redefined</span>
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mx-auto max-w-[20rem] font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-chrome-dark md:max-w-xl md:text-base md:tracking-widest"
                    >
                        Shop the rarest gaming gear before it sells out.
                        Fresh drops, real stock, fully authentic.
                    </motion.p>

                    <div className="mx-auto flex max-w-md flex-col gap-3 pt-3 sm:flex-row sm:justify-center">
                        <a
                            href="#live-now"
                            className="rounded-full border border-neon-teal/25 bg-neon-teal/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-neon-teal"
                        >
                            Browse Live Drops
                        </a>
                        {status !== "authenticated" && <LinkButton />}
                    </div>
                </div>
            </section>

            <section id="live-now" className="relative z-10 mx-auto max-w-7xl px-4 md:px-10">
                <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-5 md:mb-12 md:flex-row md:items-center md:justify-between md:pb-6">
                    <div className="flex items-center gap-3">
                        <Zap className="text-neon-teal animate-pulse" />
                        <KineticText as="h2" className="text-2xl font-bold tracking-tight md:text-3xl">
                            Live Now
                        </KineticText>
                    </div>
                    <span className="font-mono text-[10px] text-chrome-dark uppercase tracking-[0.26em] md:text-xs md:tracking-widest">
                        [{products.length}] products available
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-12">
                    {products.map((p, index) => (
                        <div key={p.id} className={index % 2 === 0 ? "md:translate-y-8" : ""}>
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="liquid-glass rounded-[2rem] py-16 text-center md:rounded-3xl md:py-20">
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-chrome-dark md:text-base">
                            No active drops at the moment.
                        </p>
                    </div>
                )}
            </section>

            <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center md:py-40">
                <KineticText as="h2" className="mb-6 text-3xl font-black md:mb-8 md:text-6xl">
                    Ready for the <br /> Next Phase?
                </KineticText>
                <MagneticButton className="px-12 py-4 rounded-none bg-white text-black font-display font-black text-lg uppercase shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-all">
                    Join the Network
                </MagneticButton>
            </section>
        </main>
    );
}

function LinkButton() {
    return (
        <a
            href="/auth/register"
            className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white"
        >
            Create Account
        </a>
    );
}
