"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createBrand(brand: { name: string, description?: string }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('brands')
    .insert({
      name: brand.name.toUpperCase(),
      description: brand.description
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath("/artigos");
  return data;
}

export async function getBrands() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('brands')
    // We try to fetch the count of part numbers associated with this brand. Note: If the relation name differs in DB, this might need fallback logic.
    .select('*, item_part_numbers(count)')
    .order('name', { ascending: true });

  if (error) throw error;
  return data.map(b => ({ ...b, count: b.item_part_numbers?.[0]?.count || 0 }));
}

export async function updateBrand(id: string, name: string, description?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('brands')
    .update({ name: name.toUpperCase().trim(), description })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  return data;
}

export async function deleteBrand(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  return { success: true };
}
