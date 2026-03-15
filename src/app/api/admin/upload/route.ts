import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    console.log("[UPLOAD_DEBUG] Received upload request (Supabase Mode)");
    try {
        // Check credentials
        if (!process.env.DATABASE_SUPABASE_URL || !process.env.DATABASE_SUPABASE_SERVICE_ROLE_KEY) {
            console.error("[UPLOAD_ERROR] Missing Supabase credentials in environment");
            return NextResponse.json({ 
                error: "Configuration Error", 
                details: "Supabase storage credentials (URL/Service Key) are missing in environment variables." 
            }, { status: 500 });
        }

        // Auth check
        const session = await getServerSession(authOptions);
        console.log("[UPLOAD_DEBUG] Auth checked, session:", !!session);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[UPLOAD_DEBUG] Parsing form data...");
        const formData = await req.formData();
        console.log("[UPLOAD_DEBUG] Form data parsed");
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, GIF, AVIF allowed." }, { status: 400 });
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Unique filename
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        console.log("[UPLOAD_DEBUG] Uploading to Supabase bucket 'products'...");
        
        // Using 'products' bucket - make sure it's public in Supabase dashboard
        const { data, error: uploadError } = await supabase.storage
            .from('products')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error("[SUPABASE_STORAGE_ERROR]", uploadError);
            // Try fallback to 'product-images' if 'products' doesn't exist?
            // For now, let's just report the error clearly.
            return NextResponse.json({ 
                error: "Storage upload failed. Ensure 'products' bucket exists in Supabase.", 
                details: uploadError.message 
            }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filename);

        console.log("[UPLOAD_DEBUG] Upload successful:", publicUrl);
        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error("[UPLOAD_ERROR]", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            details: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
