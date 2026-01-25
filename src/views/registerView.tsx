import { Link } from "react-router-dom";
import AuthLayout from "../layouts/authLayout"; // ajusta la ruta

export default function RegisterView() {
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

      <form>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
              Nombre <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
              Email <span className="text-error-500">*</span>
            </label>
            <input
              type="email"
              placeholder="info@gmail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#185183] mb-2">
              Password <span className="text-error-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Crea una contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#184E8B] focus:border-transparent dark:bg-white dark:text-black dark:border-gray-300"
            />
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
