import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import BiddingInterface from "./BiddingInterface";
import KineticText from "@/components/KineticText";
import ImageGallery from "./ImageGallery";
import { ShieldCheck } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DropDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const products = await query<any[]>('SELECT * FROM products WHERE id = ?', [id]);

    if (products.length === 0) {
        notFound();
    }

    const product = products[0];
    // Normalize column names (PostgreSQL returns snake_case)
    product.imageUrl = product.image_url ?? product.imageUrl;
    product.startPrice = product.start_price ?? product.startPrice;
    product.endTime = product.end_time ?? product.endTime;
    product.minIncrement = product.min_increment ?? product.minIncrement;
    product.fixedPrice = product.fixed_price ?? product.fixedPrice;
    product.stockQty = product.stock_qty ?? product.stockQty;
    const isBidding = product.mode === 'BIDDING';

    // Parse extra images from JSON column
    let extraImages: string[] = [];
    try {
        if (product.images) {
            extraImages = JSON.parse(product.images);
        }
    } catch { }

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                    <div className="lg:col-span-5 space-y-8">
                        <ImageGallery
                            mainImage={product.imageUrl}
                            extraImages={extraImages}
                            productName={product.name}
                        />

                        <div className="liquid-glass p-6 rounded-3xl border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-neon-teal">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Authenticity Verified</span>
                            </div>
                            <p className="font-mono text-[10px] text-chrome-dark leading-relaxed uppercase">
                                This product has been quality-checked and verified. Genuine and authorized by our team.
                            </p>
                        </div>
                    </div>

                    {/* Right side: Information (7 cols) */}
                    <div className="lg:col-span-7 space-y-10 lg:pt-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${isBidding ? 'bg-bio-violet/10 text-bio-violet border border-bio-violet/20' : 'bg-neon-teal/10 text-neon-teal border border-neon-teal/20'}`}>
                                    {isBidding ? 'Auction' : 'Buy Now'}
                                </span>
                                <span className="font-mono text-[10px] text-chrome-dark uppercase tracking-widest">
                                    ID: {product.id}
                                </span>
                            </div>

                            <KineticText as="h1" className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-tight">
                                {product.name}
                            </KineticText>
                        </div>

                        <div className="relative">
                            {/* Decorative line */}
                            <div className="absolute -left-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/10 via-neon-teal/20 to-transparent hidden lg:block" />

                            <div className="space-y-12">
                                <BiddingInterface product={product} />

                                {product.description && (
                                    <div className="space-y-6">
                                        <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-chrome-dark font-bold border-l-2 border-white/10 pl-6">
                                            Product Description
                                        </h2>
                                        <div className="liquid-glass p-8 rounded-[2.5rem] border border-white/5">
                                            <p className="font-mono text-sm md:text-base text-chrome-light leading-relaxed whitespace-pre-wrap">
                                                {product.description}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
