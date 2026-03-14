import { query } from "@/lib/db";
import { Archive, Zap } from "lucide-react";
import KineticText from "@/components/KineticText";
import ProductCard from "@/components/ProductCard";

export const dynamic = 'force-dynamic';

export default async function DropsPage() {
    let products: any[] = [];

    try {
        await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS "featuredRank" INTEGER');
        // Fetch all active products
        products = await query<any[]>(
            'SELECT * FROM products ORDER BY "isFeatured" DESC NULLS LAST, CASE WHEN "featuredRank" IS NULL THEN 1 ELSE 0 END, "featuredRank" ASC, "createdAt" DESC'
        );
    } catch (e) {
        console.error("⛔ DROPS_PAGE_DB_ERROR", e);
        products = [];
    }

    return (
        <div className="min-h-screen pb-20">
            <section className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-12">
                <header className="mb-10 space-y-4 text-center md:mb-20">
                    <KineticText as="h1" className="text-4xl font-black uppercase leading-none tracking-[-0.06em] md:text-8xl md:tracking-tighter">
                        LIVE <span className="text-neon-teal">DROPS</span>
                    </KineticText>
                    <p className="mx-auto max-w-[20rem] font-mono text-[10px] uppercase tracking-[0.24em] text-chrome-dark md:max-w-2xl md:text-sm md:tracking-[0.3em]">
                        The latest products are live. Shop exclusive items before they sell out.
                    </p>
                </header>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-white/[0.02] px-5 py-20 md:rounded-[3rem] md:py-40">
                        <Archive className="w-12 h-12 text-white/10 mb-6" />
                        <p className="text-center font-mono text-[10px] uppercase tracking-[0.24em] text-chrome-dark md:text-base md:tracking-widest">
                            No products available right now. Check back soon!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-5 md:mb-12 md:flex-row md:items-center md:justify-between md:pb-6">
                            <div className="flex items-center gap-3">
                                <Zap className="text-neon-teal animate-pulse w-5 h-5" />
                                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-chrome-light">
                                    [ {products.length} ] Active Drops
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-12">
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
