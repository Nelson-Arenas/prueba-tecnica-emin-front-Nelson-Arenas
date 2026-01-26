import { isAxiosError } from "axios";
import axiosInstance from "../config/axios";
import Swal from "sweetalert2";
import type { User, Activo, Empresas } from "../types";



export async function userProfile(): Promise<User> {
  try {
    const { data } = await axiosInstance.get("/user/profile");
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.error("Error en la respuesta del servidor:", error.response.data);

      Swal.fire({
        icon: "error",
        title: "Inicio de sesión requerido",
        text:
          error.response.data.message ||
          "Ocurrió un error al obtener el perfil del usuario",
        confirmButtonColor: "#184E8B",
      });
    } else {
      console.error("Error en la solicitud:", error);

      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        confirmButtonColor: "#184E8B",
      });
    }
    throw error;
  }
}

export async function allUsers(): Promise<User[]> {
    try {
        const { data } = await axiosInstance.get("/user/all");
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.error("Error en la respuesta del servidor:", error.response.data);

            Swal.fire({
                icon: "error",
                title: "Error al obtener usuarios",
                text:
                    error.response.data.message ||
                    "Ocurrió un error al obtener los usuarios",
                confirmButtonColor: "#184E8B",
            });
        } else {
            console.error("Error en la solicitud:", error);

            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
                confirmButtonColor: "#184E8B",
            });
        }
        throw error;
    }
}



// Activo APIs
export type GetActivosParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: ActivoStatus;
  type?: ActivoType;
};

export type GetActivosResponse = {
  items: Activo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function getActivos(params?: GetActivosParams): Promise<GetActivosResponse> {
  try {
    const { data } = await axiosInstance.get("/activo/list", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        q: params?.q || undefined,
        status: params?.status || undefined,
        type: params?.type || undefined,
      },
    });

    // ✅ Compatibilidad: si backend aún devuelve Activo[] (sin paginar),
    // lo envolvemos para que ActivoView no reviente.
    if (Array.isArray(data)) {
      const items = data as Activo[];
      return {
        items,
        page: 1,
        limit: items.length,
        total: items.length,
        totalPages: 1,
      };
    }

    // ✅ Validación mínima del shape esperado
    const resp = data as Partial<GetActivosResponse>;
    if (!Array.isArray(resp.items)) {
      throw new Error("Respuesta inválida: falta 'items' en /activo/list");
    }

    return {
      items: resp.items,
      page: resp.page ?? params?.page ?? 1,
      limit: resp.limit ?? params?.limit ?? 10,
      total: resp.total ?? resp.items.length,
      totalPages: resp.totalPages ?? 1,
    };
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.error("Error en la respuesta del servidor:", error.response.data);

      Swal.fire({
        icon: "error",
        title: "Error al obtener activos",
        text: error.response.data?.message || "Ocurrió un error al obtener los activos",
        confirmButtonColor: "#184E8B",
      });
    } else {
      console.error("Error en la solicitud:", error);

      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        confirmButtonColor: "#184E8B",
      });
    }
    throw error;
  }
}
export type ActivoType = "NOTEBOOK" | "MONITOR" | "LICENCIA" | "PERIFERICO" | "OTRO";
export type ActivoStatus = "DISPONIBLE" | "ASIGNADO" | "MANTENCION" | "BAJA";

export interface CreateActivoDTO {
  code: string;
  name: string;
  type: ActivoType;
  brand?: string;
  model?: string;
  serialNumber: string;
  status: ActivoStatus;
  purchaseDate?: string; // ISO
  company?: string;
  location: string;
  assignedUser?: string | null;
  notes?: string;
}

export async function createActivo(payload: CreateActivoDTO) {
  const { data } = await axiosInstance.post("/activo/register", payload);
  return data;
}

export async function getActivoById(id: string): Promise<Activo> {
  try {
    if (!id || typeof id !== "string") {
      throw new Error("getActivoById: id inválido o vacío");
    }

    const { data } = await axiosInstance.post("/activo/find", { id });

    // Normaliza _id -> id para que tu front sea consistente
    const normalized = {
      ...data,
      id: data.id ?? data._id,
    };

    return normalized as Activo;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.error("[getActivoById] status:", error.response.status);
      console.error("[getActivoById] data:", error.response.data);

      Swal.fire({
        icon: "error",
        title: "Error al obtener activo",
        text:
          error.response.data?.message ||
          "Ocurrió un error al obtener el activo",
        confirmButtonColor: "#184E8B",
      });
    } else {
      console.error("[getActivoById] Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        confirmButtonColor: "#184E8B",
      });
    }
    throw error;
  }
}


export async function updateActivo(id: string, payload: CreateActivoDTO) {
  const { data } = await axiosInstance.put(`/activo/update/${id}`, payload);
  return data;
}


export async function softdeleteActivo(id: string) {
  const { data } = await axiosInstance.delete(`/activo/delete/${id}`);
  
  return data;
}

//api de empresas
export async function getCompanies(): Promise<Empresas[]> {
    try {
        const { data } = await axiosInstance.get("/empresas/list");
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.error("Error en la respuesta del servidor:", error.response.data);
            Swal.fire({
                icon: "error",
                title: "Error al obtener empresas",
                text:
                    error.response.data.message ||
                    "Ocurrió un error al obtener las empresas",
                confirmButtonColor: "#184E8B",
            });
        } else {
            console.error("Error en la solicitud:", error);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
                confirmButtonColor: "#184E8B",
            });
        }
        throw error;
    }
}