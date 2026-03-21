"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateItemComment(id: string, content: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('item_comments')
    .update({ 
      content, 
      created_at: new Date().toISOString()
    })
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
  const { error } = await supabase.from('item_comments').delete().eq('id', id);
  if (error) throw error;
  revalidatePath("/artigos");
  return { success: true };
}
