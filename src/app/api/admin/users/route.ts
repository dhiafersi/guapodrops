import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await query('SELECT id, name, email, role, phone, location, "createdAt" FROM users ORDER BY "createdAt" DESC');

        return NextResponse.json({ users });
    } catch (e) {
        console.error("Admin fetch users error:", e);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
