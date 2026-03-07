import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { productId, amount } = body;

        if (!productId || !amount) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const products = await query<any[]>('SELECT * FROM products WHERE id = $1', [productId]);
        if (products.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        const product = products[0];

        if (product.mode !== 'BIDDING') {
            return NextResponse.json({ error: "Not an auction item" }, { status: 400 });
        }
        if (new Date() > new Date(product.endTime)) {
            return NextResponse.json({ error: "Auction terminated" }, { status: 400 });
        }

        const highestBids = await query<any[]>('SELECT MAX(amount) as max_amount FROM bids WHERE "productId" = $1', [productId]);
        const currentHighest = highestBids[0]?.max_amount || product.startPrice;

        if (amount < (currentHighest + product.minIncrement)) {
            return NextResponse.json({ error: `Bid rejected. Must exceed ${currentHighest} by ${product.minIncrement}` }, { status: 400 });
        }

        const id = "BID_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
        await query(
            'INSERT INTO bids (id, amount, "productId", "userId") VALUES ($1, $2, $3, $4)',
            [id, amount, productId, session.user.id]
        );

        return NextResponse.json({ success: true, bidId: id }, { status: 201 });
    } catch (error) {
        console.error("Failed to process bid:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
