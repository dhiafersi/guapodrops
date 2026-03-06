"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageGalleryProps {
    mainImage: string | null;
    extraImages: string[];
    productName: string;
}

export default function ImageGallery({ mainImage, extraImages, productName }: ImageGalleryProps) {
    const allImages = [
        ...(mainImage ? [mainImage] : []),
        ...extraImages.filter(Boolean),
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const currentImage = allImages[activeIndex];

    if (allImages.length === 0) {
        return (
            <div className="relative aspect-square bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden flex items-center justify-center">
                <p className="font-mono text-chrome-dark text-xs tracking-widest uppercase">[ No Image Available ]</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Main Display */}
            <div className="relative aspect-square bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImage}
                        src={currentImage}
                        alt={productName}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full object-contain p-10 drop-shadow-2xl mix-blend-screen"
                    />
                </AnimatePresence>

                {/* Dot indicators at bottom */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {allImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex
                                        ? "bg-neon-teal w-5"
                                        : "bg-white/25 w-1.5 hover:bg-white/50"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.04)_0%,transparent_70%)]" />
            </div>

            {/* Thumbnail Strip — smaller, hover & tap to switch */}
            {allImages.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {allImages.map((img, i) => (
                        <button
                            key={i}
                            // Desktop: hover switches image
                            onMouseEnter={() => setActiveIndex(i)}
                            // Mobile: tap switches image
                            onTouchStart={() => setActiveIndex(i)}
                            onClick={() => setActiveIndex(i)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${i === activeIndex
                                    ? "border-neon-teal shadow-[0_0_10px_rgba(0,242,255,0.35)] scale-105"
                                    : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${productName} view ${i + 1}`}
                                className="w-full h-full object-contain p-1 mix-blend-screen"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
