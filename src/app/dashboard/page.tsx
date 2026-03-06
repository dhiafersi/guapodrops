"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PackageOpen, Clock, Gamepad2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bids, setBids] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (session) {
            fetchUserActivity();
        }
    }, [session, status, router]);

    const fetchUserActivity = async () => {
        try {
            const res = await fetch("/api/user/activity");
            if (res.ok) {
                const data = await res.json();
                setBids(data.bids || []);
                setOrders(data.orders || []);
            }
        } catch (e) { }
    };

    if (status === "loading" || !session) return <div className="min-h-screen flex items-center justify-center font-display text-electric-lime animate-pulse">Loading...</div>;

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center border-b border-cyber-purple/30 pb-4">
                <div>
                    <h1 className="text-3xl font-display font-bold uppercase text-white shadow-cyber-purple drop-shadow-md">
                        My <span className="text-electric-lime text-glow-lime">Dashboard</span>
                    </h1>
                    <p className="text-chrome-dark font-mono text-sm uppercase mt-1">Welcome back, {session.user.name}</p>
                </div>
                <Link href="/drops" className="btn-glitch py-2 px-4 text-xs">
                    JOIN DROP
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Active Bids */}
                <div className="glass-panel p-6 border border-cyber-purple/50">
                    <h2 className="text-xl font-display font-bold text-cyber-purple uppercase mb-6 flex items-center gap-2 border-b border-chrome-dark/30 pb-2">
                        <Clock className="w-5 h-5 text-cyber-purple" /> Active Bids
                    </h2>

                    {bids.length === 0 ? (
                        <div className="text-center py-8">
                            <Gamepad2 className="w-8 h-8 text-chrome-dark mx-auto mb-2 opacity-50" />
                            <p className="text-chrome-dark font-mono text-sm">You have no active bids at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bids.map((b) => (
                                <div key={b.id} className="bg-black/50 border border-cyber-purple/30 p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white uppercase text-sm mb-1">{b.productName}</h3>
                                        <p className="font-mono text-xs text-chrome-dark">Ends: {new Date(b.endTime).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display font-bold text-cyber-purple text-lg">{b.amount} TND</p>
                                        <p className="font-mono text-[10px] text-electric-lime uppercase">Your Bid</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Orders & Inventory */}
                <div className="glass-panel p-6 border border-electric-lime/50">
                    <h2 className="text-xl font-display font-bold text-electric-lime uppercase mb-6 flex items-center gap-2 border-b border-chrome-dark/30 pb-2">
                        <PackageOpen className="w-5 h-5 text-electric-lime" /> My Orders
                    </h2>

                    {orders.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-chrome-dark font-mono text-sm">Inventory is empty.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((o) => (
                                <div key={o.id} className="bg-black/50 border border-electric-lime/30 p-4 flex justify-between items-center hover:border-white transition-colors">
                                    <div>
                                        <h3 className="font-bold text-white uppercase text-sm mb-1">{o.productName}</h3>
                                        <p className="font-mono text-xs max-w-[150px] truncate text-chrome-dark">Order #{o.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display font-bold text-white text-lg">{o.totalPrice} TND</p>
                                        <p className="font-mono text-[10px] text-chrome-dark uppercase">{o.status} • {o.quantity} UNIT(S)</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
