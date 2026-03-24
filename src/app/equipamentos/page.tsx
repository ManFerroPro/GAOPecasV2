import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import EquipmentListClient from "@/components/equipamentos/EquipmentListClient";
import { getBrandsWithModels, getEquipmentTypesHierarchy } from "@/app/equipamentos/actions";

export default async function EquipamentosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: equipment }, brands, types] = await Promise.all([
    supabase
      .from('equipment')
      .select(`
        *,
        equipment_brands (id, name),
        equipment_models (id, name),
        equipment_types (id, name),
        equipment_categories (id, name),
        equipment_subcategories (id, name)
      `)
      .order('mobile_id', { ascending: true }),
    getBrandsWithModels(),
    getEquipmentTypesHierarchy(),
  ]);

  const mappedEquipment = (equipment || []).map(eq => ({
    ...eq,
    brand_id: eq.brand_id,
    brand_name: eq.equipment_brands?.name || null,
    model_id: eq.model_id,
    model_name: eq.equipment_models?.name || null,
    type_id: eq.type_id,
    type_name: eq.equipment_types?.name || null,
    category_id: eq.category_id,
    category_name: eq.equipment_categories?.name || null,
    subcategory_id: eq.subcategory_id,
    subcategory_name: eq.equipment_subcategories?.name || null,
  }));

  return (
    <div className="h-full w-full animate-in fade-in duration-500">
      <EquipmentListClient
        initialItems={mappedEquipment}
        initialBrands={brands}
        initialTypes={types}
      />
    </div>
  );
}
