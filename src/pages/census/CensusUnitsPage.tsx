import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CensusUnitsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/censos/crear");
  };

  const handleNext = () => {
    console.log("Siguiente paso desde Unidades");
  };

  return (
    <div className="space-y-4">
      <header className="bg-[var(--pantone-7421)] text-white rounded-xl px-4 py-3">
        <h1 className="text-lg font-semibold">Unidades</h1>
      </header>

      {/* Contenedor principal tipo card grande */}
      <section className="bg-white rounded-2xl shadow-md overflow-hidden">

        {/* Tabla */}
        <div className="px-4 py-4">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200 w-20">
                    Índice
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">
                    <div className="flex items-center gap-1">
                      <span>Nombre</span>
                      <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 border-b border-gray-200 w-28">
                    Mostrar
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Estado vacío (todavía no consumimos API) */}
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    Aún no hay unidades registradas.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Paginación simple (solo diseño) */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border text-xs hover:bg-gray-50">
              «
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border text-xs hover:bg-gray-50">
              ‹
            </button>
            <span className="w-8 h-8 flex items-center justify-center rounded-full border bg-white text-xs">
              1
            </span>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border text-xs hover:bg-gray-50">
              ›
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border text-xs hover:bg-gray-50">
              N
            </button>
          </div>
        </div>

        {/* Footer rojo con botones Regresar / Siguiente */}
        <div className="bg px-4 py-3 flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="
              inline-flex items-center justify-center
              px-5 py-1.5 rounded-xl text-sm font-medium
              bg-[#DDC9A3] text-[#691B31]
              border border-[#DDC9A3]
              hover:bg-[#E0CEAA] hover:border-[#E0CEAA]
              hover:shadow-md active:scale-[0.97]
              transition-all duration-200
            "
          >
            Regresar
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="
              inline-flex items-center justify-center
              px-5 py-1.5 rounded-xl text-sm font-medium
              bg-[#DDC9A3] text-[#691B31]
              border border-[#DDC9A3]
              hover:bg-[#E0CEAA] hover:border-[#E0CEAA]
              hover:shadow-md active:scale-[0.97]
              transition-all duration-200
            "
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
  );
}
