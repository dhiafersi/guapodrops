import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orders = await query(`
            SELECT o.*, u.name as "userName", u.email as "userEmail", u.phone as "userPhone", u.location as "userLocation"
            FROM orders o
            JOIN users u ON o."userId" = u.id
            ORDER BY o."createdAt" DESC
        `);

        const ordersWithItems = await Promise.all((orders as any[]).map(async (order) => {
            const items = await query(`
                SELECT oi.*, p.name as "productName", p."imageUrl"
                FROM order_items oi
                JOIN products p ON oi."productId" = p.id
                WHERE oi."orderId" = $1
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
        if (!id || !status) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        const currentOrders = await query<any[]>('SELECT status FROM orders WHERE id = $1', [id]);
        if (currentOrders.length === 0) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        const oldStatus = currentOrders[0].status;

        if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
            const items = await query<any[]>('SELECT "productId", quantity FROM order_items WHERE "orderId" = $1', [id]);
            for (const item of items) {
                await query('UPDATE products SET "stockQty" = "stockQty" - $1 WHERE id = $2 AND mode = \'STOCK\'',
                    [item.quantity, item.productId]);
            }
        }

        await query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Order update error:", e);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
