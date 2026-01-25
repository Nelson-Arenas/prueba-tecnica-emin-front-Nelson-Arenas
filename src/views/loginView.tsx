import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/authLayout"; // ajusta la ruta
import type { LoginData } from "../types";
import { useForm } from "react-hook-form";
import ErrorMessage from "../components/errorMessage";
import axiosInstance from "../config/axios";
import { isAxiosError } from "axios";
import Swal from "sweetalert2";

export default function LoginView() {
  const {register, handleSubmit, formState: { errors }} = useForm<LoginData>();
  const handleLogin = async (formData: LoginData) => {
     // Excluir confirmPassword antes de enviar al backend
        const {  ...loginData } = formData;
        console.log(loginData);
        try {
            const response = await axiosInstance.post(`/auth/login`, loginData);
            localStorage.setItem('AUTH_TOKEN', response.data.token);
            console.log('Login response:', response.data);
            
            // Mostrar mensaje de éxito con SweetAlert2
            await Swal.fire({
                icon: 'success',
                title: '¡Login exitoso!',
                text: 'Has iniciado sesión correctamente',
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

  const [showPassword, setShowPassword] = useState(false);


  return (
    <AuthLayout>
      <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="font-semibold text-[#184E8B] text-title-sm dark:text-dark/90 sm:text-title-md">
          Inicio de sesión
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
        Ingresa tu correo electrónico y contraseña para iniciar sesión.
      </p>

      <div className="relative py-3 sm:py-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-[#185183]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2"></span>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleLogin)}>
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
              Email <span className="text-error-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="info@gmail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <ErrorMessage message={errors.email.message || "Invalid email"} />}
            
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
              Password <span className="text-error-500">*</span>
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
                {...register("password", { required: "Password is required" })}

              />
              {errors.password && <ErrorMessage message={errors.password.message || "Invalid password"} />}

              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <svg className="fill-gray-500 dark:fill-gray-400 size-5" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                ) : (
                  <svg className="fill-gray-500 dark:fill-gray-400 size-5" viewBox="0 0 24 24">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-[#184E8B] rounded-lg hover:bg-[#0f3861] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#184E8B]"
          >
            Sign in
          </button>
        </div>
      </form>

      <div className="mt-5">
        <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
          No tienes una cuenta?{" "}
          <Link
            to="/auth/register"
            className="text-[#184E8B] hover:text-[#0f3861] dark:text-[#3a7bc8]"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
