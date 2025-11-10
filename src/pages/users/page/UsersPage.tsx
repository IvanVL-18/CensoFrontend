import { useState, useMemo } from "react";
import UserFilter from "../components/UserFilter";
import EncuestadosTable from "../components/EncuestadosTable";
import AdministracionTable from "../components/AdministracionTable";
import ManagersTable from "../components/ManagersTable";

const usersData = [
  { id: 1, fullName: "Alexis Maturano", institution: "Oficina Mayor", role: "encuestados" },
  { id: 2, fullName: "Alma Guadalupe", institution: "Secretaría de Contraloría", role: "encuestados" },
  // Puedes agregar más usuarios según tus datos reales
];

const UsersPage = () => {
  const [selectedUserType, setSelectedUserType] = useState("encuestados");

  // Filtrar usuarios según tipo seleccionado
  const filteredUsers = useMemo(
    () => usersData.filter((user) => user.role === selectedUserType),
    [selectedUserType]
  );

  return (
    <div className="p-8 min-h-screen space-y-8">
      <div className="max-w-4xl mx-auto">
        <UserFilter
          selectedUserType={selectedUserType}
          onUserTypeChange={setSelectedUserType}
        />
      </div>

      {/* Tabla dinámica según selección */}
      <div className="max-w-6xl mx-auto">
        {selectedUserType === "encuestados" && (
          <EncuestadosTable users={filteredUsers} />
        )}
        {selectedUserType === "administracion" && (
          <AdministracionTable users={filteredUsers} />
        )}
        {selectedUserType === "managers" && (
          <ManagersTable users={filteredUsers} />
        )}
      </div>
    </div>
  );
};

export default UsersPage;
