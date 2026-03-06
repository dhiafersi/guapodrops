"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface KineticTextProps {
    children: React.ReactNode;
    className?: string;
    as?: "h1" | "h2" | "h3" | "p";
}

export default function KineticText({
    children,
    className = "",
    as = "h2",
}: KineticTextProps) {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // Transform scroll progress to font weight (e.g., 400 to 900)
    const fontWeight = useTransform(scrollYProgress, [0, 0.5, 1], [400, 900, 400]);
    const letterSpacing = useTransform(scrollYProgress, [0, 0.5, 1], ["0.1em", "-0.05em", "0.1em"]);

    const Component = motion[as];

    return (
        <Component
            ref={containerRef as any}
            style={{ fontWeight, letterSpacing }}
            className={`font-display uppercase ${className}`}
        >
            {children}
        </Component>
    );
}
