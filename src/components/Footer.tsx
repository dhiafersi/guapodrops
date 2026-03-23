import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-[#0d0d0fcc]/90 py-8 backdrop-blur-xl mt-auto relative z-40">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
                <div className="flex flex-col items-center gap-2 md:items-start text-center md:text-left">
                    <p className="font-display text-lg font-black uppercase tracking-[0.18em] text-white">
                        GUAPO DROPS
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-chrome-dark">
                        © {new Date().getFullYear()} GUAPO DROPS. All rights reserved.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <a
                        href="https://www.facebook.com/guapodrops"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-chrome-dark transition-colors hover:border-[#1877F2] hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
                        title="Facebook"
                    >
                        <Facebook className="h-5 w-5" />
                    </a>
                    <a
                        href="https://www.tiktok.com/@guapodrops"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-chrome-dark transition-colors hover:border-[#ff0050] hover:bg-[#ff0050]/10 hover:text-white"
                        title="TikTok"
                    >
                        {/* Custom TikTok SVG since standard icon packs sometimes miss it */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                        >
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                    </a>
                    <a
                        href="https://www.instagram.com/guapodrops"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-chrome-dark transition-colors hover:border-[#E1306C] hover:bg-[#E1306C]/10 hover:text-[#E1306C]"
                        title="Instagram"
                    >
                        <Instagram className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
