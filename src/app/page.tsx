import { query } from "@/lib/db";
import CyberLanding from "@/components/CyberLanding";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products: any[] = [];

  try {
    await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS "featuredRank" INTEGER');
    // Fetch latest products
    products = await query<any[]>(
      'SELECT * FROM products ORDER BY "featuredRank" ASC NULLS LAST, "isFeatured" DESC, "createdAt" DESC LIMIT 12'
    );
  } catch (e) {
    console.error("⛔ HOME_PAGE_DB_ERROR", e);
    // fail gracefully with empty list so the page still renders
    products = [];
  }

  return (
    <CyberLanding products={products} />
  );
}
