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
        SELECT b.id, b.amount, b.createdAt, p.name as productName, p.endTime
        FROM bids b
        JOIN products p ON b.productId = p.id
        WHERE b.userId = ?
        ORDER BY b.createdAt DESC
    `, [userId]);

        // Fetch user orders joined with product info
        const orders = await query<any[]>(`
        SELECT o.id, o.quantity, o.totalPrice, o.status, p.name as productName
        FROM orders o
        JOIN products p ON o.productId = p.id
        WHERE o.userId = ?
        ORDER BY o.createdAt DESC
    `, [userId]);

        return NextResponse.json({ success: true, bids, orders }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch user activity:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
