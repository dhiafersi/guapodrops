import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch user bids joined with product info
        const bids = await query<any[]>(`
        SELECT b.id, b.amount, b."createdAt", p.name as "productName", p."endTime"
        FROM bids b
        JOIN products p ON b."productId" = p.id
        WHERE b."userId" = $1
        ORDER BY b."createdAt" DESC
    `, [userId]);

        // Fetch user orders joined with product info via order_items
        const orders = await query<any[]>(`
        SELECT 
            o.id, 
            o."totalAmount", 
            o.status, 
            o."createdAt",
            COALESCE(STRING_AGG(p.name, ', '), 'Order Package') as "productName",
            COALESCE(SUM(oi.quantity), 0) as "quantity"
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi."orderId"
        LEFT JOIN products p ON oi."productId" = p.id
        WHERE o."userId" = $1
        GROUP BY o.id, o."totalAmount", o.status, o."createdAt"
        ORDER BY o."createdAt" DESC
    `, [userId]);

        return NextResponse.json({ success: true, bids, orders }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch user activity:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
