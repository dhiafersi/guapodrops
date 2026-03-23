import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

async function ensureColumns() {
    await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS "featuredRank" INTEGER');
    await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS "isSurCommande" BOOLEAN DEFAULT FALSE');
    await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT FALSE');
}

export async function GET(req: Request) {
    try {
        await ensureColumns();
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
            const products = await query<any[]>('SELECT * FROM products WHERE id = $1', [id]);
            if (products.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json({ product: products[0] });
        }

        const products = await query<any[]>('SELECT * FROM products ORDER BY "featuredRank" ASC NULLS LAST, "isFeatured" DESC, "createdAt" DESC');
        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await ensureColumns();
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { name, imageUrl, secondaryImages, description, mode, startPrice, endHours, minIncrement, fixedPrice, stockQty, isSurCommande } = body;

        if (!name || !mode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const id = "PROD_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();

        let endTimeStr = null;
        if (mode === "BIDDING" && endHours) {
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + parseInt(endHours, 10));
            endTimeStr = endDate.toISOString().slice(0, 19).replace('T', ' ');
        }

        const extraImages = secondaryImages ? secondaryImages.split('\n').filter((url: string) => url.trim() !== '') : [];
        const imagesJson = JSON.stringify(extraImages);

        await query(
            `INSERT INTO products (id, name, "imageUrl", images, description, mode, "startPrice", "endTime", "minIncrement", "fixedPrice", "stockQty", "isSurCommande")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
                id, name, imageUrl || null, imagesJson, description || null, mode,
                mode === "BIDDING" ? (startPrice || 0) : null,
                endTimeStr,
                mode === "BIDDING" ? (minIncrement || 1) : null,
                mode === "STOCK" ? (fixedPrice || 0) : null,
                mode === "STOCK" ? (stockQty || 0) : null,
                !!isSurCommande
            ]
        );

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error("Failed to create product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await ensureColumns();
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, imageUrl, secondaryImages, description, mode, startPrice, endHours, minIncrement, fixedPrice, stockQty, isSurCommande } = body;

        if (!id || !name || !mode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let endTimeStr = null;
        if (mode === "BIDDING" && endHours) {
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + parseInt(endHours, 10));
            endTimeStr = endDate.toISOString().slice(0, 19).replace('T', ' ');
        }

        const extraImages = secondaryImages ? secondaryImages.split('\n').filter((url: string) => url.trim() !== '') : [];
        const imagesJson = JSON.stringify(extraImages);

        await query(
            `UPDATE products SET name=$1, "imageUrl"=$2, images=$3, description=$4, mode=$5, "startPrice"=$6, "endTime"=$7, "minIncrement"=$8, "fixedPrice"=$9, "stockQty"=$10, "isSurCommande"=$11 WHERE id=$12`,
            [
                name, imageUrl || null, imagesJson, description || null, mode,
                mode === "BIDDING" ? (startPrice || 0) : null,
                endTimeStr,
                mode === "BIDDING" ? (minIncrement || 1) : null,
                mode === "STOCK" ? (fixedPrice || 0) : null,
                mode === "STOCK" ? (stockQty || 0) : null,
                !!isSurCommande,
                id
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const orders = await query<any[]>('SELECT id FROM order_items WHERE "productId" = $1 LIMIT 1', [id]);
        if (orders.length > 0) {
            return NextResponse.json({ error: "RESCISSION_FAILURE: Asset linked to finalized orders." }, { status: 400 });
        }

        await query('DELETE FROM cart_items WHERE "productId" = $1', [id]);
        await query('DELETE FROM bids WHERE "productId" = $1', [id]);
        await query('DELETE FROM products WHERE id = $1', [id]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to terminate product:", error);
        return NextResponse.json({ error: "Internal registry failure: " + error.message }, { status: 500 });
    }
}
