// src/views/DashboardView.tsx
import AppLayout from "../layouts/appLayout";
import Dashboard from "../components/dashboard";

export default function DashboardView() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold text-[#184E8B] mb-4">
        Home
      </h1>

      <p className="text-gray-600">
        Bienvenido al panel principal.
      </p>
      <Dashboard />
    </AppLayout>
  );
}
