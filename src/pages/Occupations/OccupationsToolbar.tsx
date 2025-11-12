import { type ChangeEvent } from "react";
import {
  Search,
  ChevronDown,
  CirclePlus,
  type LucideProps,
} from "lucide-react";
import type { OccupationFilter } from "./Occupations.service"; 

// --- Definiciones de Iconos (usados solo en este componente) ---

const defaultProps = {
  strokeWidth: 1.75,
  size: 22,
};

const IconSearch = (props: LucideProps) => (
  <Search {...defaultProps} {...props} />
);

const IconCirclePlus = (props: LucideProps) => (
  <CirclePlus {...defaultProps} {...props} />
);

// --- Definición de Props ---

interface OccupationsToolbarProps {
  filter: OccupationFilter;
  searchTerm: string;
  onFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void; // Prop para el botón "Agregar"
}

// --- Componente ---

export function OccupationsToolbar({
  filter,
  searchTerm,
  onFilterChange,
  onSearchChange,
  onAddClick, // Recibimos la prop
}: OccupationsToolbarProps) {
  return (
    <>
      {/* --- Cabecera: Título y Botón --- */}
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">Ocupaciones</h1>
        <button
          onClick={onAddClick} // Conectamos el evento
          className="
            bg-gradient-to-r from-[#B49060] via-[#C3A67C] to-[#D4C09B] 
            text-white font-semibold 
            h-10 rounded-lg shadow 
            hover:brightness-95 
            flex items-center 
            group 
            transition-all duration-300 ease-in-out
            p-[9px] 
            group-hover:px-4 group-active:px-4
          "
        >
          <IconCirclePlus className="flex-shrink-0" size={22} strokeWidth={2.5} />
          <span
            className="
              w-0 ml-0 opacity-0 
              whitespace-nowrap 
              overflow-hidden 
              transition-all duration-300 ease-in-out
              group-hover:w-auto group-hover:ml-2 group-hover:opacity-100
              group-active:w-auto group-active:ml-2 group-active:opacity-100
            "
          >
            Agregar Ocupación
          </span>
        </button>
      </div>

      {/* --- Filtros: Dropdown y Búsqueda (Dentro del div .p-4 del padre) --- */}
      {/* NOTA: Este div se renderizará *dentro* del <div className="p-4"> 
        del componente Occupations.tsx principal. 
      */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 px-4 pt-4">
        {/* Dropdown */}
        <div className="w-full md:w-auto relative">
          <select
            value={filter}
            onChange={onFilterChange} // Conectado a props
            className="bg-white border border-gray-300 rounded-lg p-2 w-full md:w-48 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <div className="absolute inset-y-0 right-0  flex items-center px-3 bg-[#D4C09B]  rounded-r-lg pointer-events-none">
            <ChevronDown className="w-5 h-5 text-black" />
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative flex w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={onSearchChange} // Conectado a props
            className="border border-gray-300 rounded-l-lg p-2 pl-4 w-full border-r-0 focus:ring-0 focus:border-gray-300"
          />
          <button className="bg-stone-200 text-gray-600 px-4 rounded-r-lg border border-gray-300 border-l-0 hover:bg-stone-300 transition-colors">
            <IconSearch />
          </button>
        </div>
      </div>
    </>
  );
}