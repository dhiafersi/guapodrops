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
                setError("ACCESS_DENIED :: CREDENTIALS_INVALID");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            setError("SYSTEM_FAILURE :: AUTH_MODULE_OFFLINE");
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
                        AUTHENTICATE
                    </KineticText>
                    <p className="font-mono text-[10px] text-chrome-dark uppercase tracking-[0.3em]">
                        Waiting for registry keys...
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
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold">Registry Identifier</label>
                        </div>
                        <div className="relative group">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal/20 transition-all placeholder:text-white/10"
                                placeholder="operator@guapo.drop"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold">Decryption Key</label>
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
                            {loading ? "INITIALIZING..." : "INITIALIZE_LINK"}
                        </MagneticButton>
                    </div>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-4">
                    <Link href="/auth/register" className="block font-mono text-[10px] text-chrome-dark hover:text-neon-teal uppercase tracking-widest transition-colors font-bold">
                        New Operator? [ <span className="text-white">ENROLL</span> ]
                    </Link>
                    <Link href="/" className="block font-mono text-[9px] text-white/20 hover:text-white uppercase tracking-tighter transition-colors">
                        &larr; Return to Base Grid
                    </Link>
                </div>
            </div>
        </div>
    );
}
