"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ShieldAlert, Globe, Phone, Mail, User } from "lucide-react";
import Link from "next/link";
import KineticText from "@/components/KineticText";
import MagneticButton from "@/components/MagneticButton";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone, location }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Could not create your account.");
            } else {
                const loginResult = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (loginResult?.error) {
                    router.push("/auth/login?registered=true");
                } else {
                    router.push("/");
                    router.refresh();
                }
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="liquid-glass w-full max-w-lg p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-bio-violet/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-neon-teal/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="text-center mb-10 space-y-4">
                    <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <UserPlus className="w-8 h-8 text-bio-violet" />
                    </div>
                    <KineticText as="h1" className="text-3xl font-black uppercase tracking-tight">
                        Create <span className="text-bio-violet">Account</span>
                    </KineticText>
                    <p className="font-mono text-[10px] text-chrome-dark uppercase tracking-[0.3em]">
                        Sign up to start shopping
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-bio-violet/5 border border-bio-violet/20 rounded-2xl flex items-start gap-3">
                        <ShieldAlert className="w-4 h-4 text-bio-violet shrink-0 mt-0.5" />
                        <p className="font-mono text-[10px] text-bio-violet font-bold uppercase tracking-wider">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold ml-1 flex items-center gap-2">
                                <User className="w-2.5 h-2.5" /> Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-bio-violet transition-all"
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold ml-1 flex items-center gap-2">
                                <Mail className="w-2.5 h-2.5" /> Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-bio-violet transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold ml-1 flex items-center gap-2">
                                <Phone className="w-2.5 h-2.5" /> Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-bio-violet transition-all"
                                placeholder="+216 -- --- ---"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold ml-1 flex items-center gap-2">
                                <Globe className="w-2.5 h-2.5" /> Location
                            </label>
                            <input
                                type="text"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-bio-violet transition-all"
                                placeholder="e.g. Tunis"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-bio-violet transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-6">
                        <MagneticButton
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-bio-violet text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(188,0,255,0.2)] disabled:opacity-50 transition-all"
                        >
                            {loading ? "Creating account..." : "Create Account"}
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
                            Sign up with Google
                        </span>
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-4">
                    <Link href="/auth/login" className="block font-mono text-[10px] text-chrome-dark hover:text-bio-violet uppercase tracking-widest transition-colors font-bold">
                        Already have an account? [ <span className="text-white">SIGN IN</span> ]
                    </Link>
                    <Link href="/" className="block font-mono text-[9px] text-white/20 hover:text-white uppercase tracking-tighter transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
