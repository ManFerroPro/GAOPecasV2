"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback } from "react";

export function useSupabaseStorage() {
  const supabase = createClient();

  const uploadFile = useCallback(async (bucket: string, path: string, file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Storage upload error:", error);
      throw error;
    }
  }, [supabase]);

  const getPublicUrl = useCallback((bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }, [supabase]);

  return { uploadFile, getPublicUrl };
}
