import { create } from "zustand";
import type { ActivoStatus, ActivoType } from "../api/eminApi";

type ActivoUIState = {
  // modal + edición
  open: boolean;
  editingId: string | null;

  // filtros/búsqueda/paginación
  q: string;
  debouncedQ: string;
  statusFilter: "" | ActivoStatus;
  typeFilter: "" | ActivoType;
  page: number;
  limit: number;

  // actions modal
  openCreate: () => void;
  openEdit: (id: string) => void;
  closeModal: () => void;

  // actions filtros/paginación
  setQ: (q: string) => void;
  setDebouncedQ: (q: string) => void;
  setStatusFilter: (s: "" | ActivoStatus) => void;
  setTypeFilter: (t: "" | ActivoType) => void;
  setPage: (p: number) => void;
  setLimit: (n: number) => void;

  // helpers
  resetToFirstPage: () => void;
};

export const useActivoStore = create<ActivoUIState>((set) => ({
  // initial
  open: false,
  editingId: null,

  q: "",
  debouncedQ: "",
  statusFilter: "",
  typeFilter: "",
  page: 1,
  limit: 10,

  // modal actions
  openCreate: () => set({ editingId: null, open: true }),
  openEdit: (id) => set({ editingId: id, open: true }),
  closeModal: () => set({ open: false, editingId: null }),

  // filter actions
  setQ: (q) => set({ q }),
  setDebouncedQ: (debouncedQ) => set({ debouncedQ }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),

  resetToFirstPage: () => set({ page: 1 }),
}));
