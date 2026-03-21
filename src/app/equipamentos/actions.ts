"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function upsertEquipment(eq: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('equipment')
    .upsert({
      mobile_id: eq.mobile_id,
      license_plate: eq.license_plate,
      vin: eq.vin,
      brand: eq.brand,
      model: eq.model,
      year: parseInt(eq.year) || null,
      engine_no: eq.engine_no,
      observations: eq.observations,
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

  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('mobile_id', id);

  if (error) throw error;
  
  revalidatePath("/equipamentos");
  return { success: true };
}
