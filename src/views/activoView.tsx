// src/views/ActivoView.tsx
import { useMemo, useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import AppLayout from "../layouts/appLayout";
import Modal from "../components/modal";
import FormActivoModal, { type FormActivoValues } from "../components/FormActivoModal";

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
import Swal from "sweetalert2";

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

export default function ActivoView() {
    const [open, setOpen] = useState(false);

    // ✅ cuando esto tiene valor => modo editar
    const [editingId, setEditingId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["activosData"],
        queryFn: getActivos,
        retry: true,
    });

    // ✅ Traer activo por id solo cuando se edita y modal está abierto
    const {
        data: activoEditing,
        isLoading: isLoadingActivoEditing,
        isError: isErrorActivoEditing,
    } = useQuery({
        queryKey: ["activoById", editingId],
        queryFn: () => getActivoById(editingId as string),
        enabled: open && !!editingId, // 👈 importante
        retry: true,
    });

    // ✅ Create
    const createMutation = useMutation({
        mutationFn: createActivo,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["activosData"] });
            setOpen(false);
            setEditingId(null);
        },
    });

    // ✅ Update
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: CreateActivoDTO }) =>
            updateActivo(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["activosData"] });
            await queryClient.invalidateQueries({ queryKey: ["activoById", editingId] });
            setOpen(false);
            setEditingId(null);
        },
    });


    async function handleDelete(activo: any) {
        console.log("[DELETE] activo completo:", activo);

        const id = activo?._id ?? activo?.id;

        console.log("[DELETE] id resuelto:", id);

        if (!id) {
            console.error("[DELETE] ERROR: id indefinido");
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

        if (result.isConfirmed) {
            console.log("[DELETE] enviando id a API:", id);
            deleteMutation.mutate(id);
        }
    }


    // ✅ Soft Delete

    const deleteMutation = useMutation({
        mutationFn: (id: string) => {
            console.log("[DELETE mutation] id recibido:", id);
            return softdeleteActivo(id);
        },
        onSuccess: async (data) => {
            console.log("[DELETE mutation] success:", data);
            await queryClient.invalidateQueries({ queryKey: ["activosData"] });
        },
        onError: (error) => {
            console.error("[DELETE mutation] error:", error);
        },
    });



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
            company: typeof activoEditing.company === 'object' ? (activoEditing.company as { _id?: string })?._id ?? "" : activoEditing.company ?? "", // por si viene populado o string
            location: activoEditing.location ?? "",
            assignedUser:
                (activoEditing.assignedUser && (typeof activoEditing.assignedUser === 'object' ? (activoEditing.assignedUser as { _id?: string })._id : activoEditing.assignedUser)) ||
                "", // "" => sin asignar
            notes: activoEditing.notes ?? "",
        };
    }, [activoEditing]);

    function openCreate() {
        setEditingId(null);
        setOpen(true);
    }

    function openEdit(id: string) {
        setEditingId(id);
        setOpen(true);
    }

    function closeModal() {
        setOpen(false);
        setEditingId(null);
    }

    const modalLoading = createMutation.isPending || updateMutation.isPending;

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

            {isLoading && <div className="text-sm text-gray-600">Cargando activos...</div>}

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
                                        Asignado a
                                    </th>
                                    <th className="px-5 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {data?.map((activo) => (
                                    <tr key={activo.id} className="hover:bg-gray-50">
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
                                        <td className="px-5 py-4 text-sm">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses(
                                                    activo.status
                                                )}`}
                                            >
                                                {activo.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500">
                                            {(() => {
                                                const au = (activo as any).assignedUser;

                                                if (!au) return "—";

                                                // Si viene populate (objeto)
                                                if (typeof au === "object") {
                                                    const fullName = `${au.name ?? ""} ${au.lastName ?? ""}`.trim();
                                                    return fullName || au.email || "—";
                                                }

                                                // Si viene solo el id
                                                return String(au);
                                            })()}
                                        </td>

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
                                                    onClick={() => openEdit((activo as any)._id)}
                                                    className="px-3 py-1 text-xs border rounded-md hover:bg-gray-100"
                                                >
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
                {/* Si estamos editando, primero cargamos el activo */}
                {isEditMode && isLoadingActivoEditing && (
                    <div className="text-sm text-gray-600">Cargando datos del activo...</div>
                )}

                {isEditMode && isErrorActivoEditing && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Error obteniendo el activo para editar.
                    </div>
                )}

                {/* Mostrar errores de create/update */}
                {(createMutation.isError || updateMutation.isError) && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {isEditMode
                            ? "Error actualizando el activo. Revisa los datos o intenta nuevamente."
                            : "Error creando el activo. Revisa los datos o intenta nuevamente."}
                    </div>
                )}

                {/* Form */}
                {(!isEditMode || (!!activoEditing && !isLoadingActivoEditing)) && (
                    <FormActivoModal
                        defaultValues={defaultValues}
                        loading={modalLoading}
                        onSubmit={(payload: CreateActivoDTO) => {
                            if (isEditMode) {
                                updateMutation.mutate({ id: editingId as string, payload });
                            } else {
                                createMutation.mutate(payload);
                            }
                        }}
                    />
                )}

                {/* Footer */}
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
