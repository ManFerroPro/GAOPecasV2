"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppIdentity {
  appName: string;
  appSubtitle: string;
  appLogo: string | null;
}

interface AppIdentityContextType extends AppIdentity {
  updateIdentity: (data: Partial<AppIdentity>) => void;
}

const defaultState: AppIdentity = {
  appName: "GAO PEÇAS",
  appSubtitle: "Gestão de Armazéns Omatapalo",
  appLogo: null,
};

const AppIdentityContext = createContext<AppIdentityContextType>({
  ...defaultState,
  updateIdentity: () => {},
});

export const useAppIdentity = () => useContext(AppIdentityContext);

export function AppIdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<AppIdentity>(defaultState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("gao-app-identity");
    if (stored) {
      try {
        setIdentity({ ...defaultState, ...JSON.parse(stored) });
      } catch (e) {
        console.error("Failed to parse app identity", e);
      }
    }
  }, []);

  const updateIdentity = (data: Partial<AppIdentity>) => {
    setIdentity((prev) => {
      const next = { ...prev, ...data };
      localStorage.setItem("gao-app-identity", JSON.stringify(next));
      return next;
    });
  };

  // Prevent hydration mismatch by using default state until mount
  // Although context doesn't strictly need this, if we use it in layout it might mismatch.
  // Actually, returning children immediately is fine; the useEffect updates state post-hydration.

  return (
    <AppIdentityContext.Provider value={{ ...identity, updateIdentity }}>
      {children}
    </AppIdentityContext.Provider>
  );
}
