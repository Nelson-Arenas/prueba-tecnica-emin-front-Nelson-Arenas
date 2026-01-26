// src/layouts/AppLayout.tsx

import { Navigate } from "react-router-dom";
import { userProfile } from "../api/eminApi";
import Sidebar from "../components/sidebar";
import { useQuery } from "@tanstack/react-query";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: userProfile,
    retry() {
      return true;
    }

  });

  console.log(data);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (isError) {
    return (<Navigate to="/auth/login"></Navigate>
    );
  }


  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[calc(100vh-3rem)] relative">
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <div className="text-right mb-2">
              <p className="font-semibold text-gray-800">
                {data?.user.name} {data?.user.lastName}
              </p>
              <p className="text-sm text-gray-600">{data?.user.email}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('AUTH_TOKEN');
                window.location.href = '/auth/login';
              }}
              className="bg-[#184E8B] hover:bg-[#0f3a66] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* 👇 Este div es la clave: reserva espacio para el overlay */}
          <div className="pt-24">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
}
