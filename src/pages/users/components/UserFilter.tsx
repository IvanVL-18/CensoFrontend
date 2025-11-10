import { Users, ShieldCheck, Briefcase, ChevronDown } from "lucide-react";

type UserFilterProps = {
  selectedUserType: string;
  onUserTypeChange: (userType: string) => void;
};

const ICONS: Record<string, React.ComponentType<any>> = {
  encuestados: Users,
  administracion: ShieldCheck,
  managers: Briefcase,
};

const UserFilter = ({ selectedUserType, onUserTypeChange }: UserFilterProps) => {
  const Icon = ICONS[selectedUserType] ?? Users;

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Encabezado institucional */}
        <div className="bg-gradient-to-r from-[#ECE9E6] to-[#FFFFFF] px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
            Elige un usuario
          </h3>
        </div>

        {/* Contenedor del filtro */}
        <div className="p-6">
          <div className="relative">
            {/* Icono del tipo seleccionado */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B49060]">
              <Icon className="w-5 h-5" />
            </span>

            {/* Selector */}
            <select
              id="userType"
              value={selectedUserType}
              onChange={(e) => onUserTypeChange(e.target.value)}
              aria-label="Selecciona el tipo de usuario"
              className="
                w-full h-12
                bg-white
                pl-10 pr-10
                rounded-md
                text-gray-800
                border border-gray-300
                shadow-sm
                focus:outline-none
                focus:ring-2 focus:ring-[#B49060]
                focus:border-[#B49060]
                transition-all
                appearance-none
                [-webkit-appearance:none]
                [-moz-appearance:none]
              "
            >
              <option value="encuestados">Encuestados</option>
              <option value="administracion">Administración</option>
              <option value="managers">Managers</option>
            </select>

            {/* Flecha de despliegue */}
            <ChevronDown
              className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>

          {/* Descripción institucional opcional */}
          <p className="text-xs text-gray-500 mt-3">
            Selecciona el tipo de usuario para visualizar la información correspondiente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserFilter;
