"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, User as UserIcon, X, Zap } from "lucide-react";
import { useState } from "react";

export default function Nav() {
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const dashboardHref =
        session?.user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

    return (
        <nav className="safe-top fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0d0d0fcc]/90 px-4 py-3 backdrop-blur-xl md:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-teal/30 bg-neon-teal/10 shadow-[0_0_24px_rgba(0,242,255,0.18)]">
                        <Zap className="h-5 w-5 text-neon-teal" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-display text-base font-black uppercase tracking-[0.18em] text-white md:text-lg">
                            Guapo Drops
                        </p>
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
                            Mobile-first registry
                        </p>
                    </div>
                </Link>

                <div className="hidden items-center gap-6 md:flex">
                    <Link href="/drops" className="font-mono text-xs uppercase tracking-[0.24em] text-chrome-light transition-colors hover:text-neon-teal">
                        Live Drops
                    </Link>

                    {status === "loading" ? (
                        <div className="h-10 w-28 animate-pulse rounded-2xl bg-white/5" />
                    ) : session ? (
                        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                            <Link
                                href={dashboardHref}
                                className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-neon-teal"
                            >
                                <UserIcon className="h-4 w-4" />
                                <span className="max-w-[12rem] truncate">{session.user?.name || "Operator"}</span>
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="text-chrome-dark transition-colors hover:text-bio-violet"
                                title="Disconnect"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="rounded-full border border-neon-teal/30 bg-neon-teal/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-neon-teal transition-colors hover:bg-neon-teal hover:text-black"
                        >
                            Login
                        </Link>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setIsMenuOpen((current) => !current)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white md:hidden"
                    aria-label="Toggle navigation menu"
                >
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {isMenuOpen && (
                <div className="mx-auto mt-3 max-w-7xl rounded-[2rem] border border-white/10 bg-black/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:hidden">
                    <div className="space-y-2">
                        <Link
                            href="/drops"
                            onClick={() => setIsMenuOpen(false)}
                            className="block rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-white/80"
                        >
                            Live Drops
                        </Link>

                        {session ? (
                            <>
                                <Link
                                    href={dashboardHref}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block rounded-2xl border border-neon-teal/20 bg-neon-teal/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-neon-teal"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="block w-full rounded-2xl border border-bio-violet/20 bg-bio-violet/10 px-4 py-3 text-left font-mono text-xs uppercase tracking-[0.22em] text-bio-violet"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="block rounded-2xl border border-neon-teal/20 bg-neon-teal/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-neon-teal"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
