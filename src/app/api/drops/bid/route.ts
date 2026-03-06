import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

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

        // 1. Fetch Product
        const products = await query<any[]>('SELECT * FROM products WHERE id = ?', [productId]);
        if (products.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        const product = products[0];

        // 2. Validate state
        if (product.mode !== 'BIDDING') {
            return NextResponse.json({ error: "Not an auction item" }, { status: 400 });
        }
        if (new Date() > new Date(product.endTime)) {
            return NextResponse.json({ error: "Auction terminated" }, { status: 400 });
        }

        // 3. Check highest bid
        const highestBids = await query<any[]>('SELECT MAX(amount) as maxAmount FROM bids WHERE productId = ?', [productId]);
        const currentHighest = highestBids[0]?.maxAmount || product.startPrice;

        if (amount < (currentHighest + product.minIncrement)) {
            return NextResponse.json({ error: `Bid rejected. Must exceed ${currentHighest} by ${product.minIncrement}` }, { status: 400 });
        }

        // 4. Insert Bid
        const id = "BID_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
        await query(
            'INSERT INTO bids (id, amount, productId, userId) VALUES (?, ?, ?, ?)',
            [id, amount, productId, session.user.id]
        );

        return NextResponse.json({ success: true, bidId: id }, { status: 201 });

    } catch (error) {
        console.error("Failed to process bid:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
