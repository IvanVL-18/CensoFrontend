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
      <div className="">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#691b31]"></div>
      </div>
    );
  }

  if (error || !censo) {
    return (
      <div className="">
        <p className="text-red-600 mb-3">{error || "Censo no encontrado"}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#691b31] text-white px-5 py-1.5 rounded-lg hover:bg-opacity-90 text-sm"
        >
          Regresar
        </button>
      </div>
    );
  }

  const createdYear = censo.created_at ? new Date(censo.created_at).getFullYear() : "—";
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPreguntas = 0; 
  const porcentaje = 100; 

  return (
    <div className=" min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
    
        <div className="flex items-center justify-between mb-8"> 
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-[#691b31] transition-colors text-sm"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span className="font-medium">Regresar</span>
          </button>
          <div className="flex gap-2">
           
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {/* Cabecera roja */}
          <div className="bg-[#691b31] px-6 py-4">
            <h1 className="text-2xl font-bold text-white">{censo.name}</h1>
          </div>

     
          <div className="divide-y divide-gray-200">
           
            <div className="px-6 py-4 flex items-center gap-2 text-gray-600">
              <Clock size={18} className="text-[#C3A67C]" />
              <span className="text-sm font-medium">Creado:</span>
              <span className="text-sm">{createdYear}</span>
            </div>

            
            {censo.description && (
              <div className="px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Descripción</h3>
                <p className="text-base text-gray-600">
                  {censo.description}
                </p>
              </div>
            )}

           
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <Calendar size={16} className="text-[#691b31]" />
                  <h3 className="text-sm font-semibold">Fecha de inicio</h3>
                </div>
                <p className="text-base font-medium">{formatDate(censo.start_date)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <Calendar size={16} className="text-[#691b31]" />
                  <h3 className="text-sm font-semibold">Fecha de fin</h3>
                </div>
                <p className="text-base font-medium">{formatDate(censo.end_date)}</p>
              </div>
            </div>

            
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to={`/censos/${censo.id}/Modulos`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#691b31] hover:bg-gray-50 transition-all"
              >
                <div className="p-2 bg-[#691b31] rounded-full">
                  <Layers size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Módulos</h3>
                  <p className="text-xs text-gray-500">Administrar módulos del censo</p>
                </div>
              </Link>
              <Link
                to={`/censos/${censo.id}/secciones`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#691b31] hover:bg-gray-50 transition-all"
              >
                <div className="p-2 bg-[#691b31] rounded-full">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Secciones</h3>
                  <p className="text-xs text-gray-500">Gestionar secciones y preguntas</p>
                </div>
              </Link>
            </div>

        
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <PieChart size={18} className="text-[#691b31]" />
                Progreso del censo
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#691b31"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - porcentaje / 100)}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#691b31]">{porcentaje}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de preguntas</span>
                    <span className="text-xl font-bold text-gray-800">{totalPreguntas}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#691b31] h-2 rounded-full"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
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