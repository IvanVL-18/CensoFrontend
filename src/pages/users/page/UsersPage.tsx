import { useState, useMemo } from "react";
import EncuestadosTable from "../components/EncuestadosTable";
import AdministracionTable from "../components/AdministracionTable";
import ManagersTable from "../components/ManagersTable";
import UserFilter from "../components/UserFilter";

const usersData = [
  { id: 1, fullName: "Alexis Maturano", institution: "Oficina Mayor", role: "encuestado" },
  { id: 2, fullName: "Alma Guadalupe", institution: "Secretaría de Contraloría", role: "encuestado" },
  // ...otros usuarios
];

const UsersPage = () => {
  const [selectedUserType, setSelectedUserType] = useState("encuestados");

  // Memoización del filtro de usuarios para evitar filtrado innecesario en cada renderizado
  const filteredUsers = useMemo(() => {
    return usersData.filter(user => user.role === selectedUserType);
  }, [selectedUserType]);

  return (
    <div className="p-6">
      <UserFilter selectedUserType={selectedUserType} onUserTypeChange={setSelectedUserType} />

      {selectedUserType === "encuestados" && <EncuestadosTable users={filteredUsers} />}
      {selectedUserType === "administracion" && <AdministracionTable users={filteredUsers} />}
      {selectedUserType === "managers" && <ManagersTable users={filteredUsers} />}
    </div>
  );
};

export default UsersPage;
