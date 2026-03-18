import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendOrderNotification } from "@/lib/resend";

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

        await query(
            'INSERT INTO orders (id, "userId", "totalAmount", status) VALUES ($1, $2, $3, $4)',
            [id, session.user.id, totalPrice, 'CONFIRMED']
        );

        const itemId = "ORDI_" + Math.random().toString(36).substring(2, 10).toUpperCase();
        await query(
            'INSERT INTO order_items (id, "orderId", "productId", quantity, "priceAtTime") VALUES ($1, $2, $3, $4, $5)',
            [itemId, id, productId, qty, product.fixedPrice]
        );

        await query(
            'UPDATE products SET "stockQty" = "stockQty" - $1 WHERE id = $2',
            [qty, productId]
        );

        // --- ASYNC EMAIL NOTIFICATION ---
        try {
            await sendOrderNotification({
                orderId: id,
                customerName: session.user.name || 'Anonymous',
                customerEmail: session.user.email || 'N/A',
                totalAmount: totalPrice,
                items: [{
                    name: product.name,
                    quantity: qty,
                    priceAtTime: product.fixedPrice
                }]
            });
        } catch (emailError) {
            console.error("Email notification failed:", emailError);
        }

        return NextResponse.json({ success: true, orderId: id }, { status: 201 });

    } catch (error) {
        console.error("Failed to process order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
