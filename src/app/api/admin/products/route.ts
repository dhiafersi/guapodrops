import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
            // get specific product
            const products = await query<any[]>('SELECT * FROM products WHERE id = ?', [id]);
            if (products.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json({ product: products[0] });
        }

        // get all active drops
        const products = await query<any[]>('SELECT * FROM products ORDER BY createdAt DESC');

        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { name, imageUrl, secondaryImages, description, mode, startPrice, endHours, minIncrement, fixedPrice, stockQty } = body;

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

        // Process images array
        const extraImages = secondaryImages ? secondaryImages.split('\n').filter((url: string) => url.trim() !== '') : [];
        const imagesJson = JSON.stringify(extraImages);

        await query(
            `INSERT INTO products 
      (id, name, imageUrl, images, description, mode, startPrice, endTime, minIncrement, fixedPrice, stockQty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                name,
                imageUrl || null,
                imagesJson,
                description || null,
                mode,
                mode === "BIDDING" ? (startPrice || 0) : null,
                endTimeStr,
                mode === "BIDDING" ? (minIncrement || 1) : null,
                mode === "STOCK" ? (fixedPrice || 0) : null,
                mode === "STOCK" ? (stockQty || 0) : null
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
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, imageUrl, secondaryImages, description, mode, startPrice, endHours, minIncrement, fixedPrice, stockQty } = body;

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
            `UPDATE products 
             SET name = ?, imageUrl = ?, images = ?, description = ?, mode = ?, 
                 startPrice = ?, endTime = ?, minIncrement = ?, fixedPrice = ?, stockQty = ?
             WHERE id = ?`,
            [
                name,
                imageUrl || null,
                imagesJson,
                description || null,
                mode,
                mode === "BIDDING" ? (startPrice || 0) : null,
                endTimeStr,
                mode === "BIDDING" ? (minIncrement || 1) : null,
                mode === "STOCK" ? (fixedPrice || 0) : null,
                mode === "STOCK" ? (stockQty || 0) : null,
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

        // 1. Check if product is linked to finalized orders
        const orders = await query<any[]>('SELECT id FROM order_items WHERE productId = ? LIMIT 1', [id]);
        if (orders.length > 0) {
            return NextResponse.json({
                error: "RESCISSION_FAILURE: Asset is linked to finalized orders. Registry integrity must be maintained. Modification restricted."
            }, { status: 400 });
        }

        // 2. Clear transient dependencies (carts, bids)
        await query('DELETE FROM cart_items WHERE productId = ?', [id]);
        await query('DELETE FROM bids WHERE productId = ?', [id]);

        // 3. Terminate asset
        await query('DELETE FROM products WHERE id = ?', [id]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Failed to terminate product:", error);
        return NextResponse.json({ error: "Internal registry failure during termination: " + error.message }, { status: 500 });
    }
}
