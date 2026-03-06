import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orders = await query(`
            SELECT o.*, u.name as userName, u.email as userEmail, u.phone as userPhone, u.location as userLocation
            FROM orders o
            JOIN users u ON o.userId = u.id
            ORDER BY o.createdAt DESC
        `);

        // Fetch items for each order
        const ordersWithItems = await Promise.all((orders as any[]).map(async (order) => {
            const items = await query(`
                SELECT oi.*, p.name as productName, p.imageUrl
                FROM order_items oi
                JOIN products p ON oi.productId = p.id
                WHERE oi.orderId = ?
            `, [order.id]);
            return { ...order, items };
        }));

        return NextResponse.json({ orders: ordersWithItems });
    } catch (e) {
        console.error("Order fetch error:", e);
        return NextResponse.json({ error: "Order fetch failed" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get current status to check for transitions
        const currentOrders = await query<any[]>('SELECT status FROM orders WHERE id = ?', [id]);
        if (currentOrders.length === 0) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        const oldStatus = currentOrders[0].status;

        // 2. If transitioning TO 'COMPLETED', deduct stock
        if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
            const items = await query<any[]>('SELECT productId, quantity FROM order_items WHERE orderId = ?', [id]);
            for (const item of items) {
                await query('UPDATE products SET stockQty = stockQty - ? WHERE id = ? AND mode = "STOCK"',
                    [item.quantity, item.productId]);
            }
        }

        // 3. Update status in database
        await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Order update error:", e);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
