"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, Gavel, Trash2, ShoppingBag, Phone, MapPin, CheckCircle, Clock, Truck, XCircle, Edit, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
import MultiImageUploader from "@/components/MultiImageUploader";

// Admin Dashboard - V4 (Full Product Management & Orders)
export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"PRODUCTS" | "ORDERS">("PRODUCTS");
    const [stats, setStats] = useState({ bids: 0, products: 0 });
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        imageUrl: "",
        description: "",
        secondaryImages: "",
        featuredRank: "",
        mode: "BIDDING" as "BIDDING" | "STOCK",
        startPrice: "",
        endHours: "24",
        minIncrement: "5",
        fixedPrice: "",
        stockQty: "",
        isSurCommande: false,
        isFeatured: false,
    });

    // Basic authorization redirect & dummy initial fetch
    useEffect(() => {
        if (status === "unauthenticated" || (session && (session.user as any).role !== "ADMIN")) {
            router.push("/");
        } else if (session?.user && (session.user as any).role === "ADMIN") {
            fetchProducts();
            fetchStats();
            fetchOrders();
        }
    }, [session, status, router]);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (e) { }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/admin/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (e) { }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data || { bids: 0, products: 0 });
            }
        } catch (e) { }
    };

    const updateOrderStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch("/api/admin/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus })
            });
            if (res.ok) fetchOrders();
        } catch (e) { }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleModeChange = (mode: "BIDDING" | "STOCK") => {
        setFormData({ ...formData, mode });
    };

    const handleEdit = (product: any) => {
        setIsEditing(true);
        setEditId(product.id);

        let secondaryImagesText = "";
        try {
            if (product.images) {
                const imagesArr = JSON.parse(product.images);
                secondaryImagesText = imagesArr.join('\n');
            }
        } catch (e) { }

        setFormData({
            name: product.name,
            imageUrl: product.imageUrl || "",
            description: product.description || "",
            secondaryImages: secondaryImagesText,
            featuredRank: product.featuredRank?.toString() || "",
            mode: product.mode,
            startPrice: product.startPrice?.toString() || "",
            endHours: "24", // Note: Resetting duration for edits for simplicity
            minIncrement: product.minIncrement?.toString() || "5",
            fixedPrice: product.fixedPrice?.toString() || "",
            stockQty: product.stockQty?.toString() || "",
            isSurCommande: !!product.isSurCommande,
            isFeatured: !!product.isFeatured,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            name: "", imageUrl: "", description: "", secondaryImages: "", featuredRank: "",
            mode: "BIDDING", startPrice: "", endHours: "24", minIncrement: "5", fixedPrice: "", stockQty: "",
            isSurCommande: false, isFeatured: false
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const url = "/api/admin/products";
            const method = isEditing ? "PUT" : "POST";
            const body = isEditing ? { ...formData, id: editId } : formData;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Operation failed");

            setMessage(`SUCCESS: Product ${isEditing ? 'updated' : 'deployed'}.`);

            if (isEditing) {
                setIsEditing(false);
                setEditId(null);
            }

            setFormData({
                ...formData, name: "", imageUrl: "", secondaryImages: "", description: "", featuredRank: "", startPrice: "", fixedPrice: "", stockQty: "", isSurCommande: false, isFeatured: false
            });

            fetchProducts();
            fetchStats();
        } catch (err: any) {
            setMessage(`ERROR: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Confirm termination of this product?")) return;
        setMessage("");
        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                setMessage("SUCCESS: Product terminated from registry.");
                fetchProducts();
                fetchStats();
            } else {
                setMessage(`ERROR: ${data.error || "Termination failed"}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            setMessage("ERROR: Network failure during termination.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (status === "loading" || !session) return <div className="min-h-screen flex items-center justify-center font-display text-electric-lime animate-pulse">LOADING COMMAND CENTER...</div>;

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center border-b border-cyber-purple/30 pb-4">
                <div>
                    <h1 className="text-3xl font-display font-bold uppercase text-white shadow-cyber-purple drop-shadow-md">
                        COMMAND_CENTER <span className="text-cyber-purple text-glow-purple">:: DASHBOARD</span>
                    </h1>
                    <p className="text-chrome-dark font-mono text-sm uppercase mt-1">Logged in as: {session.user.name}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("PRODUCTS")}
                        className={`px-4 py-2 font-display text-xs tracking-widest border transition-all ${activeTab === 'PRODUCTS' ? 'bg-electric-lime text-black border-electric-lime shadow-[0_0_10px_#CCFF00]' : 'text-chrome-dark border-chrome-dark/30 hover:border-chrome-light'}`}
                    >
                        PRODUCTS
                    </button>
                    <button
                        onClick={() => setActiveTab("ORDERS")}
                        className={`px-4 py-2 font-display text-xs tracking-widest border transition-all ${activeTab === 'ORDERS' ? 'bg-cyber-purple text-white border-cyber-purple shadow-[0_0_10px_#BC13FE]' : 'text-chrome-dark border-chrome-dark/30 hover:border-chrome-light'}`}
                    >
                        ACQUISITIONS ({orders.length})
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 neon-border-lime flex flex-col items-center text-center">
                    <Package className="w-8 h-8 text-electric-lime mb-2" />
                    <h3 className="font-mono text-chrome-dark uppercase text-xs">Total Products</h3>
                    <p className="text-4xl font-display font-bold text-white mt-2">{stats.products}</p>
                </div>

                <div className="glass-panel p-6 neon-border-purple flex flex-col items-center text-center">
                    <Gavel className="w-8 h-8 text-cyber-purple mb-2" />
                    <h3 className="font-mono text-chrome-dark uppercase text-xs">Total Bids Placed</h3>
                    <p className="text-4xl font-display font-bold text-white mt-2">{stats.bids}</p>
                </div>
            </div>

            {activeTab === "PRODUCTS" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ADD / EDIT PRODUCT FORM */}
                    <div className="lg:col-span-1 glass-panel p-6 border border-chrome-dark/30 h-fit">
                        <h2 className={`text-xl font-display font-bold ${isEditing ? 'text-cyber-purple' : 'text-electric-lime'} uppercase mb-6 flex items-center gap-2`}>
                            <span className={`w-2 h-2 ${isEditing ? 'bg-cyber-purple' : 'bg-electric-lime'} inline-block animate-pulse`}></span>
                            {isEditing ? "Modify Product" : "Initialize Drop"}
                        </h2>

                        {message && (
                            <div className={`p-3 mb-4 text-xs font-mono border ${message.startsWith("ERROR") ? "border-red-500 text-red-500" : "border-electric-lime text-electric-lime"} bg-black/50`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-chrome-light font-mono text-xs uppercase mb-1">Product Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-2 focus:border-electric-lime outline-none" placeholder="Ex: Cyber Deck V1" />
                            </div>

                            <ImageUploader
                                label="Primary Image"
                                currentUrl={formData.imageUrl}
                                onUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                            />

                            <MultiImageUploader
                                label="Extra Images (Gallery)"
                                currentUrls={formData.secondaryImages}
                                onChanged={(urls) => setFormData({ ...formData, secondaryImages: urls })}
                            />

                            <div>
                                <label className="block text-chrome-light font-mono text-xs uppercase mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-2 focus:border-electric-lime outline-none min-h-[100px]" placeholder="Detailed product specifications..." />
                            </div>

                            <div>
                                <label className="block text-chrome-light font-mono text-xs uppercase mb-1">Homepage Priority</label>
                                <input type="number" name="featuredRank" value={formData.featuredRank} onChange={handleChange} className="w-full bg-black/50 border border-chrome-dark/50 text-white font-mono p-2 focus:border-electric-lime outline-none" min="1" placeholder="1 shows first on the main page" />
                                <p className="mt-1 text-[10px] font-mono text-chrome-dark">Leave empty to keep normal newest-first ordering. Lower numbers appear first.</p>
                            </div>

                            <div className="pt-4 border-t border-chrome-dark/30">
                                <label className="block text-chrome-light font-mono text-xs uppercase mb-2">Engage Mode</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer font-mono text-sm text-cyber-purple">
                                        <input type="radio" name="mode" checked={formData.mode === "BIDDING"} onChange={() => handleModeChange("BIDDING")} className="accent-cyber-purple" /> Bidding
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-mono text-sm text-electric-lime">
                                        <input type="radio" name="mode" checked={formData.mode === "STOCK"} onChange={() => handleModeChange("STOCK")} className="accent-electric-lime" /> Direct Stock
                                    </label>
                                </div>
                            </div>

                            {formData.mode === "BIDDING" ? (
                                <div className="space-y-4 pt-4 border-t border-chrome-dark/30">
                                    <div>
                                        <label className="block text-cyber-purple font-mono text-xs uppercase mb-1">Start Price (TND)</label>
                                        <input required type="number" name="startPrice" value={formData.startPrice} onChange={handleChange} className="w-full bg-black/50 border border-cyber-purple/50 text-white font-mono p-2 focus:border-cyber-purple outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-cyber-purple font-mono text-xs uppercase mb-1">Duration (Hours)</label>
                                            <input required type="number" name="endHours" value={formData.endHours} onChange={handleChange} className="w-full bg-black/50 border border-cyber-purple/50 text-white font-mono p-2 focus:border-cyber-purple outline-none" min="1" />
                                        </div>
                                        <div>
                                            <label className="block text-cyber-purple font-mono text-xs uppercase mb-1">Min Increment</label>
                                            <input required type="number" name="minIncrement" value={formData.minIncrement} onChange={handleChange} className="w-full bg-black/50 border border-cyber-purple/50 text-white font-mono p-2 focus:border-cyber-purple outline-none" min="1" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-4 border-t border-chrome-dark/30">
                                    <div>
                                        <label className="block text-electric-lime font-mono text-xs uppercase mb-1">Fixed Price (TND)</label>
                                        <input required type="number" name="fixedPrice" value={formData.fixedPrice} onChange={handleChange} className="w-full bg-black/50 border border-electric-lime/50 text-white font-mono p-2 focus:border-electric-lime outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-electric-lime font-mono text-xs uppercase mb-1">Stock Quantity</label>
                                        <input required type="number" name="stockQty" value={formData.stockQty} onChange={handleChange} className="w-full bg-black/50 border border-electric-lime/50 text-white font-mono p-2 focus:border-electric-lime outline-none" min="1" />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-chrome-dark/30">
                                <label className="flex items-center gap-3 cursor-pointer group mb-4">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.isFeatured}
                                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <div className={`w-10 h-5 rounded-full transition-colors ${formData.isFeatured ? 'bg-cyber-purple' : 'bg-zinc-800 border border-chrome-dark/30'}`}></div>
                                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${formData.isFeatured ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className={`font-mono text-xs uppercase tracking-widest ${formData.isFeatured ? 'text-cyber-purple' : 'text-chrome-dark'}`}>
                                        Show First on Main Page (Featured)
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.isSurCommande}
                                            onChange={(e) => setFormData({ ...formData, isSurCommande: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <div className={`w-10 h-5 rounded-full transition-colors ${formData.isSurCommande ? 'bg-electric-lime' : 'bg-zinc-800 border border-chrome-dark/30'}`}></div>
                                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${formData.isSurCommande ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className={`font-mono text-xs uppercase tracking-widest ${formData.isSurCommande ? 'text-electric-lime' : 'text-chrome-dark'}`}>
                                        Sur Commande (Made-to-Order)
                                    </span>
                                </label>
                                <p className="mt-2 text-[10px] font-mono text-chrome-dark leading-tight">
                                    Enable this for items that are not in stock but can be requested. This will display a "SUR COMMANDE" badge to customers.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {isEditing && (
                                    <button type="button" onClick={cancelEdit} className="flex-1 bg-zinc-800 text-white py-3 text-xs font-display tracking-widest border border-zinc-700">
                                        CANCEL
                                    </button>
                                )}
                                <button type="submit" disabled={loading} className={`flex-[2] btn-glitch py-3 text-sm tracking-widest disabled:opacity-50 ${isEditing ? 'bg-cyber-purple' : ''}`}>
                                    {loading ? "PROCESSING..." : (isEditing ? "UPDATE PRODUCT" : "DEPLOY PRODUCT")}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RECENT ACTIVITY / PRODUCTS */}
                    <div className="lg:col-span-2 glass-panel p-6 border border-chrome-dark/30 h-fit">
                        <div className="flex justify-between items-center mb-6 border-b border-chrome-dark/30 pb-2">
                            <h2 className="text-xl font-display font-bold text-white uppercase">
                                Active Roster
                            </h2>
                            {!isEditing && (
                                <div className="text-[10px] font-mono text-electric-lime animate-pulse">SYSTEM_ONLINE // TOTAL: {products.length}</div>
                            )}
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-chrome-dark font-mono text-sm">No active drops identified in schema.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {products.map((p) => (
                                    <div key={p.id} className={`bg-black/40 border p-4 relative group transition-all ${editId === p.id ? 'border-cyber-purple shadow-[0_0_15px_#BC13FE]' : 'border-chrome-dark/30 hover:border-chrome-light'}`}>
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button onClick={() => handleEdit(p)} title="Edit" className="text-chrome-dark hover:text-blue-400 transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} title="Delete" className="text-chrome-dark hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`text-[10px] font-display font-bold px-2 py-0.5 uppercase ${p.mode === 'BIDDING' ? 'bg-cyber-purple text-white' : 'bg-electric-lime text-black'}`}>
                                                {p.mode}
                                            </div>
                                            {p.isSurCommande && (
                                                <div className="text-[10px] font-display font-bold px-2 py-0.5 uppercase bg-white text-black">
                                                    SUR COMMANDE
                                                </div>
                                            )}
                                            {p.isFeatured && (
                                                <div className="text-[10px] font-display font-bold px-2 py-0.5 uppercase bg-cyber-purple text-white shadow-[0_0_10px_#bc13fe]">
                                                    FEATURED
                                                </div>
                                            )}
                                            <h3 className="font-bold text-white uppercase text-sm truncate pr-12">{p.name}</h3>

                                        </div>
                                        <div className="font-mono text-xs text-chrome-dark space-y-1">
                                            {p.featuredRank ? (
                                                <p>Priority: <span className="text-electric-lime">#{p.featuredRank}</span></p>
                                            ) : (
                                                <p>Priority: Standard feed</p>
                                            )}
                                            {p.mode === 'BIDDING' ? (
                                                <>
                                                    <p>Start: <span className="text-electric-lime">{p.startPrice} TND</span></p>
                                                    <p>Ends: {new Date(p.endTime).toLocaleString()}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>Price: <span className="text-electric-lime">{p.fixedPrice} TND</span></p>
                                                    <p>Stock: {p.stockQty} Units</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {orders.length === 0 ? (
                        <div className="glass-panel py-20 text-center opacity-30">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                            <p className="font-mono text-xs uppercase tracking-widest">No acquisitions identified in system registry.</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="glass-panel border-chrome-dark/30 overflow-hidden">
                                <div className="bg-black/60 p-4 border-b border-chrome-dark/20 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-zinc-900 border border-chrome-dark/30">
                                            <ShoppingBag className="w-6 h-6 text-cyber-purple" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold font-mono text-sm tracking-tighter">{order.id}</h3>
                                            <p className="text-[10px] text-chrome-dark uppercase font-mono">{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] text-chrome-dark uppercase font-mono">Total Allocation</p>
                                            <p className="text-xl font-display font-bold text-electric-lime">{order.totalAmount} TND</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] text-chrome-dark uppercase font-mono text-center">Status</p>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className="bg-black border border-chrome-dark/50 text-[10px] font-mono text-white p-1 focus:border-cyber-purple outline-none"
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="CALLED">CALLED</option>
                                                <option value="VERIFIED">VERIFIED</option>
                                                <option value="SHIPPED">SHIPPED</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Client Details */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-display font-bold text-cyber-purple uppercase flex items-center gap-2">
                                            <span className="w-1 h-3 bg-cyber-purple"></span> Operator_Intelligence
                                        </h4>
                                        <div className="space-y-3 bg-black/30 p-4 border border-chrome-dark/10">
                                            <div className="flex items-center gap-3">
                                                <Terminal className="w-4 h-4 text-chrome-dark" />
                                                <span className="text-xs font-mono text-white">Name: {order.userName}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-mono text-white">Comms: {order.userPhone}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-electric-lime" />
                                                <span className="text-xs font-mono text-white">Grid_Location: {order.userLocation}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Terminal className="w-4 h-4 text-chrome-dark" />
                                                <span className="text-xs font-mono text-chrome-dark italic">{order.userEmail}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-display font-bold text-electric-lime uppercase flex items-center gap-2">
                                            <span className="w-1 h-3 bg-electric-lime"></span> Transferred_Assets
                                        </h4>
                                        <div className="space-y-2">
                                            {order.items?.map((item: any) => (
                                                <div key={item.id} className="flex items-center gap-3 bg-black/20 p-2 border border-chrome-dark/10 group">
                                                    <div className="w-10 h-10 bg-black/60 border border-chrome-dark/30 flex items-center justify-center overflow-hidden shrink-0">
                                                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="text-[10px] font-bold text-white uppercase">{item.productName}</p>
                                                        <p className="text-[10px] text-chrome-dark font-mono">Qty: {item.quantity} × {item.priceAtTime} TND</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function Terminal({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>;
}
