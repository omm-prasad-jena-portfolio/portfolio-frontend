import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { unlockPrivate, checkPrivateSession, logoutPrivate } from "../services/api";

interface PrivateAuthContextType {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  unlock: (pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const PrivateAuthContext = createContext<PrivateAuthContextType | undefined>(undefined);

export const PrivateAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const checkSession = useCallback(async (): Promise<boolean> => {
    setIsCheckingSession(true);
    try {
      const res = await checkPrivateSession();
      setIsAuthenticated(res.authenticated);
      return res.authenticated;
    } catch {
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const unlock = async (pin: string) => {
    const res = await unlockPrivate(pin);
    if (res.authenticated) {
      setIsAuthenticated(true);
      setIsModalOpen(false);
      return { success: true };
    }
    return {
      success: false,
      message: res.message || "Incorrect PIN.",
    };
  };

  const logout = async () => {
    await logoutPrivate();
    setIsAuthenticated(false);
  };

  return (
    <PrivateAuthContext.Provider
      value={{
        isAuthenticated,
        isCheckingSession,
        isModalOpen,
        openModal,
        closeModal,
        unlock,
        logout,
        checkSession,
      }}
    >
      {children}
    </PrivateAuthContext.Provider>
  );
};

export const usePrivateAuth = (): PrivateAuthContextType => {
  const context = useContext(PrivateAuthContext);
  if (!context) {
    throw new Error("usePrivateAuth must be used within a PrivateAuthProvider");
  }
  return context;
};
