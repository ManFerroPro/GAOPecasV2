"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// --- Families ---
export async function getFamilies() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  // Get families along with the count of items to display on the Hierarchies page, plus sub_families
  const { data, error } = await supabase.from('families').select('*, items(count), sub_families(*, items(count))').order('name');
  if (error) throw error;
  return data.map(f => ({ 
    ...f, 
    count: f.items?.[0]?.count || 0,
    sub_families: (f.sub_families || []).map((sf: any) => ({ ...sf, count: sf.items?.[0]?.count || 0 }))
  }));
}

export async function createFamily(name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('families').insert({ name: name.toUpperCase() }).select().single();
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  return data;
}

export async function updateFamily(id: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('families').update({ name: name.toUpperCase() }).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  return data;
}

export async function deleteFamily(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('families').delete().eq('id', id);
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  return { success: true };
}

// --- Sub-families ---
export async function getSubFamilies(familyId?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let query = supabase.from('sub_families').select('*, items(count)').order('name');
  if (familyId) query = query.eq('family_id', familyId);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(sf => ({ ...sf, count: sf.items?.[0]?.count || 0 }));
}

export async function createSubFamily(familyId: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('sub_families').insert({ 
    family_id: familyId, 
    name: name.toUpperCase() 
  }).select().single();
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  return data;
}

export async function updateSubFamily(id: string, familyId: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('sub_families').update({ 
    family_id: familyId,
    name: name.toUpperCase() 
  }).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  return data;
}

export async function deleteSubFamily(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('sub_families').delete().eq('id', id);
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  return { success: true };
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

export async function updateItemComment(id: string, content: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('item_comments')
    .update({ content })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/artigos");
  return data;
}

export async function deleteItemComment(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from('item_comments')
    .delete()
    .eq('id', id);
  if (error) throw error;
  revalidatePath("/artigos");
  return { success: true };
}
