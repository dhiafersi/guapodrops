"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e?: any) => void;
    disabled?: boolean;
    threshold?: number;
    type?: "button" | "submit" | "reset";
}

export default function MagneticButton({
    children,
    className = "",
    onClick,
    disabled = false,
    threshold = 20,
    type = "button",
}: MagneticButtonProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const { clientX, clientY } = e;
        const { width, height, left, top } = ref.current.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < width / 2 + threshold) {
            // Magnetic pull
            setPosition({ x: distanceX * 0.4, y: distanceY * 0.4 });
        } else {
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div
            ref={ref}
            className={`relative ${className.includes('w-full') ? 'block w-full' : 'inline-block'}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.button
                type={type}
                animate={{ x: position.x, y: position.y }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
                className={`relative z-10 ${className}`}
                onClick={disabled ? undefined : onClick}
                disabled={disabled}
            >
                {children}
            </motion.button>
        </div>
    );
}
