// src/views/ActivoView.tsx
import { useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import AppLayout from "../layouts/appLayout";
import Modal from "../components/modal";
import FormActivoModal, { type FormActivoValues } from "../components/FormActivoModal";
import Swal from "sweetalert2";
import { isAxiosError } from "axios";

import {
  getActivos,
  createActivo,
  updateActivo,
  getActivoById,
  softdeleteActivo,
  type CreateActivoDTO,
  type ActivoStatus,
  type ActivoType,
} from "../api/eminApi";

import { useActivoStore } from "../store/activoStore"; // ✅ Zustand store

function statusClasses(status: ActivoStatus) {
  switch (status) {
    case "DISPONIBLE":
      return "bg-green-100 text-green-700";
    case "ASIGNADO":
      return "bg-yellow-100 text-yellow-700";
    case "MANTENCION":
      return "bg-orange-100 text-orange-700";
    case "BAJA":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatType(type: ActivoType) {
  const map: Record<ActivoType, string> = {
    NOTEBOOK: "Notebook",
    MONITOR: "Monitor",
    LICENCIA: "Licencia",
    PERIFERICO: "Periférico",
    OTRO: "Otro",
  };
  return map[type];
}

// helper: ISO -> yyyy-mm-dd para input[type="date"]
function toDateInputValue(iso?: string | Date) {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type ActivosResponse = {
  items: any[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_OPTIONS: Array<{ value: "" | ActivoStatus; label: string }> = [
  { value: "", label: "Todos" },
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "ASIGNADO", label: "Asignado" },
  { value: "MANTENCION", label: "Mantención" },
  { value: "BAJA", label: "Baja" },
];

const TYPE_OPTIONS: Array<{ value: "" | ActivoType; label: string }> = [
  { value: "", label: "Todos" },
  { value: "NOTEBOOK", label: "Notebook" },
  { value: "MONITOR", label: "Monitor" },
  { value: "LICENCIA", label: "Licencia" },
  { value: "PERIFERICO", label: "Periférico" },
  { value: "OTRO", label: "Otro" },
];

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error) && error.response) {
    const data: any = error.response.data;
    return data?.message || data?.error || "Ocurrió un error en el servidor.";
  }
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}

export default function ActivoView() {
  // ✅ Zustand UI state (modal + edición + filtros + paginación)
  const open = useActivoStore((s) => s.open);
  const editingId = useActivoStore((s) => s.editingId);

  const q = useActivoStore((s) => s.q);
  const debouncedQ = useActivoStore((s) => s.debouncedQ);
  const statusFilter = useActivoStore((s) => s.statusFilter);
  const typeFilter = useActivoStore((s) => s.typeFilter);
  const page = useActivoStore((s) => s.page);
  const limit = useActivoStore((s) => s.limit);

  const setQ = useActivoStore((s) => s.setQ);
  const setDebouncedQ = useActivoStore((s) => s.setDebouncedQ);
  const setStatusFilter = useActivoStore((s) => s.setStatusFilter);
  const setTypeFilter = useActivoStore((s) => s.setTypeFilter);
  const setPage = useActivoStore((s) => s.setPage);
  const setLimit = useActivoStore((s) => s.setLimit);

  const openCreate = useActivoStore((s) => s.openCreate);
  const openEdit = useActivoStore((s) => s.openEdit);
  const closeModal = useActivoStore((s) => s.closeModal);

  const resetToFirstPage = useActivoStore((s) => s.resetToFirstPage);

  // debounce para no spamear backend
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q, setDebouncedQ]);

  // si cambian filtros/búsqueda/limit -> volver a página 1
  useEffect(() => {
    resetToFirstPage();
  }, [debouncedQ, statusFilter, typeFilter, limit, resetToFirstPage]);

  const queryClient = useQueryClient();

  // ✅ LISTA paginada + buscable
  const {
    data: activosResp,
    isLoading,
    isError,
  } = useQuery<ActivosResponse>({
    queryKey: ["activosData", { page, limit, q: debouncedQ, statusFilter, typeFilter }],
    queryFn: () =>
      getActivos({
        page,
        limit,
        q: debouncedQ || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
    retry: true,
  });

  const items = activosResp?.items ?? [];
  const total = activosResp?.total ?? 0;
  const totalPages = activosResp?.totalPages ?? 1;

  // ✅ Traer activo por id solo cuando se edita y modal está abierto
  const {
    data: activoEditing,
    isLoading: isLoadingActivoEditing,
    isError: isErrorActivoEditing,
  } = useQuery({
    queryKey: ["activoById", editingId],
    queryFn: () => getActivoById(editingId as string),
    enabled: open && !!editingId,
    retry: true,
  });

  // ✅ Create
  const createMutation = useMutation({
    mutationFn: createActivo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activosData"] });
    },
  });

  // ✅ Update
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateActivoDTO }) =>
      updateActivo(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activosData"] });
      await queryClient.invalidateQueries({ queryKey: ["activoById", editingId] });
    },
  });

  // ✅ Soft Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => softdeleteActivo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activosData"] });
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "Activo eliminado exitosamente.",
        confirmButtonColor: "#184E8B",
      });
    },
    onError: (error) => {
      console.error("[DELETE mutation] error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getApiErrorMessage(error) || "No se pudo eliminar el activo.",
        confirmButtonColor: "#184E8B",
      });
    },
  });

  async function handleDelete(activo: any) {
    const id = (activo?._id ?? activo?.id) as string;

    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo obtener el ID del activo a eliminar.",
        confirmButtonColor: "#184E8B",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar activo?",
      text: `Se eliminará el activo ${activo?.code ?? ""} (${activo?.name ?? ""}).`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#184E8B",
    });

    if (result.isConfirmed) deleteMutation.mutate(id);
  }

  const isEditMode = !!editingId;

  // ✅ defaultValues para FormActivoModal cuando editas
  const defaultValues = useMemo<Partial<FormActivoValues> | undefined>(() => {
    if (!activoEditing) return undefined;

    return {
      code: activoEditing.code ?? "",
      name: activoEditing.name ?? "",
      type: activoEditing.type ?? "NOTEBOOK",
      brand: activoEditing.brand ?? "",
      model: activoEditing.model ?? "",
      serialNumber: activoEditing.serialNumber ?? "",
      status: activoEditing.status ?? "DISPONIBLE",
      purchaseDate: toDateInputValue(activoEditing.purchaseDate),
      company:
        typeof activoEditing.company === "object"
          ? (activoEditing.company as { _id?: string })?._id ?? ""
          : activoEditing.company ?? "",
      location: activoEditing.location ?? "",
      assignedUser:
        (activoEditing.assignedUser &&
          (typeof activoEditing.assignedUser === "object"
            ? (activoEditing.assignedUser as { _id?: string })._id
            : activoEditing.assignedUser)) ||
        "",
      notes: activoEditing.notes ?? "",
    };
  }, [activoEditing]);

  const modalLoading = createMutation.isPending || updateMutation.isPending;

  // UI helper para “Asignado a”
  const renderAssignedUser = (activo: any) => {
    const au = activo?.assignedUser;
    if (!au) return "—";
    if (typeof au === "object") {
      const fullName = `${au.name ?? ""} ${au.lastName ?? ""}`.trim();
      return fullName || au.email || "—";
    }
    return String(au);
  };

  // ✅ UI helper para “Empresa”
  const renderCompany = (activo: any) => {
    const c = activo?.company;
    if (!c) return "—";
    if (typeof c === "object") {
      return c.name || c._id || "—";
    }
    return String(c);
  };

  // ✅ SUBMIT CENTRALIZADO con Swal (como login)
  const handleFormSubmit = async (payload: CreateActivoDTO) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: editingId as string, payload });
        await Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "Activo actualizado correctamente.",
          confirmButtonColor: "#184E8B",
        });
      } else {
        await createMutation.mutateAsync(payload);
        await Swal.fire({
          icon: "success",
          title: "Creado",
          text: "Activo creado correctamente.",
          confirmButtonColor: "#184E8B",
        });
      }

      // cerrar solo si fue OK
      closeModal();
    } catch (error) {
      console.error("[SAVE] error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getApiErrorMessage(error) || "No se pudo guardar el activo.",
        confirmButtonColor: "#184E8B",
      });
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-[#184E8B]">Activos</h1>

        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#184E8B] hover:opacity-90"
        >
          + Nuevo activo
        </button>
      </div>

      {/* 🔎 Buscador + filtros + page size */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por código, nombre, serie, marca, modelo, ubicación..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#184E8B]/30"
          />
          <p className="mt-1 text-xs text-gray-500">
            Mostrando {items.length} de {total} resultados
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#184E8B]/30"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              Estado: {o.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#184E8B]/30"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                Tipo: {o.label}
              </option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#184E8B]/30"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / pág.
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <div className="text-sm text-gray-600">Cargando activos...</div>}

      {isError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Error cargando activos.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl mt-2">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Marca / Modelo
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    N° Serie
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Ubicación
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Empresa
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Asignado a
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {items.map((activo: any) => (
                  <tr key={(activo._id ?? activo.id) as string} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">{activo.code}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{activo.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatType(activo.type)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      <div>
                        <div className="font-medium text-gray-700">{activo.brand ?? "—"}</div>
                        <div className="text-xs text-gray-400">{activo.model ?? "—"}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{activo.serialNumber}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{activo.location}</td>

                    <td className="px-5 py-4 text-sm text-gray-500">{renderCompany(activo)}</td>

                    <td className="px-5 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses(
                          activo.status
                        )}`}
                      >
                        {activo.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{renderAssignedUser(activo)}</td>

                    <td className="px-5 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(activo)}
                          disabled={deleteMutation.isPending}
                          className="px-3 py-1 text-xs border border-red-200 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-60"
                        >
                          {deleteMutation.isPending ? "Borrando..." : "Borrar"}
                        </button>

                        <button
                          onClick={() => openEdit((activo._id ?? activo.id) as string)}
                          className="px-3 py-1 text-xs border rounded-md hover:bg-gray-100"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-sm text-gray-500" colSpan={10}>
                      No hay activos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 📄 Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <div className="text-xs text-gray-500">
              Página <span className="font-medium text-gray-800">{page}</span> de{" "}
              <span className="font-medium text-gray-800">{totalPages}</span> · Total{" "}
              <span className="font-medium text-gray-800">{total}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {getPageWindow(page, totalPages, 5).map((p) =>
                  p === "..." ? (
                    <span key={`dots-${Math.random()}`} className="px-2 text-xs text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-xs border rounded-md hover:bg-gray-50 ${
                        p === page ? "bg-gray-100 font-semibold" : ""
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal
        open={open}
        onClose={closeModal}
        title={isEditMode ? "Editar activo" : "Nuevo activo"}
        description={
          isEditMode ? "Modifica los datos del activo seleccionado." : "Completa los datos para registrar un activo."
        }
        confirmText={isEditMode ? "Guardar cambios" : "Crear"}
        cancelText="Cancelar"
        size="lg"
        loading={modalLoading}
        showFooter={false}
      >
        {isEditMode && isLoadingActivoEditing && (
          <div className="text-sm text-gray-600">Cargando datos del activo...</div>
        )}

        {isEditMode && isErrorActivoEditing && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Error obteniendo el activo para editar.
          </div>
        )}

        {(createMutation.isError || updateMutation.isError) && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {isEditMode
              ? "Error actualizando el activo. Revisa los datos o intenta nuevamente."
              : "Error creando el activo. Revisa los datos o intenta nuevamente."}
          </div>
        )}

        {(!isEditMode || (!!activoEditing && !isLoadingActivoEditing)) && (
          <FormActivoModal defaultValues={defaultValues} loading={modalLoading} onSubmit={handleFormSubmit} />
        )}

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={closeModal}
            disabled={modalLoading}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => document.querySelector("form")?.requestSubmit()}
            disabled={modalLoading || (isEditMode && isLoadingActivoEditing)}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#184E8B] hover:opacity-90 disabled:opacity-60"
          >
            {modalLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear"}
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}

/**
 * Devuelve una ventana de páginas centrada en current.
 * Ej: current=6 total=20 size=5 -> [4,5,6,7,8]
 * Con puntos suspensivos cuando corresponde.
 */
function getPageWindow(current: number, total: number, size: number): Array<number | "..."> {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);

  const half = Math.floor(size / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + size - 1);

  if (end - start + 1 < size) start = Math.max(1, end - size + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const out: Array<number | "..."> = [];
  if (start > 1) {
    out.push(1);
    if (start > 2) out.push("...");
  }
  out.push(...pages);
  if (end < total) {
    if (end < total - 1) out.push("...");
    out.push(total);
  }
  return out;
}
