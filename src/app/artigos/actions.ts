"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function upsertArticle(article: any, partNumbers: any[]) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Upsert main article (Force UPPERCASE for integrity)
  const { data: item, error: itemError } = await supabase
    .from('items')
    .upsert({
      omatapalo_code: article.omatapalo_code.toUpperCase(),
      description: article.description.toUpperCase(),
      family_id: article.family_id,
      sub_family_id: article.sub_family_id,
      family: article.family?.toUpperCase(), // Legacy field support
      sub_family: article.sub_family?.toUpperCase(), // Legacy field support
      unit: article.unit.toUpperCase(),
      internal_notes: article.notes?.toUpperCase(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (itemError) throw itemError;

  // 2. Sync Part Numbers (Delete existing and insert new)
  // We delete first to keep it simple for sync
  const { error: deleteError } = await supabase
    .from('item_part_numbers')
    .delete()
    .eq('item_code', article.omatapalo_code);

  if (deleteError) throw deleteError;

  if (partNumbers && partNumbers.length > 0) {
    const { error: insertError } = await supabase
      .from('item_part_numbers')
      .insert(
        partNumbers.map(pn => ({
          item_code: article.omatapalo_code,
          brand_id: pn.brand_id,
          part_number: pn.part_number,
          description: pn.description
        }))
      );

    if (insertError) throw insertError;
  }
  
  revalidatePath("/artigos");
  return item;
}

export async function deleteArticle(code: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('omatapalo_code', code);

  if (error) throw error;
  
  revalidatePath("/artigos");
  return { success: true };
}
