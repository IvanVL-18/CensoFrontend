import { useState, useEffect, type ChangeEvent, useMemo } from "react";
import { getUnits, type UnitFilter } from "./units.service";
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  CirclePlus, 
  Ban,           
  type LucideProps,
} from "lucide-react";

import type { Unit, PaginatedUnitsResponse, Meta } from "./units.interfaces";

const defaultProps = {
  strokeWidth: 1.75,
  size: 22,
};

const IconSearch = (props: LucideProps) => (
  <Search {...defaultProps} {...props} />
);

const IconSort = (props: LucideProps) => (
  <ArrowUpDown {...defaultProps} {...props} />
);
const IconCirclePlus = (props: LucideProps) => (
  <CirclePlus {...defaultProps} {...props} />
);

const IconView = (props: LucideProps) => <Eye {...defaultProps} {...props} />;

const IconEdit = (props: LucideProps) => <Edit {...defaultProps} {...props} />;

// Se mantiene IconDelete con Trash2
const IconDelete = (props: LucideProps) => (
  <Trash2 {...defaultProps} {...props} />
);

// --- Iconos Nuevos Agregados ---

// 1. Nuevo icono para "Subir" (Restaurar)
const IconCircleArrowUp = (props: LucideProps) => (
  <CircleArrowUp {...defaultProps} {...props} />
);

// 2. Nuevo icono para "Ban" (Desactivar/Prohibir)
const IconBan = (props: LucideProps) => (
  <Ban {...defaultProps} {...props} />
);

export default function Units() {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Unit;
    direction: "ascending" | "descending";
  }>({ key: "name", direction: "ascending" });

  const handleSort = (key: keyof Unit) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const [units, setUnits] = useState<Unit[]>([]);
  const [links, setLinks] = useState<PaginatedUnitsResponse["links"] | null>(
    null
  );
  const [meta, setMeta] = useState<Meta | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<UnitFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadUnits = (url?: string) => {
    setLoading(true);

    const fetchPromise = url
      ? fetch(url).then((res) => res.json() as Promise<PaginatedUnitsResponse>)
      : getUnits(filter);

    fetchPromise
      .then((response) => {
        setUnits(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar las Modulos: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUnits();
  }, [filter]);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as UnitFilter);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageClick = (url: string | null) => {
    if (url) {
      loadUnits(url);
    }
  };

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUnits = useMemo(() => {
    let sortableItems = [...filteredUnits];

    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredUnits, sortConfig]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* --- Cabecera: Título y Botón --- */}
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">Modulos</h1>
        <button
          className="
            bg-gradient-to-r from-[#B49060] via-[#C3A67C] to-[#D4C09B] 
            text-white font-semibold 
            h-10 rounded-lg shadow 
            hover:brightness-95 
            flex items-center 
            group 
            transition-all duration-300 ease-in-out
            
            /* Estado Inicial: Padding (9px) para centrar el icono (22px) en h-10 (40px) */
            /* 40px (altura) - 22px (icono) = 18px. 18/2 = 9px. py-2.5 no existe, así que usamos p-[9px] */
            p-[9px] 

            /* Estado Hover/Active: Se expande el padding horizontal */
            group-hover:px-4 group-active:px-4
          "
        >
          {/* El icono siempre visible */}
          <IconCirclePlus className="flex-shrink-0" size={22} strokeWidth={2.5} />

          {/* El span del texto se oculta/muestra y anima */}
          <span
            className="
              /* Estado Inicial: Sin ancho, sin margen, transparente */
              w-0 ml-0 opacity-0 
              whitespace-nowrap 
              overflow-hidden /* Importante: el overflow en el span */
              transition-all duration-300 ease-in-out

              /* Estado Hover/Active: Gana ancho, margen y opacidad */
              group-hover:w-auto group-hover:ml-2 group-hover:opacity-100
              group-active:w-auto group-active:ml-2 group-active:opacity-100
            "
          >
            Agregar Modulo
          </span>
        </button>
      </div>

      {/* --- Contenido Principal (Filtros, Tabla, Paginación) --- */}
      <div className="p-4">
        {/* --- Filtros: Dropdown y Búsqueda --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          {/* Dropdown */}
          <div className="w-full md:w-auto relative">
            <select
              value={filter}
              onChange={handleFilterChange}
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
              onChange={handleSearchChange}
              className="border border-gray-300 rounded-l-lg p-2 pl-4 w-full border-r-0 focus:ring-0 focus:border-gray-300"
            />
            <button className="bg-stone-200 text-gray-600 px-4 rounded-r-lg border border-gray-300 border-l-0 hover:bg-stone-300 transition-colors">
              <IconSearch />
            </button>
          </div>
        </div>

        {/* --- Tabla de datos --- */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* 1. Columna "No." */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  No.
                </th>

                {/* 2. Columna "Nombre" */}
                <th className="px-6 py-3 text-left w-full">
                  <button
                    onClick={() => handleSort("name")}
                    className="
                flex items-center space-x-1      
                text-xs font-medium text-gray-500 uppercase tracking-wider
                hover:text-opacity-75 traombrensition-colors
               "
                  >
                    <span>Nombre</span>
                    <IconSort size={16} strokeWidth={2.5} />
                  </button>
                </th>

                {/* 3. Columna "Opciones" */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Opciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* --- Estados de Carga y Error (colSpan="3") --- */}
              {loading && (
                <tr>
                  <td colSpan={3} className="text-center p-6 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center p-6 text-red-600 font-semibold"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-6 text-gray-500">
                    No se encontraron Modulos.
                  </td>
                </tr>
              )}

              {/* --- Mapeo de datos --- */}
              {!loading &&
                !error &&
                sortedUnits.map((unit, index) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    {/* Celda "No." */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meta ? meta.from + index : unit.id}
                    </td>

                    {/* Celda "Nombre" */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {unit.name}
                    </td>

                    {/*
                      * ======================================================
                      * INICIO DEL CAMBIO: Renderizado Condicional de Botones
                      * ======================================================
                      */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                      {/*
                        * Si 'deleted_at' NO existe (es null), el registro está ACTIVO.
                        * Mostramos: Ver, Editar, Desactivar (Ban)
                        */}
                      {!unit.deleted_at ? (
                        <>
                          {/* --- Botón VER (Activo) --- */}
                          <button
                            title="Ver Modulo"
                            className="
                              bg-white text-[#691b31] 
                              hover:bg-[#9d7e43] hover:text-white 
                              active:bg-[#691b31] active:text-white
                              p-2 rounded-lg leading-none transition-colors
                            "
                          >
                            <IconView />
                          </button>

                          {/* --- Botón EDITAR (Activo) --- */}
                          <button
                            title="Editar Modulo"
                            className="
                              bg-white text-[#691b31] 
                              hover:bg-[#1b2469] hover:text-white 
                              active:bg-[#691b31] active:text-white
                              p-2 rounded-lg leading-none transition-colors
                            "
                          >
                            <IconEdit />
                          </button>

                          {/* --- Botón DESACTIVAR (Ban) --- */}
                          <button
                            title="Desactivar Modulo"
                            className="
                              bg-white text-[#691b31] 
                              hover:bg-[#691b31] hover:text-white 
                              active:bg-[#691b31] active:text-white
                              p-2 rounded-lg leading-none transition-colors
                            "
                          >
                            <IconBan />
                          </button>
                        </>
                      ) : (
                        <>
                          {/*
                            * Si 'deleted_at' SÍ existe, el registro está INACTIVO.
                            * Mostramos: Ver, Restaurar (ArrowUp), Eliminar Permanente (Delete)
                            */}

                          {/* --- Botón VER (Inactivo) --- */}
                          <button
                            title="Ver Modulo"
                            className="
                               bg-white text-[#691b31] 
                              hover:bg-[#9d7e43] hover:text-white 
                              active:bg-[#691b31] active:text-white
                              p-2 rounded-lg leading-none transition-colors
                            "
                          >
                            <IconView />
                          </button>

                          {/* --- Botón RESTAURAR (ArrowUp) --- */}
                          <button
                            title="Restaurar Modulo"
                            className="
                               bg-white text-[#691b31] 
                              hover:bg-[#1b6939] hover:text-white 
                              active:bg-[#691b31] active:text-white
                              p-2 rounded-lg leading-none transition-colors
                            "
                          >
                            <IconCircleArrowUp />
                          </button>

                          {/* --- Botón ELIMINAR PERMANENTE (Delete) --- */}
                          <button
                            title="Eliminar Permanentemente"
                            className="
                               bg-white text-[#691b31] 
                              hover:bg-[#691b31] hover:text-white 
                              active:bg-[#691b31] active:text-white
                              p-2 rounded-lg leading-none transition-colors
                            "
                          >
                            <IconDelete />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* --- Paginación --- */}
        {meta && links && !loading && !error && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div className="text-sm text-gray-700 mb-2 md:mb-0">
              Mostrando <span className="font-medium">{meta.from}</span> a{" "}
              <span className="font-medium">{meta.to}</span> de{" "}
              <span className="font-medium">{meta.total}</span> resultados
            </div>

            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              {meta.links.map((link: Meta["links"][number], index: number) => (
                <button
                  key={index}
                  onClick={() => handlePageClick(link.url)}
                  disabled={!link.url || link.active}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`
                        relative inline-flex items-center px-4 py-2 border text-sm font-medium
                        ${
                          link.active
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            :"bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }
                        ${
                          !link.url
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : ""
                        }
                        ${index === 0 ? "rounded-l-md" : ""}
                        ${index === meta.links.length - 1 ? "rounded-r-md" : ""}
                      `}
                />
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}