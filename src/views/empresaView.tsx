// src/views/DashboardView.tsx
import AppLayout from "../layouts/appLayout";

export default function EmpresaView() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold text-[#184E8B] mb-4">
        Empresa
      </h1>

      <p className="text-gray-600">
        Bienvenido al panel de Empresa.
      </p>
    </AppLayout>
  );
}
