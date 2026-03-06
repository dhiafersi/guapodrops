import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const { name, email, password, phone, location } = await req.json();

        if (!name || !email || !password || !phone || !location) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user already exists
        const existing = await query<any[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        const id = "USER_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
        const hashedPassword = await bcrypt.hash(password, 10);

        await query(
            'INSERT INTO users (id, name, email, phone, location, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, email, phone, location, hashedPassword, 'USER']
        );

        return NextResponse.json({ success: true, message: "Registration complete" }, { status: 201 });
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
