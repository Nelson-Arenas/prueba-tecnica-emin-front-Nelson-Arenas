import { isAxiosError } from "axios";
import axiosInstance from "../config/axios";
import Swal from "sweetalert2";
import type { User } from "../types";


export async function userProfile() {
    try {
        const response = await axiosInstance.get<User>('/user/profile' );
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.error('Error en la respuesta del servidor:', error.response.data);
            Swal.fire({
                icon: 'error',
                title: 'Inicio de sesión requerido',
                text: error.response.data.message || 'Ocurrió un error al obtener el perfil del usuario',
                confirmButtonColor: '#184E8B'
            });
        } else {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error inesperado',
                text: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
                confirmButtonColor: '#184E8B'
            });
        }
    }
}