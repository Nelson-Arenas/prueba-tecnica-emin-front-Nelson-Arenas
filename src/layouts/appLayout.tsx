// src/layouts/AppLayout.tsx
import Sidebar from "../components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[calc(100vh-3rem)] relative">
            <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/auth/login';
            }}
            className="absolute top-4 right-4 bg-[#184E8B] hover:bg-[#0f3a66] text-white px-4 py-2 rounded-lg transition-colors"
            >
            Cerrar Sesión
            </button>
          {children}
        </div>
      </main>
    </div>
  );
}
