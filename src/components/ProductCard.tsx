"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, Package } from "lucide-react";
import MagneticButton from "./MagneticButton";

interface ProductCardProps {
    product: any;
    className?: string;
}

export default function ProductCard({
    product,
    className = "",
}: ProductCardProps) {
    const isBidding = product.mode === 'BIDDING';
    const isSurCommande = product.isSurCommande || product.is_sur_commande;
    const accentColor = isBidding ? "violet" : "teal";
    const glowColor = accentColor === "teal" ? "rgba(0, 242, 255, 0.4)" : "rgba(157, 0, 255, 0.4)";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className={`liquid-glass relative overflow-hidden rounded-[2rem] p-4 transition-all duration-500 group md:rounded-3xl md:p-6 ${className}`}
        >
            {/* Badges */}
            <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 items-end md:right-4 md:top-4">
                <div className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] shadow-lg md:text-[10px] md:tracking-widest ${
                    isBidding ? "bg-bio-violet text-white" : isSurCommande ? "bg-white text-black border border-black/10" : "bg-neon-teal text-black"
                }`}>
                    {isBidding ? "Bidding" : isSurCommande ? "Sur Commande" : "In Stock"}
                </div>
            </div>

            {/* Background Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
                    filter: "blur(40px)"
                }}
            />

            {/* Product Image - clickable */}
            <Link href={`/drops/${product.id}`} className="relative z-10 mb-4 block aspect-square w-full md:mb-6">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-full h-full"
                >
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] mix-blend-screen"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-2xl border border-white/5">
                            <span className="font-mono text-xs uppercase text-white/30">No Image</span>
                        </div>
                    )}
                </motion.div>
            </Link>

            {/* Product Info */}
            <div className="relative z-10 space-y-4">
                <div>
                    <h3 className="mb-1 line-clamp-2 text-lg font-display font-bold uppercase tracking-[0.08em] text-white md:text-xl md:tracking-wider">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-chrome-dark md:text-xs md:tracking-widest">
                        {isBidding ? (
                            <>
                                <Clock className="w-3 h-3 text-bio-violet" />
                                Ends: {new Date(product.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </>
                        ) : (
                            <>
                                <Package className="w-3 h-3 text-neon-teal" />
                                {isSurCommande ? 'Sur Commande' : `[${product.stockQty}] Units Left`}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                    <div className="min-w-0">
                        <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark md:text-[10px]">
                            {isBidding ? "Current Bid" : "Price"}
                        </span>
                        <span className="text-lg font-display font-black text-white md:text-xl">
                            {isBidding ? product.startPrice : product.fixedPrice} TND
                        </span>
                    </div>
                    <Link href={`/drops/${product.id}`} className="shrink-0">
                        <MagneticButton className={`px-5 py-2 rounded-full font-display font-bold text-[10px] uppercase transition-all duration-300 ${isBidding
                            ? "bg-bio-violet text-white shadow-[0_0_15px_rgba(157,0,255,0.5)]"
                            : "bg-neon-teal text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]"
                            } hover:brightness-110 md:px-5 md:py-2 px-4 py-2.5`}>
                            {isBidding ? "Place Bid" : "Buy Now"}
                        </MagneticButton>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
