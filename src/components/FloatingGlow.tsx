"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function FloatingGlow() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for magnetic lag effect
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Primary Teal Glow */}
            <motion.div
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                className="absolute w-[600px] h-[600px] rounded-full opacity-20 glow-teal"
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Secondary Violet Glow */}
            <motion.div
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-30%",
                    translateY: "-40%",
                }}
                className="absolute w-[500px] h-[500px] rounded-full opacity-15 glow-violet"
                animate={{
                    scale: [1.2, 1, 1.2],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Static Accent Glows */}
            <div className="absolute top-1/4 -left-20 w-[800px] h-[800px] rounded-full bg-neon-teal/5 blur-[120px]" />
            <div className="absolute bottom-1/4 -right-20 w-[800px] h-[800px] rounded-full bg-bio-violet/5 blur-[120px]" />
        </div>
    );
}

// Inline CSS hack since Tailwind doesn't support complex radial gradients with blur easily in one class
if (typeof document !== "undefined") {
    const styleId = "cyber-organic-glows";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
      .glow-teal {
        background: radial-gradient(circle, rgba(0, 242, 255, 0.3) 0%, transparent 70%);
        filter: blur(80px);
      }
      .glow-violet {
        background: radial-gradient(circle, rgba(157, 0, 255, 0.3) 0%, transparent 70%);
        filter: blur(100px);
      }
    `;
        document.head.appendChild(style);
    }
}
