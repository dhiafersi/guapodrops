import { query } from "@/lib/db";
import CyberLanding from "@/components/CyberLanding";

export default async function Home() {
  // Fetch latest products
  const products = await query<any[]>('SELECT * FROM products ORDER BY createdAt DESC LIMIT 12');

  return (
    <CyberLanding products={products} />
  );
}
