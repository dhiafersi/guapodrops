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
    const accentColor = isBidding ? "violet" : "teal";
    const glowColor = accentColor === "teal" ? "rgba(0, 242, 255, 0.4)" : "rgba(157, 0, 255, 0.4)";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className={`liquid-glass p-6 rounded-3xl relative overflow-hidden group transition-all duration-500 ${className}`}
        >
            {/* Badges */}
            <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isBidding ? "bg-bio-violet text-white" : "bg-neon-teal text-black"
                }`}>
                {isBidding ? "Bidding" : "In Stock"}
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
            <Link href={`/drops/${product.id}`} className="relative z-10 w-full aspect-square mb-6 flex items-center justify-center block">
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
                    <h3 className="text-xl font-display font-bold text-white mb-1 uppercase tracking-wider truncate">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-xs text-chrome-dark uppercase tracking-widest">
                        {isBidding ? (
                            <>
                                <Clock className="w-3 h-3 text-bio-violet" />
                                Ends: {new Date(product.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </>
                        ) : (
                            <>
                                <Package className="w-3 h-3 text-neon-teal" />
                                [{product.stockQty}] Units Left
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                        <span className="block text-[10px] uppercase font-mono text-chrome-dark mb-0.5">
                            {isBidding ? "Current Bid" : "Price"}
                        </span>
                        <span className="text-xl font-display font-black text-white">
                            {isBidding ? product.startPrice : product.fixedPrice} TND
                        </span>
                    </div>
                    <Link href={`/drops/${product.id}`}>
                        <MagneticButton className={`px-5 py-2 rounded-full font-display font-bold text-[10px] uppercase transition-all duration-300 ${isBidding
                            ? "bg-bio-violet text-white shadow-[0_0_15px_rgba(157,0,255,0.5)]"
                            : "bg-neon-teal text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]"
                            } hover:brightness-110`}>
                            {isBidding ? "Place Bid" : "Buy Now"}
                        </MagneticButton>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
