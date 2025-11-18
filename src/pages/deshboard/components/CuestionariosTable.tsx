import { useState } from "react";
import { Eye } from "lucide-react";
import Pagination from "./Pagination";
import Header from "./Header";

const CuestionariosTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const cuestionarios = [
    { id: 1, name: "Censo prueba", questions: 15 },
  ];

  const filtered = cuestionarios.filter((q) =>
    q.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = 3;

  return (
    <div className="w-full">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="p-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left w-[50px]">#</th>
                <th className="py-3 px-4 text-left">Nombre</th>
                <th className="py-3 px-4 text-left">Numero de preguntas</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-gray-700">{row.id}</td>
                  <td className="py-3 px-4 text-gray-900">{row.name}</td>
                  <td className="py-3 px-4 text-gray-900">{row.questions}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#B49060] hover:bg-[#A68250] text-white shadow-sm"
                      aria-label="Ver"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default CuestionariosTable;
