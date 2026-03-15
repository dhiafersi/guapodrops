import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { productIds } = await req.json();

        if (!productIds || !Array.isArray(productIds)) {
            return NextResponse.json({ error: "Invalid payload: productIds must be an array" }, { status: 400 });
        }

        console.log("[ADMIN_REORDER] Updating product ranks...");

        // Bulk update the featuredRank based on the array order
        // We use a transaction-like approach or just multiple updates
        // For Postgres, we can do multiple queries in parallel or sequence
        
        for (let i = 0; i < productIds.length; i++) {
            await query(
                'UPDATE products SET "featuredRank" = $1, "isFeatured" = TRUE WHERE id = $2',
                [i + 1, productIds[i]]
            );
        }

        console.log("[ADMIN_REORDER] Success.");
        return NextResponse.json({ success: true, message: "Registry ranks updated successfully." });
    } catch (error) {
        console.error("Failed to reorder products:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
