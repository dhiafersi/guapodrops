import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendOrderNotification } from "@/lib/resend";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const items = await query(`
            SELECT c.*, p.name, p."imageUrl", p."fixedPrice", p."stockQty"
            FROM cart_items c
            JOIN products p ON c."productId" = p.id
            WHERE c."userId" = $1
            ORDER BY c."createdAt" DESC
        `, [session.user.id]);

        return NextResponse.json({ items });
    } catch (e) {
        console.error("Cart fetch error:", e);
        return NextResponse.json({ error: "Cart fetch failed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { productId, quantity = 1 } = await req.json();

        const products = await query<any[]>('SELECT mode, "stockQty" FROM products WHERE id = $1', [productId]);
        if (products.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        if (products[0].mode !== 'STOCK') return NextResponse.json({ error: "Only stock items can be added to cart" }, { status: 400 });

        const id = "CART_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();

        const existing = await query<any[]>('SELECT id, quantity FROM cart_items WHERE "userId" = $1 AND "productId" = $2', [session.user.id, productId]);
        if (existing.length > 0) {
            await query('UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2', [quantity, existing[0].id]);
        } else {
            await query(
                'INSERT INTO cart_items (id, "userId", "productId", quantity) VALUES ($1, $2, $3, $4)',
                [id, session.user.id, productId, quantity]
            );
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Cart add error:", e);
        return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        await query('DELETE FROM cart_items WHERE id = $1 AND "userId" = $2', [id, session.user.id]);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
    }
}

export async function PUT() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;

        const cartItems = await query<any[]>(`
            SELECT c.*, p.name, p."fixedPrice"
            FROM cart_items c
            JOIN products p ON c."productId" = p.id
            WHERE c."userId" = $1
        `, [userId]);

        if (cartItems.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

        const orderId = "ORD_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
        const totalAmount = cartItems.reduce((acc, item) => acc + (item.fixedPrice * item.quantity), 0);

        console.log(`[ORDER_DEBUG] Finalizing cart checkout. Order: ${orderId}, Total: ${totalAmount}, Items: ${cartItems.length}`);

        await query('INSERT INTO orders (id, "userId", "totalAmount", status) VALUES ($1, $2, $3, $4)',
            [orderId, userId, totalAmount, 'PENDING']);

        for (const item of cartItems) {
            const itemId = "ORDI_" + Math.random().toString(36).substring(2, 10).toUpperCase();
            await query('INSERT INTO order_items (id, "orderId", "productId", quantity, "priceAtTime") VALUES ($1, $2, $3, $4, $5)',
                [itemId, orderId, item.productId, item.quantity, item.fixedPrice]);
        }


        await query('DELETE FROM cart_items WHERE "userId" = $1', [userId]);

        // --- ASYNC EMAIL NOTIFICATION ---
        try {
            console.log(`[ORDER_DEBUG] Cart successful. Order: ${orderId}. Sending to Resend...`);
            const itemsForEmail = cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                priceAtTime: item.fixedPrice
            }));

            await sendOrderNotification({
                orderId,
                customerName: session.user?.name || 'Customer',
                customerEmail: session.user?.email || 'N/A',
                totalAmount,
                items: itemsForEmail
            });
            console.log(`[ORDER_DEBUG] Resend call completed for: ${orderId}`);
        } catch (emailError) {
            console.error("[ORDER_DEBUG] Notification FAILURE:", emailError);
        }
        // Don't fail the order just because email failed

        return NextResponse.json({ success: true, message: "ACQUISITION_INITIALIZED: Admin will verify assets.", orderId });
    } catch (e) {
        console.error("Order initialization error:", e);
        return NextResponse.json({ error: "Internal registry failure during initialization" }, { status: 500 });
    }
}
