import { useState } from "react";
import { Trash2, Edit2, Eye } from "lucide-react"; // Iconos de Lucide
import NewEncuestadoButton from "./NewEncuestadoButton"; // Asegúrate de importar el botón
import SearchBar from "./SearchBar"; // Asegúrate de importar SearchBar
import Pagination from "./Pagination"; // Importamos el componente Pagination

type User = {
  id: number;
  fullName: string;
  institution: string;
};

const EncuestadosTable = ({ users }: { users: User[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // Cantidad de usuarios por página

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginar los usuarios
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Función para cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Filtro y Botón Nuevo */}
      <div className="flex justify-between mb-4 items-center">
        <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        <NewEncuestadoButton onClick={() => console.log("Nuevo Encuestado")} />
      </div>

      {/* Tabla de Encuestados */}
      <table className="w-full table-auto border-collapse text-left">
        <thead className="bg-[var(--pantone-7421)] text-white">
          <tr>
            <th className="px-4 py-2">Avatar</th>
            <th className="px-4 py-2">Nombre Completo</th>
            <th className="px-4 py-2">Rol</th>
            <th className="px-4 py-2">Institución</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-2">
                <img src="/avatar-placeholder.jpg" alt="Avatar" className="h-8 w-8 rounded-full" />
              </td>
              <td className="px-4 py-2">{user.fullName}</td>
              <td className="px-4 py-2">Encuestado</td>
              <td className="px-4 py-2">{user.institution}</td>
              <td className="px-4 py-2 flex gap-2">
                <button className="p-2 text-[#5F0F1B] hover:bg-[#5F0F1B]/20 rounded-full">
                  <Eye size={18} />
                </button>
                <button className="p-2 text-[#5F0F1B] hover:bg-[#5F0F1B]/20 rounded-full">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 text-[#5F0F1B] hover:bg-[#5F0F1B]/20 rounded-full">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredUsers.length / usersPerPage)}
        onPageChange={paginate}
      />
    </div>
  );
};

export default EncuestadosTable;
