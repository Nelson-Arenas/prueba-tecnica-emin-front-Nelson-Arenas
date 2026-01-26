import { create } from "zustand";

type EmpresaUIState = {
  open: boolean;
  openCreate: () => void;
  closeModal: () => void;
};

export const useEmpresaStore = create<EmpresaUIState>((set) => ({
  open: false,
  openCreate: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
