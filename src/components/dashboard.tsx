import { useEffect, useState } from "react";
import { getActivos, getCompanies } from "../api/eminApi";
import type { Activo, Empresas } from "../types";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function Dashboard() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [empresas, setEmpresas] = useState<Empresas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar todos los activos (sin paginación)
      const activosResponse = await getActivos({ limit: 1000 });
      setActivos(activosResponse.items);

      // Cargar empresas
      const empresasData = await getCompanies();
      setEmpresas(empresasData);
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // a) Total de activos por tipo
  const activosPorTipo = activos.reduce((acc, activo) => {
    acc[activo.type] = (acc[activo.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dataActivosPorTipo = {
    labels: Object.keys(activosPorTipo),
    datasets: [
      {
        label: "Activos por Tipo",
        data: Object.values(activosPorTipo),
        backgroundColor: [
          "#184E8B",
          "#2E7DBE",
          "#4A9FD8",
          "#7BC4E8",
          "#A5D8F3",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // b) Total de activos por estado
  const activosPorEstado = activos.reduce((acc, activo) => {
    acc[activo.status] = (acc[activo.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dataActivosPorEstado = {
    labels: Object.keys(activosPorEstado),
    datasets: [
      {
        label: "Activos por Estado",
        data: Object.values(activosPorEstado),
        backgroundColor: [
          "#28a745",
          "#ffc107",
          "#fd7e14",
          "#dc3545",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // c) Activos por empresa
  const activosPorEmpresa = activos.reduce((acc, activo) => {
    const empresaId =
      typeof activo.company === "string"
        ? activo.company
        : activo.company?._id; // cuando viene populated

    if (!empresaId) return acc;

    acc[empresaId] = (acc[empresaId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Mapear IDs de empresa a nombres (prioriza el populate, luego fallback a lista empresas)
  const empresaLabels = Object.keys(activosPorEmpresa).map((empresaId) => {
    // 1) si el activo viene populated, puedes rescatar el name desde ahí:
    const anyActivo = activos.find((a) => {
      const id = typeof a.company === "string" ? a.company : a.company?._id;
      return id === empresaId;
    });

    const nombreDesdePopulate =
      anyActivo && typeof anyActivo.company !== "string"
        ? anyActivo.company?.name
        : undefined;

    if (nombreDesdePopulate) return nombreDesdePopulate;

    // 2) fallback: buscar en tu endpoint /empresas/list
    const empresa = empresas.find((e) => e._id === empresaId);
    return empresa?.name || empresaId;
  });

  const dataActivosPorEmpresa = {
    labels: empresaLabels,
    datasets: [
      {
        label: "Activos por Empresa",
        data: Object.values(activosPorEmpresa),
        backgroundColor: "#184E8B",
        borderColor: "#0d2847",
        borderWidth: 1,
      },
    ],
  };


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Dashboard de Activos
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* a) Total de activos por tipo */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Total de Activos por Tipo
          </h2>
          <div style={{ height: "300px" }}>
            <Pie data={dataActivosPorTipo} options={chartOptions} />
          </div>
        </div>

        {/* b) Total de activos por estado */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Total de Activos por Estado
          </h2>
          <div style={{ height: "300px" }}>
            <Pie data={dataActivosPorEstado} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* c) Activos por empresa */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Activos por Empresa
        </h2>
        <div style={{ height: "400px" }}>
          <Bar data={dataActivosPorEmpresa} options={chartOptions} />
        </div>
      </div>

      {/* Resumen total */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Resumen Total</h2>
        <p className="text-lg">
          Total de Activos: <span className="font-bold">{activos.length}</span>
        </p>
        <p className="text-lg">
          Total de Empresas: <span className="font-bold">{empresas.length}</span>
        </p>
      </div>
    </div>
  );
}