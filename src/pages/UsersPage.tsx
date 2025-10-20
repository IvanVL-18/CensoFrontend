import { useParams } from "react-router-dom"; // Para capturar el tipo de usuario
import EncuestadosTable from "../components/users/EncuestadosTable"; // Tabla de Encuestados
import AdministracionTable from "../components/users/AdministracionTable"; // Tabla de Administración
import ManagersTable from "../components/users/ManagersTable"; // Tabla de Managers

export default function UsersPage() {
  const { userType } = useParams(); // Obtenemos el tipo de usuario desde la URL
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Usuarios - {userType}</h2>

      {/* Mostrar la tabla según el tipo de usuario */}
      {userType === "encuestados" && <EncuestadosTable />}
      {userType === "administracion" && <AdministracionTable />}
      {userType === "managers" && <ManagersTable />}
    </div>
  );
}
