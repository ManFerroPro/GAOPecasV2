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

export async function saveAttachment(itemCode: string, fileType: 'image' | 'document', filePath: string, fileName: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase
    .from('item_attachments')
    .insert({
      item_code: itemCode,
      file_type: fileType,
      file_path: filePath,
      file_name: fileName
    })
    .select()
    .single();

  if (error) {
    console.error("Error in saveAttachment:", error);
    throw error;
  }
  revalidatePath("/artigos");
  return data;
}

import { unstable_noStore as noStore } from "next/cache";

export async function getAttachments(itemCode: string) {
  noStore();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase
    .from('item_attachments')
    .select('*')
    .eq('item_code', itemCode)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteAttachment(id: string, filePath: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // 1. Delete from Storage (Expects path, not URL, assuming filePath is the path)
  // Wait, if filePath is a URL, we need to extract the path.
  // But let's assume we store the relative path or can handle it.
  
  // Actually, we should probably pass the relative path.
  
  const { error: storageError } = await supabase.storage
    .from('artigos')
    .remove([filePath]);

  if (storageError) console.error("Storage delete error (non-fatal):", storageError);

  // 2. Delete from DB
  const { data, error: dbError } = await supabase
    .from('item_attachments')
    .delete()
    .eq('id', id)
    .select();

  if (dbError) throw dbError;
  
  if (!data || data.length === 0) {
    throw new Error(`O anexo com ID ${id} não pôde ser eliminado da base de dados (RLS ativo ou ID inexistente).`);
  }
  
  revalidatePath("/artigos");
  return { success: true };
}
