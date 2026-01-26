// src/layouts/appLayout.tsx
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userProfile } from "../api/eminApi";
import Sidebar from "../components/sidebar";

type UserProfileResponse = {
  user: {
    name: string;
    lastName: string;
    email: string;
  };
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery<UserProfileResponse>({
    queryKey: ["userProfile"],
    // 👇 fuerza el tipo de retorno del queryFn
    queryFn: userProfile as unknown as () => Promise<UserProfileResponse>,
    retry: true,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isError) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[calc(100vh-3rem)] relative">
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <div className="text-right mb-2">
              <p className="font-semibold text-gray-800">
                {data?.user?.name} {data?.user?.lastName}
              </p>
              <p className="text-sm text-gray-600">{data?.user?.email}</p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("AUTH_TOKEN");
                window.location.href = "/auth/login";
              }}
              className="bg-[#184E8B] hover:bg-[#0f3a66] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="pt-24">{children}</div>
        </div>
      </main>
    </div>
  );
}
