"use client";

import { useState, useEffect } from "react";

interface AppConfig {
  primaryColor: string;
  logoUrl: string;
  appName: string;
}

const DEFAULT_CONFIG: AppConfig = {
  primaryColor: "#2563eb",
  logoUrl: "/logo.png",
  appName: "GAO Peças",
};

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // In the future, fetch from Supabase 'global_config' table
    // For now, use default configuration
    const fetchConfig = async () => {
      // Mock fetch
      // const { data } = await supabase.from('global_config').select('*');
      setConfig(DEFAULT_CONFIG);
    };

    fetchConfig();
  }, []);

  return config;
}
