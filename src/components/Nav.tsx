"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User as UserIcon, Zap } from "lucide-react";
import KineticText from "./KineticText";

export default function Nav() {
    const { data: session, status } = useSession();

    return (
        <nav className="fixed top-0 w-full z-40 bg-organic-charcoal/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
                <Zap className="w-5 h-5 text-neon-teal group-hover:animate-pulse" />
                <KineticText className="text-xl font-black tracking-tighter uppercase">
                    GUAPO <span className="text-neon-teal">DROPS</span>
                </KineticText>
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/drops" className="font-mono text-xs tracking-[0.2em] text-chrome-light hover:text-neon-teal transition-colors uppercase">
                    Live Drops
                </Link>

                {status === "loading" ? (
                    <div className="w-20 h-6 bg-white/5 animate-pulse rounded"></div>
                ) : session ? (
                    <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                        <Link
                            href={session.user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
                            className="flex items-center gap-2 font-mono text-xs tracking-wider text-neon-teal hover:text-white transition-colors"
                        >
                            <UserIcon className="w-4 h-4" />
                            <span>{session.user?.name || 'OPERATOR'}</span>
                            {session.user?.role === "ADMIN" && (
                                <span className="bg-bio-violet text-white text-[9px] px-1.5 py-0.5 rounded-sm ml-1 font-black">ADMIN</span>
                            )}
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="text-chrome-dark hover:text-bio-violet transition-colors"
                            title="Disconnect"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                        <Link href="/auth/login" className="font-mono text-xs tracking-widest uppercase text-chrome-light hover:text-neon-teal transition-colors">
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
