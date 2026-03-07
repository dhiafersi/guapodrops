"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PackageOpen, Clock, Gamepad2, UserRound, Save } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface BidActivity {
    id: string;
    amount: number;
    endTime: string;
    productName: string;
}

interface OrderActivity {
    id: string;
    quantity: number;
    totalAmount: number;
    status: string;
    productName: string;
}

interface ProfileForm {
    name: string;
    email: string;
    phone: string;
    location: string;
}

export default function UserDashboardPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [bids, setBids] = useState<BidActivity[]>([]);
    const [orders, setOrders] = useState<OrderActivity[]>([]);
    const [profile, setProfile] = useState<ProfileForm>({
        name: "",
        email: "",
        phone: "",
        location: "",
    });
    const [profileMessage, setProfileMessage] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }

        if (!session?.user) {
            return;
        }

        setProfile({
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            phone: session.user.phone ?? "",
            location: session.user.location ?? "",
        });

        void fetchUserActivity();
    }, [session, status, router]);

    const fetchUserActivity = async () => {
        try {
            const res = await fetch("/api/user/activity");
            if (!res.ok) {
                return;
            }

            const data = await res.json();
            setBids(data.bids || []);
            setOrders(data.orders || []);
        } catch {
        }
    };

    const handleProfileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setProfile((current) => ({ ...current, [name]: value }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMessage("");

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Profile update failed");
            }

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone ?? "",
                    location: data.user.location ?? "",
                },
            });

            setProfile({
                name: data.user.name,
                email: data.user.email,
                phone: data.user.phone ?? "",
                location: data.user.location ?? "",
            });
            setProfileMessage("PROFILE_UPDATED");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Profile update failed";
            setProfileMessage(`ERROR: ${message}`);
        } finally {
            setSavingProfile(false);
        }
    };

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center font-display text-electric-lime animate-pulse">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center border-b border-cyber-purple/30 pb-4">
                <div>
                    <h1 className="text-3xl font-display font-bold uppercase text-white shadow-cyber-purple drop-shadow-md">
                        My <span className="text-electric-lime text-glow-lime">Dashboard</span>
                    </h1>
                    <p className="text-chrome-dark font-mono text-sm uppercase mt-1">
                        Welcome back, {session.user.name}
                    </p>
                </div>
                <Link href="/drops" className="btn-glitch py-2 px-4 text-xs">
                    JOIN DROP
                </Link>
            </header>

            <div className="glass-panel p-6 border border-white/10">
                <div className="flex items-center gap-2 border-b border-chrome-dark/30 pb-3 mb-6">
                    <UserRound className="w-5 h-5 text-neon-teal" />
                    <h2 className="text-xl font-display font-bold uppercase text-white">
                        Profile Settings
                    </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            required
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            placeholder="Full Name"
                            className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-3 focus:border-electric-lime outline-none"
                        />
                        <input
                            required
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleProfileChange}
                            placeholder="Email"
                            className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-3 focus:border-electric-lime outline-none"
                        />
                        <input
                            required
                            name="phone"
                            value={profile.phone}
                            onChange={handleProfileChange}
                            placeholder="Phone Number"
                            className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-3 focus:border-electric-lime outline-none"
                        />
                        <input
                            required
                            name="location"
                            value={profile.location}
                            onChange={handleProfileChange}
                            placeholder="Location"
                            className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-3 focus:border-electric-lime outline-none"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-chrome-dark">
                            Update your account identity and contact details.
                        </p>
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="inline-flex items-center gap-2 border border-electric-lime bg-electric-lime/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-electric-lime disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {savingProfile ? "Saving..." : "Save Profile"}
                        </button>
                    </div>

                    {profileMessage && (
                        <p className={`font-mono text-[10px] uppercase tracking-widest ${profileMessage.startsWith("ERROR") ? "text-red-400" : "text-electric-lime"}`}>
                            {profileMessage}
                        </p>
                    )}
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6 border border-cyber-purple/50">
                    <h2 className="text-xl font-display font-bold text-cyber-purple uppercase mb-6 flex items-center gap-2 border-b border-chrome-dark/30 pb-2">
                        <Clock className="w-5 h-5 text-cyber-purple" /> Active Bids
                    </h2>

                    {bids.length === 0 ? (
                        <div className="text-center py-8">
                            <Gamepad2 className="w-8 h-8 text-chrome-dark mx-auto mb-2 opacity-50" />
                            <p className="text-chrome-dark font-mono text-sm">
                                You have no active bids at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bids.map((bid) => (
                                <div key={bid.id} className="bg-black/50 border border-cyber-purple/30 p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white uppercase text-sm mb-1">
                                            {bid.productName}
                                        </h3>
                                        <p className="font-mono text-xs text-chrome-dark">
                                            Ends: {new Date(bid.endTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display font-bold text-cyber-purple text-lg">
                                            {bid.amount} TND
                                        </p>
                                        <p className="font-mono text-[10px] text-electric-lime uppercase">
                                            Your Bid
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                            {orders.map((order) => (
                                <div key={order.id} className="bg-black/50 border border-electric-lime/30 p-4 flex justify-between items-center hover:border-white transition-colors">
                                    <div>
                                        <h3 className="font-bold text-white uppercase text-sm mb-1">
                                            {order.productName}
                                        </h3>
                                        <p className="font-mono text-xs max-w-[150px] truncate text-chrome-dark">
                                            Order #{order.id}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display font-bold text-white text-lg">
                                            {order.totalAmount} TND
                                        </p>
                                        <p className="font-mono text-[10px] text-chrome-dark uppercase">
                                            {order.status} • {order.quantity} UNIT(S)
                                        </p>
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
