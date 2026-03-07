import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const stats = await query<{ bids: number, products: number }[]>(`
        SELECT 
            (SELECT COUNT(*) FROM bids) as bids,
            (SELECT COUNT(*) FROM products) as products
    `);

        return NextResponse.json({
            success: true,
            bids: stats[0]?.bids || 0,
            products: stats[0]?.products || 0
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
