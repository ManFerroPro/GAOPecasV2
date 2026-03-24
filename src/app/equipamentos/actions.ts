"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ─── EQUIPMENT CRUD ────────────────────────────────────────────────────────────

export async function upsertEquipment(eq: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment')
    .upsert({
      mobile_id: eq.mobile_id,
      license_plate: eq.license_plate || null,
      vin: eq.vin || null,
      year: parseInt(eq.year) || null,
      engine_no: eq.engine_no || null,
      observations: eq.observations || null,
      brand_id: eq.brand_id || null,
      model_id: eq.model_id || null,
      type_id: eq.type_id || null,
      category_id: eq.category_id || null,
      subcategory_id: eq.subcategory_id || null,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/equipamentos");
  return data;
}

export async function deleteEquipment(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('equipment').delete().eq('mobile_id', id);
  if (error) throw error;

  revalidatePath("/equipamentos");
  return { success: true };
}

// ─── BRANDS & MODELS ──────────────────────────────────────────────────────────

export async function getBrandsWithModels() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment_brands')
    .select('*, equipment_models(*)')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertBrand(name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment_brands')
    .insert({ name: name.toUpperCase().trim() })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/equipamentos");
  return data;
}

export async function upsertModel(brandId: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment_models')
    .insert({ brand_id: brandId, name: name.toUpperCase().trim() })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/equipamentos");
  return data;
}

// ─── TYPES / CATEGORIES / SUBCATEGORIES ───────────────────────────────────────

export async function getEquipmentTypesHierarchy() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment_types')
    .select('*, equipment_categories(*, equipment_subcategories(*))')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertEquipmentType(name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment_types')
    .insert({ name: name.toUpperCase().trim() })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/equipamentos");
  return data;
}

export async function upsertEquipmentCategory(typeId: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment_categories')
    .insert({ type_id: typeId, name: name.toUpperCase().trim() })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/equipamentos");
  return data;
}

export async function upsertEquipmentSubcategory(categoryId: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment_subcategories')
    .insert({ category_id: categoryId, name: name.toUpperCase().trim() })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/equipamentos");
  return data;
}
