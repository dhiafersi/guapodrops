"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, ShieldAlert, Key } from "lucide-react";
import Link from "next/link";
import KineticText from "@/components/KineticText";
import MagneticButton from "@/components/MagneticButton";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Invalid email or password.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="liquid-glass w-full max-w-md p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-teal/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-bio-violet/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="text-center mb-10 space-y-4">
                    <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Fingerprint className="w-8 h-8 text-neon-teal" />
                    </div>
                    <KineticText as="h1" className="text-3xl font-black uppercase tracking-tight">
                        Sign In
                    </KineticText>
                    <p className="font-mono text-[10px] text-chrome-dark uppercase tracking-[0.3em]">
                        Access your account
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-bio-violet/5 border border-bio-violet/20 rounded-2xl flex items-start gap-3">
                        <ShieldAlert className="w-4 h-4 text-bio-violet shrink-0 mt-0.5" />
                        <p className="font-mono text-[10px] text-bio-violet font-bold uppercase tracking-wider">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 text-left">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold">Email</label>
                        </div>
                        <div className="relative group">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal/20 transition-all placeholder:text-white/10"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold">Password</label>
                            <Key className="w-3 h-3 text-white/10" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal/20 transition-all placeholder:text-white/10"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-4">
                        <MagneticButton
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-neon-teal/20 transition-all disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </MagneticButton>
                    </div>
                </form>

                <div className="mt-8 flex items-center justify-between">
                    <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
                    <span className="text-xs text-center text-chrome-dark uppercase font-mono tracking-widest">or</span>
                    <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
                </div>

                <div className="mt-8">
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full relative flex items-center justify-center gap-3 py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-2xl transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-white/80">
                            Continue with Google
                        </span>
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-4">
                    <Link href="/auth/register" className="block font-mono text-[10px] text-chrome-dark hover:text-neon-teal uppercase tracking-widest transition-colors font-bold">
                        Don't have an account? [ <span className="text-white">SIGN UP</span> ]
                    </Link>
                    <Link href="/" className="block font-mono text-[9px] text-white/20 hover:text-white uppercase tracking-tighter transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
