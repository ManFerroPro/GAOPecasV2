import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ArticleListClient from "@/components/artigos/ArticleListClient";

export default async function ArtigosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch items with all related data and counts
  const { data: items } = await supabase
    .from('items')
    .select(`
      *,
      families (name),
      sub_families (name),
      item_part_numbers (
        *,
        brands (name)
      ),
      item_comments (id),
      item_attachments (id, file_type, file_path, file_name)
    `)
    .order('omatapalo_code', { ascending: true });

  // Map the nested data to a flatter structure for the client component
  const mappedItems = items?.map(item => ({
    ...item,
    family_name: item.families?.name || item.family || "N/A",
    sub_family_name: item.sub_families?.name || item.sub_family || "---",
    item_part_numbers: item.item_part_numbers?.map((pn: any) => ({
      ...pn,
      brand_name: pn.brands?.name || "N/A"
    })) || [],
    item_comments_count: item.item_comments?.length || 0,
    // item_attachments is already available for icon logic
  })) || [];

  return (
    <div className="h-full w-full animate-in fade-in duration-500">
      <ArticleListClient initialItems={mappedItems} />
    </div>
  );
}
