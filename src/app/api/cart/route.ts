import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const items = await query(`
            SELECT c.*, p.name, p.imageUrl, p.fixedPrice, p.stockQty 
            FROM cart_items c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
            ORDER BY c.createdAt DESC
        `, [session.user.id]);

        return NextResponse.json({ items });
    } catch (e) {
        return NextResponse.json({ error: "Cart fetch failed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { productId, quantity = 1 } = await req.json();

        // Verify product is STOCK mode
        const products = await query<any[]>('SELECT mode, stockQty FROM products WHERE id = ?', [productId]);
        if (products.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        if (products[0].mode !== 'STOCK') return NextResponse.json({ error: "Only stock items can be added to cart" }, { status: 400 });

        const id = "CART_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();

        await query(`
            INSERT INTO cart_items (id, userId, productId, quantity)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `, [id, session.user.id, productId, quantity]);

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        await query('DELETE FROM cart_items WHERE id = ? AND userId = ?', [id, session.user.id]);
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

        // Fetch all items in cart with current price
        const cartItems = await query<any[]>(`
            SELECT c.*, p.name, p.fixedPrice 
            FROM cart_items c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
        `, [userId]);

        if (cartItems.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

        const orderId = "ORD_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
        const totalAmount = cartItems.reduce((acc, item) => acc + (item.fixedPrice * item.quantity), 0);

        // 1. Create Order record (STOCK IS NOT DEDUCTED YET)
        await query('INSERT INTO orders (id, userId, totalAmount, status) VALUES (?, ?, ?, ?)',
            [orderId, userId, totalAmount, 'PENDING']);

        // 2. Create Order Items
        for (const item of cartItems) {
            const itemId = "ORDI_" + Math.random().toString(36).substring(2, 10).toUpperCase();
            await query('INSERT INTO order_items (id, orderId, productId, quantity, priceAtTime) VALUES (?, ?, ?, ?, ?)',
                [itemId, orderId, item.productId, item.quantity, item.fixedPrice]);
        }

        // 3. Clear cart
        await query('DELETE FROM cart_items WHERE userId = ?', [userId]);

        return NextResponse.json({ success: true, message: "ACQUISITION_INITIALIZED: Admin will verify assets.", orderId });
    } catch (e) {
        console.error("Order initialization error:", e);
        return NextResponse.json({ error: "Internal registry failure during initialization" }, { status: 500 });
    }
}
