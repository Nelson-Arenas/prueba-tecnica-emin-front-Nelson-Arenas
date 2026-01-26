// src/views/EmpresaView.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../layouts/appLayout";
import Modal from "../components/modal";
import FormEmpresaModal, { type FormEmpresaValues } from "../components/FormEmpresaModal";
import { getCompanies, createCompany } from "../api/eminApi";

import { useEmpresaStore } from "../store/empresaStore"; // ✅ Zustand

export default function EmpresaView() {
  const open = useEmpresaStore((s) => s.open);
  const openCreate = useEmpresaStore((s) => s.openCreate);
  const closeModal = useEmpresaStore((s) => s.closeModal);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["companiesData"],
    queryFn: getCompanies,
    retry: true,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCompany(name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companiesData"] });
      closeModal(); // ✅ ahora cierra con Zustand
    },
  });

  const modalLoading = createMutation.isPending;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-[#184E8B]">Empresas</h1>

        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#184E8B] hover:opacity-90"
        >
          + Nueva empresa
        </button>
      </div>

      {isLoading && <div className="text-sm text-gray-600">Cargando empresas...</div>}

      {isError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Error cargando empresas.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl mt-2">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Creada
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {(data ?? []).map((c: any) => {
                  const id = c?._id ?? c?.id;
                  const createdAt = c?.createdAt ? new Date(c.createdAt) : null;

                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">
                        {c?.name ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {createdAt ? createdAt.toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })}

                {(data ?? []).length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-sm text-gray-500" colSpan={2}>
                      No hay empresas registradas.
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
        onClose={closeModal}
        title="Nueva empresa"
        description="Ingresa el nombre para registrar una empresa."
        confirmText="Crear"
        cancelText="Cancelar"
        size="md"
        loading={modalLoading}
        showFooter={false}
      >
        {createMutation.isError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Error creando la empresa. Revisa los datos o intenta nuevamente.
          </div>
        )}

        <FormEmpresaModal
          loading={modalLoading}
          onSubmit={(values: FormEmpresaValues) => {
            const name = values.name.trim();
            if (!name) return;
            createMutation.mutate(name);
          }}
        />

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
            disabled={modalLoading}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#184E8B] hover:opacity-90 disabled:opacity-60"
          >
            {modalLoading ? "Creando..." : "Crear"}
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
