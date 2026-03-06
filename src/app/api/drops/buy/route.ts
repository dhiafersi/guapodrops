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
        const { productId, quantity } = body;

        const qty = parseInt(quantity, 10);

        if (!productId || isNaN(qty) || qty <= 0) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // 1. Fetch Product
        const products = await query<any[]>('SELECT * FROM products WHERE id = ?', [productId]);
        if (products.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        const product = products[0];

        // 2. Validate state
        if (product.mode !== 'STOCK') {
            return NextResponse.json({ error: "Not a stock item" }, { status: 400 });
        }
        if (product.stockQty < qty) {
            return NextResponse.json({ error: "Insufficient stock remaining" }, { status: 400 });
        }

        // 3. Process Order & Decrement Stock
        const totalPrice = product.fixedPrice * qty;
        const id = "ORD_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();

        // We'd typically use a transaction here, but for simplicity we rely on sequential queries.
        await query(
            'INSERT INTO orders (id, productId, userId, quantity, totalPrice, status) VALUES (?, ?, ?, ?, ?, ?)',
            [id, productId, session.user.id, qty, totalPrice, 'CONFIRMED']
        );

        await query(
            'UPDATE products SET stockQty = stockQty - ? WHERE id = ?',
            [qty, productId]
        );

        return NextResponse.json({ success: true, orderId: id }, { status: 201 });

    } catch (error) {
        console.error("Failed to process order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
