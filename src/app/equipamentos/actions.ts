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
    .select('*, equipment(count), equipment_models(*, equipment(count))')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(b => ({
    ...b,
    count: b.equipment?.[0]?.count || 0,
    equipment_models: (b.equipment_models || []).map((m: any) => ({ ...m, count: m.equipment?.[0]?.count || 0 }))
  }));
}

export async function upsertBrand(name: string, id?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const payload: any = { name: name.toUpperCase().trim() };
  if (id) payload.id = id;

  const { data, error } = await supabase
    .from('equipment_brands')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return data;
}

export async function deleteBrand(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('equipment_brands').delete().eq('id', id);
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return { success: true };
}

export async function upsertModel(brandId: string, name: string, id?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const payload: any = { brand_id: brandId, name: name.toUpperCase().trim() };
  if (id) payload.id = id;

  const { data, error } = await supabase
    .from('equipment_models')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return data;
}

export async function deleteModel(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('equipment_models').delete().eq('id', id);
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return { success: true };
}

// ─── TYPES / CATEGORIES / SUBCATEGORIES ───────────────────────────────────────

export async function getEquipmentTypesHierarchy() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment_types')
    .select('*, equipment(count), equipment_categories(*, equipment(count), equipment_subcategories(*, equipment(count)))')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(t => ({
    ...t,
    count: t.equipment?.[0]?.count || 0,
    equipment_categories: (t.equipment_categories || []).map((c: any) => ({
      ...c,
      count: c.equipment?.[0]?.count || 0,
      equipment_subcategories: (c.equipment_subcategories || []).map((sc: any) => ({
        ...sc,
        count: sc.equipment?.[0]?.count || 0
      }))
    }))
  }));
}

export async function upsertEquipmentType(name: string, id?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const payload: any = { name: name.toUpperCase().trim() };
  if (id) payload.id = id;

  const { data, error } = await supabase
    .from('equipment_types')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return data;
}

export async function deleteEquipmentType(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('equipment_types').delete().eq('id', id);
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return { success: true };
}

export async function upsertEquipmentCategory(typeId: string, name: string, id?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const payload: any = { type_id: typeId, name: name.toUpperCase().trim() };
  if (id) payload.id = id;

  const { data, error } = await supabase
    .from('equipment_categories')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return data;
}

export async function deleteEquipmentCategory(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('equipment_categories').delete().eq('id', id);
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return { success: true };
}

export async function upsertEquipmentSubcategory(categoryId: string, name: string, id?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const payload: any = { category_id: categoryId, name: name.toUpperCase().trim() };
  if (id) payload.id = id;

  const { data, error } = await supabase
    .from('equipment_subcategories')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return data;
}

export async function deleteEquipmentSubcategory(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('equipment_subcategories').delete().eq('id', id);
  if (error) throw error;
  revalidatePath("/configuracoes/hierarquias");
  revalidatePath("/equipamentos");
  return { success: true };
}
