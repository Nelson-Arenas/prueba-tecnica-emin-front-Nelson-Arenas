// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-2xl border-r border-gray-200 flex flex-col">
      
      {/* Logo / Imagen */}
      <div className="p-6 flex items-center justify-center border-b">
        <img
          src="/grupo-emin.jpg"
          alt="Logo Empresa"
          className="w-40 h-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        
        <NavItem to="/home/dashboard" label="Home" />
        <NavItem to="/home/empresa" label="Empresa" />
        <NavItem to="/home/activos" label="Activos" />

      </nav>

      {/* Footer opcional */}
      <div className="p-4 border-t text-xs text-gray-400 text-center">
        © 2026 Grupo Emin
      </div>
    </aside>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
        ${
          isActive
            ? "bg-[#184E8B] text-white shadow-md"
            : "text-gray-700 hover:bg-[#184E8B]/10 hover:text-[#184E8B]"
        }
        `
      }
    >
      {/* Punto / icono simple */}
      <span
        className={`
          w-2 h-2 rounded-full
        `}
      />

      {label}
    </NavLink>
  );
}
