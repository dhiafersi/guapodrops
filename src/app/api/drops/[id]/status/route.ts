import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: productId } = await params;
        if (!productId) {
            return NextResponse.json({ error: "No product ID" }, { status: 400 });
        }

        const stats = await query<{ maxAmount: number, totalBids: number }[]>(`
            SELECT 
                MAX(amount) as "maxAmount",
                COUNT(id) as "totalBids"
            FROM bids
            WHERE "productId" = $1
        `, [productId]);

        const highestBid = stats[0]?.maxAmount || 0;
        const totalBids = stats[0]?.totalBids || 0;

        return NextResponse.json({ highestBid, totalBids }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch drop status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
