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
    product.isSurCommande = product.is_sur_commande ?? product.isSurCommande;
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
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-10">
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-20">

                    <div className="lg:col-span-5 space-y-8">
                        <ImageGallery
                            mainImage={product.imageUrl}
                            extraImages={extraImages}
                            productName={product.name}
                        />

                        <div className="liquid-glass space-y-4 rounded-[2rem] border border-white/5 p-5 md:rounded-3xl md:p-6">
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
                    <div className="space-y-8 lg:col-span-7 lg:space-y-10 lg:pt-12">
                        <div className="space-y-5 md:space-y-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <span className={`w-fit rounded-full px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${isBidding ? 'border border-bio-violet/20 bg-bio-violet/10 text-bio-violet' : 'border border-neon-teal/20 bg-neon-teal/10 text-neon-teal'}`}>
                                    {isBidding ? 'Auction' : 'Buy Now'}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-chrome-dark">
                                    ID: {product.id}
                                </span>
                            </div>

                            <KineticText as="h1" className="text-3xl font-black uppercase leading-tight tracking-[-0.05em] md:text-7xl md:tracking-tight">
                                {product.name}
                            </KineticText>
                        </div>

                        <div className="relative">
                            {/* Decorative line */}
                            <div className="absolute -left-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/10 via-neon-teal/20 to-transparent hidden lg:block" />

                            <div className="space-y-8 md:space-y-12">
                                <BiddingInterface product={product} />

                                {product.description && (
                                    <div className="space-y-4 md:space-y-6">
                                        <h2 className="border-l-2 border-white/10 pl-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-chrome-dark md:pl-6">
                                            Product Description
                                        </h2>
                                        <div className="liquid-glass rounded-[2rem] border border-white/5 p-5 md:rounded-[2.5rem] md:p-8">
                                            <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-chrome-light md:text-base">
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
