// src/pages/censos/components/CensoDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Layers, PieChart, Clock } from "lucide-react";
import type { Censo } from '../Censos.types';
import { getCenso } from '../Censos.service';

export function CensoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [censo, setCenso] = useState<Censo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCenso = async () => {
      try {
        setLoading(true);
        const data = await getCenso(id);
        setCenso(data);
      } catch (err) {
        setError("No se pudo cargar el censo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCenso();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#691b31]"></div>
      </div>
    );
  }

  if (error || !censo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || "Censo no encontrado"}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#691b31] text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          Regresar
        </button>
      </div>
    );
  }

  // Extraer año de creación
  const createdYear = censo.created_at ? new Date(censo.created_at).getFullYear() : "—";
  
  // Formatear fechas
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Datos de ejemplo (pueden venir del censo real)
  const totalPreguntas = 0; // Esto debería venir del backend
  const porcentaje = 100; // Placeholder

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con navegación */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-[#691b31] transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Regresar</span>
          </button>
          <div className="flex gap-3">
           
            <button className="px-4 py-2 text-sm bg-[#691b31] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              Compartir
            </button>
          </div>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cabecera con color de fondo: solo el nombre */}
          <div className="flex justify-between items-center p-4 bg-red-900 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">{censo.name}</h1>
          </div>

          {/* Cuerpo */}
          <div className="p-8">
            {/* Metadata: creado */}
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Clock size={18} className="text-[#C3A67C]" />
              <span className="text-sm font-medium">Creado:</span>
              <span className="text-sm">{createdYear}</span>
            </div>

            {/* Descripción (si existe) */}
            {censo.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Descripción</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {censo.description}
                </p>
              </div>
            )}

            {/* Fechas del censo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <Calendar size={20} className="text-[#691b31]" />
                  <h3 className="font-semibold">Fecha de inicio</h3>
                </div>
                <p className="text-lg font-medium">{formatDate(censo.start_date)}</p>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <Calendar size={20} className="text-[#691b31]" />
                  <h3 className="font-semibold">Fecha de fin</h3>
                </div>
                <p className="text-lg font-medium">{formatDate(censo.end_date)}</p>
              </div>
            </div>

            {/* Secciones de navegación a Unidades y Secciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Link
                to={`/censos/${censo.id}/unidades`}
                className="group flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-[#691b31] hover:bg-gray-50 transition-all"
              >
                <div className="p-3 bg-[#691b31] rounded-full group-hover:scale-105 transition-transform">
                  <Layers size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Unidades</h3>
                  <p className="text-sm text-gray-500">Administrar unidades del censo</p>
                </div>
              </Link>
              <Link
                to={`/censos/${censo.id}/secciones`}
                className="group flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-[#691b31] hover:bg-gray-50 transition-all"
              >
                <div className="p-3 bg-[#691b31] rounded-full group-hover:scale-105 transition-transform">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Secciones</h3>
                  <p className="text-sm text-gray-500">Gestionar secciones y preguntas</p>
                </div>
              </Link>
            </div>

            {/* Estadísticas y progreso (opcional) */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-[#691b31]" />
                Progreso del censo
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Barra de progreso circular (simulada con SVG) */}
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#691b31"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - porcentaje / 100)}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#691b31]">{porcentaje}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total de preguntas</span>
                    <span className="text-2xl font-bold text-gray-800">{totalPreguntas}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#691b31] h-2.5 rounded-full"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * Total de preguntas del censo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}