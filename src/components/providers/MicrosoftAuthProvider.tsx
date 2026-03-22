"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { MsalProvider, useMsal, useAccount } from "@azure/msal-react";
import { IPublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { msalInstance, loginRequest } from "@/lib/msal";

interface MicrosoftAuthContextType {
  account: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const MicrosoftAuthContext = createContext<MicrosoftAuthContextType | undefined>(undefined);

export function MicrosoftAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <MicrosoftAuthInnerProvider>{children}</MicrosoftAuthInnerProvider>
    </MsalProvider>
  );
}

function MicrosoftAuthInnerProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    instance.initialize().then(() => {
        setIsInitialized(true);
    });
  }, [instance]);

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getToken = async () => {
    if (!account) return null;
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });
      return response.accessToken;
    } catch (error) {
      console.warn("Silent token acquisition failed, attempting popup:", error);
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error("Popup token acquisition failed:", popupError);
        return null;
      }
    }
  };

  return (
    <MicrosoftAuthContext.Provider value={{ account, login, logout, getToken }}>
      {isInitialized ? children : null}
    </MicrosoftAuthContext.Provider>
  );
}

export const useMicrosoftAuth = () => {
  const context = useContext(MicrosoftAuthContext);
  if (context === undefined) {
    throw new Error("useMicrosoftAuth must be used within a MicrosoftAuthProvider");
  }
  return context;
};
