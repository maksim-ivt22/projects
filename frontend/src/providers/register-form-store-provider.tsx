"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  type RegisterFormStore,
  createRegisterFormStore,
} from "@/stores/register-form-store";

export type RegisterFormStoreApi = ReturnType<typeof createRegisterFormStore>;

export const RegisterFormStoreContext = createContext<
  RegisterFormStoreApi | undefined
>(undefined);

export interface RegisterFormStoreProviderProps {
  children: ReactNode;
}

export const RegisterFormStoreProvider = ({
  children,
}: RegisterFormStoreProviderProps) => {
  const storeRef = useRef<RegisterFormStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createRegisterFormStore();
  }

  return (
    <RegisterFormStoreContext.Provider value={storeRef.current}>
      {children}
    </RegisterFormStoreContext.Provider>
  );
};

export const useRegisterFormStore = <T,>(
  selector: (store: RegisterFormStore) => T
): T => {
  const registerFormStoreContext = useContext(RegisterFormStoreContext);

  if (!registerFormStoreContext) {
    throw new Error(
      `useRegisterFormStore must be used within RegisterFormStoreProvider`
    );
  }

  return useStore(registerFormStoreContext, selector);
};
