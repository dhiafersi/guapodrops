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
        <div className="group relative space-y-6 overflow-hidden rounded-[2rem] border border-white/5 p-5 liquid-glass md:space-y-8 md:rounded-[2.5rem] md:p-8">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[60px] rounded-full pointer-events-none" style={{ backgroundColor: accentHex }} />

            <div className="flex flex-col gap-5 border-b border-white/5 pb-6 md:flex-row md:items-end md:justify-between md:gap-6 md:pb-8">
                <div className="space-y-2">
                    <p className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold`} style={{ color: accentHex }}>
                        {isBidding ? 'Current Bid' : 'Price'}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tighter text-white md:text-5xl">
                            {currentPrice}
                        </span>
                        <span className="font-mono text-xs text-chrome-dark font-bold uppercase tracking-widest">TND</span>
                    </div>
                </div>

                {isBidding ? (
                    <div className="flex flex-col gap-1 md:items-end">
                        <div className="flex items-center gap-2 text-bio-violet">
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Total Bids</span>
                        </div>
                        <p className="text-2xl font-black text-white">{liveData?.totalBids || 0} <span className="text-[10px] text-chrome-dark uppercase font-mono">Bids</span></p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 md:items-end">
                        <div className={`flex items-center gap-2 ${product.isSurCommande ? 'text-white' : 'text-neon-teal'}`}>
                            {product.isSurCommande ? (
                                <ShoppingCart className="w-3 h-3" />
                            ) : (
                                <Zap className="w-3 h-3" />
                            )}
                            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
                                {product.isSurCommande ? 'On Order' : 'In Stock'}
                            </span>
                        </div>
                        <p className="text-2xl font-black text-white">
                            {product.isSurCommande ? 'AVAILABLE' : `${product.stockQty}`}
                            {!product.isSurCommande && <span className="text-[10px] text-chrome-dark uppercase font-mono ml-1">Available</span>}
                        </p>
                    </div>
                )}
            </div>

            {isBidding && (
                <div className={`flex items-center gap-3 rounded-2xl border p-4 ${isEnded ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-bio-violet/5 border-bio-violet/20 text-bio-violet'}`}>
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
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 font-mono text-lg transition-all placeholder:text-white/10 focus:border-bio-violet focus:outline-none focus:ring-1 focus:ring-bio-violet/20 md:text-xl"
                            placeholder={`Enter ${currentPrice + (product.minIncrement || 1)}+`}
                            step="any"
                        />
                    </div>
                )}

                <MagneticButton
                    onClick={(e: any) => handleAction(e)}
                    disabled={isEnded || loading || (!isBidding && !product.isSurCommande && product.stockQty <= 0)}
                    className={`w-full rounded-2xl py-4 font-black text-[10px] uppercase tracking-[0.28em] transition-all md:py-5 md:text-xs md:tracking-[0.3em] ${isBidding
                        ? 'bg-bio-violet text-white hover:brightness-110'
                        : 'bg-neon-teal text-black hover:brightness-110'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                    {loading ? "Processing..." :
                        isBidding ? (isEnded ? "Auction Ended" : "Place Bid") :
                            (product.stockQty <= 0 && !product.isSurCommande ? "Out of Stock" : "Add to Cart")}
                </MagneticButton>
            </form>
        </div>
    );
}
