import { useState, useEffect, type ChangeEvent } from 'react';
import { getUnits, type UnitFilter } from './units.service';
import { 
  Search, 
  ArrowUpDown, 
  Eye, 
  Edit, 
  Trash2, 
  type LucideProps 
} from 'lucide-react';

import type { 
  Unit, 
  PaginatedUnitsResponse, 
  Meta 
} from './units.interfaces';

const defaultProps = {
  color: "#691b31",
  strokeWidth: 1.75,
  size: 22,
};

const IconSearch = (props: LucideProps) => (
  <Search {...defaultProps} {...props} />
);

const IconSort = (props: LucideProps) => (
  <ArrowUpDown {...defaultProps} {...props} />
);

const IconView = (props: LucideProps) => (
  <Eye {...defaultProps} {...props} />
);

const IconEdit = (props: LucideProps) => (
  <Edit {...defaultProps} {...props} />
);

const IconDelete = (props: LucideProps) => (
  <Trash2 {...defaultProps} {...props} />
);

export default function Units() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [links, setLinks] = useState<PaginatedUnitsResponse['links'] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null); // Contiene info de paginación

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<UnitFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadUnits = (url?: string) => {
    setLoading(true);

    const fetchPromise = url 
      ? fetch(url).then(res => res.json() as Promise<PaginatedUnitsResponse>)
      : getUnits(filter);

    fetchPromise
      .then(response => {
        setUnits(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null); 
      })
      .catch(err => {
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

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      
      {/* --- Cabecera: Título y Botón (Estilo Figma) --- */}
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">
           Modulos
        </h1>
        <button className="bg-stone-200 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow hover:bg-stone-300 transition-colors">
          Agregar Modulo
        </button>
      </div>

      {/* --- Contenido Principal (Filtros, Tabla, Paginación) --- */}
      <div className="p-4 md:p-6">

        {/* --- Filtros: Dropdown y Búsqueda --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          {/* Dropdown */}
          <div className="w-full md:w-auto">
            <select 
              value={filter} 
              onChange={handleFilterChange}
              className="bg-gray-50 border border-gray-300 rounded-lg p-2 w-full md:w-48 appearance-none"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          
          {/* Búsqueda (Estilo Figma) */}
          <div className="relative flex w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={handleSearchChange}
              // CAMBIO: Estilo del input
              className="border border-gray-300 rounded-l-lg p-2 pl-4 w-full border-r-0 focus:ring-0 focus:border-gray-300" 
            />
            {/* CAMBIO: Botón de búsqueda beige */}
            <button className="bg-stone-200 text-gray-600 px-4 rounded-r-lg border border-gray-300 border-l-0 hover:bg-stone-300 transition-colors">
              <IconSearch />
            </button>
          </div>
        </div>

        {/* --- 7. Tabla de datos --- */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre <IconSort />
                </th>
                {/* CAMBIO: "Ver" ahora es "Secciones" */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* --- Estados de Carga y Error --- */}
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              )}
              
              {error && (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-red-600 font-semibold">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    No se encontraron Modulos.
                  </td>
                </tr>
              )}

              {/* --- Mapeo de datos --- */}
              {!loading && !error && filteredUnits.map((unit, index) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meta ? (meta.from + index) : unit.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {unit.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* CAMBIO: Botón verde sólido */}
                    <button className="text-white  hover:bg-bron-600 p-2 rounded-lg leading-none">
                      <IconView />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {/* CAMBIO: Botón azul sólido */}
                    <button className="text-white  hover:bg-blue-600 p-2 rounded-lg leading-none">
                      <IconEdit />
                    </button>
                    {/* CAMBIO: Botón rojo sólido */}
                    <button className="text-white  hover:bg-red-600 p-2 rounded-lg leading-none">
                      <IconDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- 8. Paginación --- */}
        {meta && links && !loading && !error && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            
            <div className="text-sm text-gray-700 mb-2 md:mb-0">
              Mostrando <span className="font-medium">{meta.from}</span> a <span className="font-medium">{meta.to}</span> de <span className="font-medium">{meta.total}</span> resultados
            </div>

            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {meta.links.map((link: Meta['links'][number], index: number) => (
                <button
                  key={index}
                  onClick={() => handlePageClick(link.url)}
                  disabled={!link.url || link.active}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`
                    relative inline-flex items-center px-4 py-2 border text-sm font-medium
                    ${link.active 
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }
                    ${!link.url ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                    ${index === 0 ? 'rounded-l-md' : ''}
                    ${index === meta.links.length - 1 ? 'rounded-r-md' : ''}
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