"use client";

import React, { useEffect, useRef } from 'react';

export default function ParticleEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const prefersTouch =
            window.matchMedia("(pointer: coarse)").matches ||
            window.matchMedia("(hover: none)").matches;

        if (prefersTouch) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: any[] = [];
        const colors = ['#CCFF00', '#BC13FE', '#FFFFFF', '#00F3FF'];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            alpha: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                // Explode outwards
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 8 + 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.size = Math.random() * 4 + 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = 1;
            }

            draw() {
                if (!ctx) return;
                ctx.globalAlpha = this.alpha;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= 0.025; // Fade out
                this.size *= 0.95;    // Shrink
            }
        }

        const handleClick = (e: MouseEvent) => {
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(e.clientX, e.clientY));
            }
        };

        window.addEventListener('mousedown', handleClick);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles = particles.filter(p => p.alpha > 0.01 && p.size > 0.1);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousedown', handleClick);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999] hidden md:block"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
