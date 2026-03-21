"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// --- Families ---
export async function getFamilies() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('families').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createFamily(name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('families').insert({ name: name.toUpperCase() }).select().single();
  if (error) throw error;
  return data;
}

// --- Sub-families ---
export async function getSubFamilies(familyId?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let query = supabase.from('sub_families').select('*').order('name');
  if (familyId) query = query.eq('family_id', familyId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createSubFamily(familyId: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('sub_families').insert({ 
    family_id: familyId, 
    name: name.toUpperCase() 
  }).select().single();
  if (error) throw error;
  return data;
}

// --- Comments ---
export async function getItemComments(itemCode: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('item_comments')
    .select('*')
    .eq('item_code', itemCode)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function postItemComment(itemCode: string, content: string, userName: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('item_comments')
    .insert({
      item_code: itemCode,
      content,
      user_name: userName // Use auth.uid() in production, using user_name for dev
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/artigos");
  return data;
}
