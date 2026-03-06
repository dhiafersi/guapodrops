"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, TrendingUp, ShoppingCart, Zap, AlertCircle } from "lucide-react";
import useSWR, { mutate } from 'swr';
import MagneticButton from "@/components/MagneticButton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BiddingInterface({ product }: { product: any }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [bidAmount, setBidAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Poll for the latest product/bid data every 3 seconds
    const { data: liveData, error } = useSWR(`/api/drops/${product.id}/status`, fetcher, {
        refreshInterval: 3000,
        fallbackData: { highestBid: product.startPrice, totalBids: 0 }
    });

    const isBidding = product.mode === 'BIDDING';
    const accentColor = isBidding ? 'bio-violet' : 'neon-teal';
    const accentHex = isBidding ? '#bc00ff' : '#00f2ff';

    const currentPrice = isBidding ? (liveData?.highestBid || product.startPrice) : product.fixedPrice;

    // Check if auction ended
    const isEnded = isBidding && new Date() > new Date(product.endTime);

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            router.push("/auth/login");
            return;
        }

        setLoading(true);
        setMessage("");

        if (isBidding) {
            const numBid = parseFloat(bidAmount);
            if (isNaN(numBid) || numBid < (currentPrice + (product.minIncrement || 1))) {
                setMessage(`Your bid must be at least ${currentPrice + (product.minIncrement || 1)} TND`);
                setLoading(false);
                return;
            }
        }

        try {
            const endpoint = isBidding ? '/api/drops/bid' : '/api/cart';
            const payload = isBidding ?
                { productId: product.id, amount: parseFloat(bidAmount) } :
                { productId: product.id, quantity: 1 };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Transaction failed");

            setMessage(isBidding ? "Bid placed successfully!" : "Item added to your cart!");
            if (isBidding) setBidAmount("");
            if (!isBidding) mutate("/api/cart");

        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="liquid-glass p-8 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden group">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[60px] rounded-full pointer-events-none" style={{ backgroundColor: accentHex }} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-white/5">
                <div className="space-y-2">
                    <p className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold`} style={{ color: accentHex }}>
                        {isBidding ? 'Current Bid' : 'Price'}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white tracking-tighter">
                            {currentPrice}
                        </span>
                        <span className="font-mono text-xs text-chrome-dark font-bold uppercase tracking-widest">TND</span>
                    </div>
                </div>

                {isBidding ? (
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-bio-violet">
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Total Bids</span>
                        </div>
                        <p className="text-2xl font-black text-white">{liveData?.totalBids || 0} <span className="text-[10px] text-chrome-dark uppercase font-mono">Bids</span></p>
                    </div>
                ) : (
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-neon-teal">
                            <Zap className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">In Stock</span>
                        </div>
                        <p className="text-2xl font-black text-white">{product.stockQty} <span className="text-[10px] text-chrome-dark uppercase font-mono">Available</span></p>
                    </div>
                )}
            </div>

            {isBidding && (
                <div className={`p-4 rounded-2xl border ${isEnded ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-bio-violet/5 border-bio-violet/20 text-bio-violet'} flex items-center gap-4`}>
                    <Clock className={`w-5 h-5 ${!isEnded && 'animate-pulse'}`} />
                    <div className="space-y-0.5">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60 font-bold">Auction Ends</p>
                        <p className="font-mono text-xs font-bold uppercase tracking-tight">
                            {isEnded ? "Auction Ended" : `${new Date(product.endTime).toLocaleString()}`}
                        </p>
                    </div>
                </div>
            )}

            {message && (
                <div className={`p-4 rounded-2xl font-mono text-[10px] uppercase tracking-wider font-bold border ${message.startsWith("Bid placed") || message.startsWith("Item added") ? 'bg-neon-teal/5 border-neon-teal/20 text-neon-teal' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleAction} className="space-y-6">
                {isBidding && !isEnded && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome-dark font-bold">Your Bid Amount</label>
                            <span className="font-mono text-[9px] text-bio-violet uppercase font-bold tracking-tighter">Min Step: +{product.minIncrement || 1}</span>
                        </div>
                        <input
                            type="number"
                            disabled={loading}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-xl focus:outline-none focus:border-bio-violet focus:ring-1 focus:ring-bio-violet/20 transition-all placeholder:text-white/10"
                            placeholder={`Enter ${currentPrice + (product.minIncrement || 1)}+`}
                            step="any"
                        />
                    </div>
                )}

                <MagneticButton
                    onClick={(e: any) => handleAction(e)}
                    disabled={isEnded || loading || (!isBidding && product.stockQty <= 0)}
                    className={`w-full py-5 font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all ${isBidding
                        ? 'bg-bio-violet text-white hover:brightness-110'
                        : 'bg-neon-teal text-black hover:brightness-110'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                    {loading ? "Processing..." :
                        isBidding ? (isEnded ? "Auction Ended" : "Place Bid") :
                            (product.stockQty <= 0 ? "Out of Stock" : "Add to Cart")}
                </MagneticButton>
            </form>
        </div>
    );
}
