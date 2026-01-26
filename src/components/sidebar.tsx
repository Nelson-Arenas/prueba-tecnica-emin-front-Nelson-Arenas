// src/components/Sidebar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BuildingOffice2Icon,
  CubeIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
        <NavItem
          to="/home/dashboard"
          label="Home"
          icon={HomeIcon}
          navigate={navigate}
          active={location.pathname.startsWith("/home/dashboard")}
        />
        <NavItem
          to="/home/empresa"
          label="Empresa"
          icon={BuildingOffice2Icon}
          navigate={navigate}
          active={location.pathname.startsWith("/home/empresa")}
        />
        <NavItem
          to="/home/activos"
          label="Activos"
          icon={CubeIcon}
          navigate={navigate}
          active={location.pathname.startsWith("/home/activos")}
        />
      </nav>

      {/* Footer opcional */}
      <div className="p-4 border-t text-xs text-gray-400 text-center">
        © 2026 Grupo Emin
      </div>
    </aside>
  );
}

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function NavItem({
  to,
  label,
  icon: Icon,
  navigate,
  active,
}: {
  to: string;
  label: string;
  icon: IconType;
  navigate: (path: string) => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left
        ${
          active
            ? "bg-[#184E8B] text-white shadow-md"
            : "text-gray-700 hover:bg-[#184E8B]/10 hover:text-[#184E8B]"
        }
      `}
    >
      {/* Icon */}
      <Icon
        className="w-5 h-5 flex-shrink-0"
        aria-hidden="true"
      />

      <span>{label}</span>
    </button>
  );
}
