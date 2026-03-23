"use client";

import { useState } from "react";
import { ShoppingCart, X, Trash2, PackageCheck, AlertTriangle, UserRound } from "lucide-react";
import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CartSidebar() {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");
    
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
    const [checkoutPhone, setCheckoutPhone] = useState("");
    const [checkoutLocation, setCheckoutLocation] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const { data } = useSWR("/api/cart", fetcher);
    const { data: session, update } = useSession();
    const cartItems = data?.items || [];



    const removeItem = async (id: string) => {
        await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
        mutate("/api/cart");
    };

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handlePlaceOrder = () => {
        const user = session?.user as any;
        setCheckoutPhone(user?.phone || "");
        setCheckoutLocation(user?.location || "");
        setShowConfirmPrompt(true);
    };

    const confirmAndPlaceOrder = async () => {
        const user = session?.user as any;
        if (!checkoutPhone || !checkoutLocation) {
            setMessage("Phone and location are required.");
            return;
        }

        // Only update profile if something changed or it was empty
        if (checkoutPhone !== user?.phone || checkoutLocation !== user?.location) {
            setIsUpdatingProfile(true);
            try {
                await fetch("/api/user/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user.name,
                        email: user.email,
                        phone: checkoutPhone,
                        location: checkoutLocation
                    }),
                });
                await update({ ...session, user: { ...user, phone: checkoutPhone, location: checkoutLocation } });
            } catch (err: any) {
                console.error("Failed to update profile", err);
            } finally {
                setIsUpdatingProfile(false);
            }
        }
        
        finalizeAcquisition();
    };

    const finalizeAcquisition = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/cart", { method: "PUT" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage("Order placed successfully.");
            mutate("/api/cart");
            setTimeout(() => {
                setMessage("");
                setIsOpen(false);
            }, 3000);
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const total = cartItems.reduce((acc: number, item: any) => acc + (item.fixedPrice * item.quantity), 0);

    if (isAuthPage) return null;

    return (
        <>
            {/* Floating Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="safe-bottom fixed bottom-4 right-4 z-50 rounded-full bg-electric-lime p-3 text-black shadow-[0_0_20px_#CCFF00] transition-transform hover:scale-110 group md:bottom-8 md:right-8 md:p-4"
            >
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                {cartItems.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-cyber-purple text-[10px] font-bold text-white">
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

            {/* Order Confirmation Modal */}
            {showConfirmPrompt && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowConfirmPrompt(false)} />
                    <div className="relative liquid-glass w-full max-w-sm p-6 md:p-8 rounded-[2rem] border border-electric-lime/40 space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-electric-lime/10 border border-electric-lime/30 rounded-2xl flex items-center justify-center mx-auto">
                            <PackageCheck className="w-6 h-6 md:w-7 md:h-7 text-electric-lime" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-display font-bold text-lg md:text-xl uppercase tracking-tight text-white mb-2">Confirm Your Details</h3>
                            <p className="font-mono text-[10px] md:text-[11px] text-chrome-dark uppercase tracking-wider leading-relaxed">
                                Verify your shipping information below. You can update it here if needed before placing the order.
                            </p>
                        </div>
                        
                        <div className="space-y-4 text-left">
                            <div className="space-y-1.5">
                                <label className="font-mono text-[9px] uppercase tracking-widest text-chrome-dark ml-1">Phone Number</label>
                                <input
                                    value={checkoutPhone}
                                    onChange={(e) => setCheckoutPhone(e.target.value)}
                                    placeholder="Your phone number"
                                    className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-3 focus:border-electric-lime outline-none transition-colors rounded-xl text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-mono text-[9px] uppercase tracking-widest text-chrome-dark ml-1">Location</label>
                                <input
                                    value={checkoutLocation}
                                    onChange={(e) => setCheckoutLocation(e.target.value)}
                                    placeholder="Your full address/location"
                                    className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-3 focus:border-electric-lime outline-none transition-colors rounded-xl text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                onClick={confirmAndPlaceOrder}
                                disabled={loading || isUpdatingProfile || !checkoutPhone || !checkoutLocation}
                                className="flex items-center justify-center gap-2 w-full py-3 md:py-4 bg-electric-lime text-black font-black text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-[#bbf000] disabled:opacity-50 transition-colors"
                            >
                                {(loading || isUpdatingProfile) ? "Processing..." : "Confirm & Place Order"}
                            </button>
                            <button
                                onClick={() => setShowConfirmPrompt(false)}
                                disabled={loading || isUpdatingProfile}
                                className="font-mono text-[9px] md:text-[10px] text-chrome-dark uppercase tracking-widest hover:text-white transition-colors py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className={`safe-bottom fixed top-0 right-0 z-[101] h-full w-full transform border-l border-chrome-dark/30 bg-zinc-950 transition-transform duration-500 ease-cyber md:max-w-md ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex h-full flex-col p-4 md:p-6">
                    <div className="mb-6 flex items-center justify-between border-b border-chrome-dark/30 pb-4 md:mb-8">
                        <h2 className="flex items-center gap-3 text-xl font-display font-bold uppercase text-white md:text-2xl">
                            <ShoppingCart className="text-electric-lime" /> Your Cart
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="text-chrome-dark hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="custom-scrollbar flex-grow space-y-3 overflow-y-auto pr-1 md:space-y-4 md:pr-2">
                        {cartItems.length === 0 ? (
                            <div className="py-16 text-center opacity-30 md:py-20">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
                                <p className="font-mono text-xs uppercase tracking-widest">Your cart is empty.</p>
                            </div>
                        ) : (
                            cartItems.map((item: any) => (
                                <div key={item.id} className="glass-panel relative flex gap-3 border border-chrome-dark/20 p-3 group md:gap-4 md:p-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-chrome-dark/30 bg-black/60 p-2 md:h-20 md:w-20">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-screen" />
                                    </div>
                                    <div className="min-w-0 flex-grow pr-6">
                                        <h4 className="mb-1 line-clamp-2 text-sm font-bold uppercase text-white">{item.name}</h4>
                                        <p className="text-electric-lime font-mono text-sm">{item.fixedPrice} TND</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-mono text-chrome-dark">Quantity: {item.quantity}</span>
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

                    <div className="mt-auto space-y-4 border-t border-chrome-dark/30 pt-5 md:pt-6">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-mono text-chrome-dark uppercase">Total</span>
                            <span className="text-2xl font-display font-bold text-white md:text-3xl">{total} <span className="text-sm">TND</span></span>
                        </div>
                        {message && (
                            <div className={`p-3 text-[10px] font-mono border ${message.toLowerCase().includes("success") || message.toLowerCase().includes("placed") ? "border-electric-lime text-electric-lime" : "border-red-500 text-red-500"} bg-black/50 text-center uppercase tracking-tighter`}>
                                {message}
                            </div>
                        )}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={cartItems.length === 0 || loading}
                            className="flex w-full items-center justify-center gap-3 bg-electric-lime py-4 font-display font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_15px_#CCFF00] transition-all hover:bg-[#bbf000] disabled:grayscale disabled:opacity-30"
                        >
                            <PackageCheck className="w-5 h-5 flex-shrink-0" />
                            {loading ? "Placing order..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
