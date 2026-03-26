import { createStore } from "zustand/vanilla";

export type RegisterFormState = {
  formData: {
    name: string;
    birthDate: string;
    email: string;
    phone: string;
    region: string;
    city: string;
    password: string;
  };
};

export type RegisterFormActions = {
  setFormData: (data: RegisterFormState) => void;
};

export type RegisterFormStore = RegisterFormState & RegisterFormActions;

export const defaultInitState: RegisterFormState = {
  formData: {
    name: "",
    birthDate: "",
    email: "",
    phone: "",
    region: "",
    city: "",
    password: "",
  },
};

export const createRegisterFormStore = (
  initState: RegisterFormState = defaultInitState
) => {
  return createStore<RegisterFormStore>()((set) => ({
    ...initState,
    setFormData: (data: RegisterFormState) => set((_) => data),
  }));
};
