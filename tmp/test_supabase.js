const { createClient } = require("@supabase/supabase-js");
const path = require("path");

async function testSupabase() {
    const supabaseUrl = process.env.DATABASE_SUPABASE_URL;
    const supabaseKey = process.env.DATABASE_SUPABASE_SERVICE_ROLE_KEY;

    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase Key length:", supabaseKey?.length);

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log("Checking buckets...");
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.error("Error listing buckets:", error);
            return;
        }

        console.log("Existing buckets:", data.map(b => b.name));
        
        const hasProducts = data.some(b => b.name === 'products');
        if (!hasProducts) {
            console.log("Creating 'products' bucket...");
            const { data: createData, error: createError } = await supabase.storage.createBucket('products', {
                public: true
            });
            if (createError) {
                console.error("Error creating bucket:", createError);
            } else {
                console.log("Bucket 'products' created successfully.");
            }
        } else {
            console.log("'products' bucket already exists.");
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testSupabase();
