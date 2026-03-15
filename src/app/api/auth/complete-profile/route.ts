import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { phone, location } = await req.json();

        if (!phone || !location) {
            return NextResponse.json({ error: "Phone and location are required" }, { status: 400 });
        }

        await query(
            'UPDATE users SET phone = ?, location = ? WHERE id = ?',
            [phone, location, userId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Complete Profile Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
