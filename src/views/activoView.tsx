// src/views/ActivoView.tsx
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import AppLayout from "../layouts/appLayout";
import Modal from "../components/modal";
import FormActivoModal from "../components/FormActivoModal";
import {
  getActivos,
  createActivo,
  type CreateActivoDTO,
  type ActivoStatus,
  type ActivoType,
} from "../api/eminApi";

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

export default function ActivoView() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["activosData"],
    queryFn: getActivos,
    retry: true,
  });

  const createMutation = useMutation({
    mutationFn: createActivo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activosData"] });
      setOpen(false);
    },
  });

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-[#184E8B]">Activos</h1>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#184E8B] hover:opacity-90"
        >
          + Nuevo activo
        </button>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-600">Cargando activos...</div>
      )}

      {isError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Error cargando activos.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl mt-4">
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
                    Estado
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {data?.map((activo) => (
                  <tr key={activo.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {activo.code}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {activo.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatType(activo.type)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      <div>
                        <div className="font-medium text-gray-700">
                          {activo.brand ?? "—"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {activo.model ?? "—"}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {activo.serialNumber}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {activo.location}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses(
                          activo.status
                        )}`}
                      >
                        {activo.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs border rounded-md hover:bg-gray-100">
                          Ver
                        </button>
                        <button className="px-3 py-1 text-xs border rounded-md hover:bg-gray-100">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-sm text-gray-500" colSpan={8}>
                      No hay activos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo activo"
        description="Completa los datos para registrar un activo."
        confirmText="Crear"
        cancelText="Cancelar"
        size="lg"
        loading={createMutation.isPending}
        showFooter={false}
      >
        {createMutation.isError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Error creando el activo. Revisa los datos o intenta nuevamente.
          </div>
        )}

        <FormActivoModal
          loading={createMutation.isPending}
          onSubmit={(payload: CreateActivoDTO) => createMutation.mutate(payload)}
        />

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={createMutation.isPending}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              const formEl = document.querySelector("form");
              formEl?.requestSubmit();
            }}
            disabled={createMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#184E8B] hover:opacity-90 disabled:opacity-60"
          >
            {createMutation.isPending ? "Creando..." : "Crear"}
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
