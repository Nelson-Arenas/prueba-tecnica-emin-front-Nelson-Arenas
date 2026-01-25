import { Link } from "react-router-dom";
import AuthLayout from "../layouts/authLayout"; // ajusta la ruta
import { useForm } from 'react-hook-form';
import { isAxiosError } from "axios";
import axiosInstance from "../config/axios";
import type { RegisterData } from "../types";
import ErrorMessage from "../components/errorMessage";
import Swal from 'sweetalert2';

export default function RegisterView() {
    const { register, watch, handleSubmit, formState: { errors } } = useForm<RegisterData>();
    const handleRegister = async (formData: RegisterData) => {
        // Excluir confirmPassword antes de enviar al backend
        const { confirmPassword, ...registerData } = formData;
        console.log(registerData);
        try {
            const response = await axiosInstance.post(`/auth/register`, registerData);
            console.log('Usuario registrado:', response.data);
            
            // Mostrar mensaje de éxito con SweetAlert2
            await Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Tu cuenta ha sido creada correctamente',
                confirmButtonColor: '#184E8B'
            });
            
            // Redirigir o realizar otra acción después del éxito
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                console.error('Error en la respuesta del servidor:', error.response.data);
                
                // Mostrar mensaje de error con SweetAlert2
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el registro',
                    text: error.response.data.message || 'Ocurrió un error al registrar el usuario',
                    confirmButtonColor: '#184E8B'
                });
            } else {
                console.error('Error en la solicitud:', error);
                
                // Mostrar mensaje de error genérico
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
                    confirmButtonColor: '#184E8B'
                });
            }
        }
    };

    return (
        <AuthLayout>
            <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="font-semibold text-[#184E8B] text-title-sm dark:text-dark/90 sm:text-title-md">
                    Registro
                </h1>

                <div className="w-24 sm:w-32 flex-shrink-0">
                    <img
                        src="/grupo-emin.jpg"
                        alt="Logotipo Emin"
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                Completa los datos para crear tu cuenta.
            </p>

            {/* Divider igual al Login */}
            <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-[#185183]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2"></span>
                </div>
            </div>

            <form onSubmit={handleSubmit(handleRegister)}>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
                            Nombre <span className="text-error-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Tu nombre"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
                            {...register("name", {
                                required: "Nombre es obligatorio",
                                pattern: { value: /^[A-Za-z]+$/i, message: "Nombre solo debe contener letras" }

                            })}
                        />
                        {errors.name && <ErrorMessage message={errors.name.message as string} />}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
                            Apellido <span className="text-error-500">*</span>
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            placeholder="Tu apellido"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
                            {...register("lastName", {
                                required: "Apellido es obligatorio",
                                pattern: { value: /^[A-Za-z]+$/i, message: "Apellido solo debe contener letras" }
                            })}
                        />
                        {errors.lastName && <ErrorMessage message={errors.lastName.message as string} />}
                    </div>


                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
                            Email <span className="text-error-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="info@gmail.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
                            {...register("email", {
                                required: "Email es obligatorio",
                                pattern: { value: /^\S+@\S+$/i, message: "Formato de email inválido" }

                            })}
                        />
                        {errors.email && <ErrorMessage message={errors.email.message as string} />}
                    </div>


                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
                            Empresa <span className="text-error-500">*</span>
                        </label>
                        <select
                            id="company"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
                            {...register("company", { required: "Empresa es obligatoria" })}
                        >
                            <option>Selecciona una empresa</option>
                            <option value={1}>GRUPO EMIN</option>
                            <option value={2}>Empresa 2</option>
                            <option value={3}>Empresa 3</option>
                        </select>
                        {errors.company && <ErrorMessage message={errors.company.message as string} />}
                    </div>




                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
                            Password <span className="text-error-500">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Crea una contraseña"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
                            {...register("password", {
                                required: "Password es obligatorio",
                                pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: "Password debe tener al menos 8 caracteres, incluyendo letras y números" }

                            })}
                        />
                        {errors.password && <ErrorMessage message={errors.password.message as string} />}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
                            Repetir password <span className="text-error-500">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirma tu contraseña"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
                            {...register("confirmPassword", {
                                required: "Confirmar password es obligatorio",
                                validate: value => value === watch('password') || "Las contraseñas no coinciden"
                            })}
                        />
                        {errors.confirmPassword && <ErrorMessage message={errors.confirmPassword.message as string} />}
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-[#184E8B] rounded-lg hover:bg-[#0f3861] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#184E8B]"
                    >
                        Crear cuenta
                    </button>
                </div>
            </form>

            <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Ya tienes cuenta?{" "}
                    <Link
                        to="/auth/login"
                        className="text-[#184E8B] hover:text-[#0f3861] dark:text-[#3a7bc8]"
                    >
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
