"use client";

import React from 'react';

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
            {/* Perspective Grid Layer */}
            <div
                className="absolute inset-x-0 bottom-0 h-[70vh] opacity-20"
                style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                }}
            >
                <div
                    className="absolute inset-0 origin-bottom"
                    style={{
                        transform: 'rotateX(60deg)',
                        background: `
                            linear-gradient(to right, #BC00FF 1px, transparent 1px),
                            linear-gradient(to bottom, #BC00FF 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        animation: 'grid-scroll 20s linear infinite'
                    }}
                />
            </div>

            {/* Glowing Nebula/Clouds */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyber-purple/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-electric-lime/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Moving Data Streams (Lines) */}
            <div className="absolute inset-0 opacity-10">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-gradient-to-r from-transparent via-electric-lime to-transparent h-[1px] w-full"
                        style={{
                            top: `${20 * i}%`,
                            left: '-100%',
                            animation: `data-flow ${10 + i * 2}s linear infinite`,
                            animationDelay: `${i * 3}s`
                        }}
                    />
                ))}
            </div>

            <style jsx global>{`
                @keyframes grid-scroll {
                    from { background-position: 0 0; }
                    to { background-position: 0 400px; }
                }
                @keyframes data-flow {
                    from { transform: translateX(0); }
                    to { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
}
