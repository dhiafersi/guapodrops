"use client";

import { useState } from "react";

export default function ProductGallery({ primaryImage, secondaryImages }: { primaryImage: string, secondaryImages: string | string[] }) {
    const imagesArray = Array.isArray(secondaryImages)
        ? [primaryImage, ...secondaryImages]
        : [primaryImage, ...(secondaryImages ? JSON.parse(secondaryImages as string) : [])];

    const [activeImg, setActiveImg] = useState(imagesArray[0]);

    if (!imagesArray.length || !imagesArray[0]) {
        return <div className="aspect-square w-full bg-black/40 border-2 border-chrome-dark/30 flex items-center justify-center font-mono text-chrome-dark">NO_VISUAL_DATA</div>;
    }

    return (
        <div className="space-y-4">
            <div className="aspect-square w-full bg-black/40 border-2 border-cyber-purple/50 flex items-center justify-center relative overflow-hidden group">
                <img src={activeImg} alt="Product" className="object-contain w-full h-full mix-blend-screen transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[url('/scanlines.png')] mix-blend-overlay opacity-20 pointer-events-none"></div>
            </div>

            {imagesArray.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {imagesArray.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImg(img)}
                            className={`aspect-square border-2 transition-all ${activeImg === img ? 'border-electric-lime scale-95' : 'border-chrome-dark/30 hover:border-cyber-purple'}`}
                        >
                            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover opacity-60 hover:opacity-100" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
