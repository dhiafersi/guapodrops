import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const users = await query<Array<{
            id: string;
            name: string;
            email: string;
            phone: string | null;
            location: string | null;
            role: "USER" | "ADMIN";
        }>>(
            'SELECT id, name, email, phone, location, role FROM users WHERE id = $1 LIMIT 1',
            [session.user.id]
        );

        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: users[0] });
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { name, email, phone, location } = await req.json();

        if (!name || !email || !phone || !location) {
            return NextResponse.json({ error: "All profile fields are required" }, { status: 400 });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedName = String(name).trim();
        const normalizedPhone = String(phone).trim();
        const normalizedLocation = String(location).trim();

        const conflictingUsers = await query<Array<{ id: string }>>(
            'SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1',
            [normalizedEmail, session.user.id]
        );

        if (conflictingUsers.length > 0) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        const updatedUsers = await query<Array<{
            id: string;
            name: string;
            email: string;
            phone: string | null;
            location: string | null;
            role: "USER" | "ADMIN";
        }>>(
            'UPDATE users SET name = $1, email = $2, phone = $3, location = $4 WHERE id = $5 RETURNING id, name, email, phone, location, role',
            [normalizedName, normalizedEmail, normalizedPhone, normalizedLocation, session.user.id]
        );

        if (updatedUsers.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: updatedUsers[0] });
    } catch (error) {
        console.error("Failed to update user profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
