"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X, Trash2, PackageCheck } from "lucide-react";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CartSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { data } = useSWR("/api/cart", fetcher);
    const cartItems = data?.items || [];

    const removeItem = async (id: string) => {
        await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
        mutate("/api/cart");
    };

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const finalizeAcquisition = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/cart", { method: "PUT" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage("SUCCESS: Acquisition sequence complete.");
            mutate("/api/cart");
            setTimeout(() => {
                setMessage("");
                setIsOpen(false);
            }, 3000);
        } catch (err: any) {
            setMessage(`ERROR: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const total = cartItems.reduce((acc: number, item: any) => acc + (item.fixedPrice * item.quantity), 0);

    return (
        <>
            {/* Floating Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-50 bg-electric-lime text-black p-4 rounded-full shadow-[0_0_20px_#CCFF00] hover:scale-110 transition-transform group"
            >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cyber-purple text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black font-bold">
                        {cartItems.length}
                    </span>
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-chrome-dark/30 z-[101] transform transition-transform duration-500 ease-cyber ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8 border-b border-chrome-dark/30 pb-4">
                        <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-3">
                            <ShoppingCart className="text-electric-lime" /> Access_Cart
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="text-chrome-dark hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
                                <p className="font-mono text-xs uppercase tracking-widest">Cart_Empty : Request_Assets</p>
                            </div>
                        ) : (
                            cartItems.map((item: any) => (
                                <div key={item.id} className="glass-panel p-4 flex gap-4 border border-chrome-dark/20 relative group">
                                    <div className="w-20 h-20 bg-black/60 border border-chrome-dark/30 p-2 flex items-center justify-center shrink-0">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-screen" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-white font-bold uppercase text-sm mb-1">{item.name}</h4>
                                        <p className="text-electric-lime font-mono text-sm">{item.fixedPrice} TND</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-mono text-chrome-dark">QTY: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-2 right-2 text-chrome-dark hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-chrome-dark/30 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-mono text-chrome-dark uppercase">Total_Allocation</span>
                            <span className="text-3xl font-display font-bold text-white">{total} <span className="text-sm">TND</span></span>
                        </div>
                        {message && (
                            <div className={`p-3 text-[10px] font-mono border ${message.startsWith("ERROR") ? "border-red-500 text-red-500" : "border-electric-lime text-electric-lime"} bg-black/50 text-center uppercase tracking-tighter`}>
                                {message}
                            </div>
                        )}
                        <button
                            onClick={finalizeAcquisition}
                            disabled={cartItems.length === 0 || loading}
                            className="w-full bg-electric-lime text-black font-display font-bold py-4 uppercase tracking-widest hover:bg-[#bbf000] shadow-[0_0_15px_#CCFF00] disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3"
                        >
                            <PackageCheck className="w-5 h-5 flex-shrink-0" />
                            {loading ? "INITIALIZING_TX..." : "Finalize_Acquisition"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
