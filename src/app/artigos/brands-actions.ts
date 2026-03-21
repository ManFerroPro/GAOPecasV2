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
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}
