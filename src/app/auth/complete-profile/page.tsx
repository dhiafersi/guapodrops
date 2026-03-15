"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Phone, ShieldAlert, UserCheck } from "lucide-react";
import KineticText from "@/components/KineticText";
import MagneticButton from "@/components/MagneticButton";

export default function CompleteProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // If user already has phone + location, skip this page
    useEffect(() => {
        const user = session?.user as any;
        if (user?.phone && user?.location) {
            router.replace("/dashboard");
        }
    }, [session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/complete-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, location }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Could not update profile.");
            } else {
                // Refresh the session so new phone/location show up in token
                await update({ user: { phone, location } });
                router.push("/dashboard");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="liquid-glass w-full max-w-md p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-teal/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-bio-violet/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="text-center mb-10 space-y-4">
                    <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <UserCheck className="w-8 h-8 text-neon-teal" />
                    </div>
                    <KineticText as="h1" className="text-3xl font-black uppercase tracking-tight">
                        Complete <span className="text-neon-teal">Profile</span>
                    </KineticText>
                    <p className="font-mono text-[10px] text-chrome-dark uppercase tracking-[0.3em]">
                        Just a couple more details
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-bio-violet/5 border border-bio-violet/20 rounded-2xl flex items-start gap-3">
                        <ShieldAlert className="w-4 h-4 text-bio-violet shrink-0 mt-0.5" />
                        <p className="font-mono text-[10px] text-bio-violet font-bold uppercase tracking-wider">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-3">
                        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold ml-1 flex items-center gap-2">
                            <Phone className="w-2.5 h-2.5" /> Phone Number
                        </label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal/20 transition-all placeholder:text-white/10"
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
                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal/20 transition-all placeholder:text-white/10"
                            placeholder="e.g. Tunis"
                        />
                    </div>

                    <div className="pt-4">
                        <MagneticButton
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-neon-teal/20 transition-all disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Complete Profile"}
                        </MagneticButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
