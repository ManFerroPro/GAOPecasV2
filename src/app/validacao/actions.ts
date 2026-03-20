"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("orders")
    .update({ 
      status, 
      notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (error) throw error;
  
  revalidatePath("/validacao");
  revalidatePath("/");
  
  return { success: true };
}
