import { query } from "@/lib/db";
import { Archive, Zap } from "lucide-react";
import KineticText from "@/components/KineticText";
import ProductCard from "@/components/ProductCard";

export default async function DropsPage() {
    // Fetch all active products
    const products = await query<any[]>('SELECT * FROM products ORDER BY createdAt DESC');

    return (
        <div className="min-h-screen pb-20">
            <section className="max-w-7xl mx-auto px-4 md:px-10 py-12">
                <header className="mb-20 text-center space-y-4">
                    <KineticText as="h1" className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                        LIVE <span className="text-neon-teal">DROPS</span>
                    </KineticText>
                    <p className="font-mono text-xs md:text-sm text-chrome-dark uppercase tracking-[0.3em] max-w-2xl mx-auto">
                        The latest products are live. Shop exclusive items before they sell out.
                    </p>
                </header>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 border border-white/5 bg-white/[0.02] rounded-[3rem]">
                        <Archive className="w-12 h-12 text-white/10 mb-6" />
                        <p className="font-mono text-chrome-dark uppercase tracking-widest">No products available right now. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-3">
                                <Zap className="text-neon-teal animate-pulse w-5 h-5" />
                                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-chrome-light">
                                    [ {products.length} ] Active Drops
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            {products.map((p, index) => (
                                <div
                                    key={p.id}
                                    className={index % 3 === 1 ? "lg:translate-y-12" : index % 3 === 2 ? "lg:translate-y-24" : ""}
                                >
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
