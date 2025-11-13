import { useLocation } from "react-router-dom";
import EncuestadosTable, {
  type Encuestado,
} from "../components/EncuestadosTable";

function useTipo() {
  const q = new URLSearchParams(useLocation().search);
  return (q.get("tipo") ?? "") as
    | "encuestados"
    | "administracion"
    | "managers"
    | "";
}

const MOCK_ENCUESTADOS: Encuestado[] = [
  {
    id: 1,
    name: "María López",
    curp: "LOPM010101HDFRNS09",
    municipio: "Pachuca",
    status: "Activo",
  },
  {
    id: 2,
    name: "Juan Pérez",
    curp: "PEJJ990505HDFRNN08",
    municipio: "Tula",
    status: "Inactivo",
  },
];

export default function UsersPage() {
  const tipo = useTipo();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#3b2a2e]">
        Usuarios {tipo ? `— ${tipo}` : ""}
      </h1>

      {tipo === "encuestados" && <EncuestadosTable rows={MOCK_ENCUESTADOS} />}

      {tipo === "" && (
        <p className="text-sm text-[#3b2a2e]/70">
          Pasa el cursor por <strong>Usuarios</strong> en el sidebar y elige un
          tipo para mostrar la tabla.
        </p>
      )}
    </div>
  );
}
