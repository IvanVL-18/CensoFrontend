import {
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  MoreVertical,
  Calendar,
  ListOrdered,
  Copy,
  Eye,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Censo, Meta } from "../Censos.types";

export interface CensosCardsProps {
  censos: Censo[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onView: (censo: Censo) => void;
  onEdit: (censo: Censo) => void;
  onBan: (censo: Censo) => void;
  onRestore: (censo: Censo) => void;
  onDelete: (censo: Censo) => void;
  onModules: (censo: Censo) => void;
  onClone: (censo: Censo) => void;
}

export function CensosCards({
  censos,
  loading,
  error,
  onView,
  onEdit,
  onBan,
  onRestore,
  onDelete,
  onModules,
  onClone,
}: CensosCardsProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuOpenId) return;

      const activeMenu = menuRefs.current[menuOpenId];
      if (activeMenu && !activeMenu.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 font-semibold bg-red-50 rounded-lg border border-red-200">
        {error}
      </div>
    );
  }

  if (censos.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        No se encontraron censos.
      </div>
    );
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const getDaysLeft = (dateStr?: string | null) => {
    if (!dateStr) return null;

    const end = new Date(dateStr);
    if (isNaN(end.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffMs = end.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const getStartDateStyles = (isInactive: boolean) => {
    if (isInactive) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-[#6b7280]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    return {
      row: "bg-white border border-emerald-300",
      icon: "text-[#111827]",
      label: "text-[#111827]",
      value: "text-[#111827]",
    };
  };

  const getEndDateStyles = (daysLeft: number | null, isInactive: boolean) => {
    if (isInactive) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-[#6b7280]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft === null) {
      return {
        row: "bg-white border border-gray-200",
        icon: "text-[#111827]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 90) {
      return {
        row: "bg-white border border-emerald-300",
        icon: "text-[#111827]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 60) {
      return {
        row: "bg-white border border-lime-300",
        icon: "text-[#111827]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 40) {
      return {
        row: "bg-white border border-yellow-300",
        icon: "text-[#111827]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 20) {
      return {
        row: "bg-white border border-amber-300",
        icon: "text-[#111827]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 7) {
      return {
        row: "bg-white border border-orange-300",
        icon: "text-[#111827]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    return {
      row: "bg-white border border-red-300",
      icon: "text-[#111827]",
      label: "text-[#111827]",
      value: "text-[#111827]",
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {censos.map((censo) => {
        const isActive = !censo.deleted_at || censo.deleted_at === "null";
        const isInactive = !isActive;
        const statusText = isActive ? "Activo" : "Inactivo";

        let yearDisplay: number | string = censo.year || "";
        if (!yearDisplay && censo.created_at) {
          const date = new Date(censo.created_at);
          yearDisplay = isNaN(date.getTime()) ? "—" : date.getFullYear();
        } else if (!yearDisplay) {
          yearDisplay = "—";
        }

        const startDate = formatDate(censo.start_date);
        const endDate = formatDate(censo.end_date);
        const daysLeft = getDaysLeft(censo.end_date);

        const startStyles = getStartDateStyles(isInactive);
        const endStyles = getEndDateStyles(daysLeft, isInactive);

        return (
          <div
            key={censo.id}
            className={`rounded-2xl shadow-md border flex flex-col overflow-hidden transition-all duration-300 ${
              isInactive
                ? "bg-[#fafafb] border-[#eceff3]"
                : "bg-white border-gray-200 hover:shadow-xl hover:border-red-700 group"
            }`}
          >
            <div
              className={`flex justify-between items-start p-4 ${
                isInactive ? "bg-[#c4cad3]" : "bg-red-900"
              }`}
            >
              <h3 className="text-lg font-semibold text-white line-clamp-2 pr-3">
                {censo.name}
              </h3>

              <div
                className="relative shrink-0"
                ref={(el) => {
                  menuRefs.current[String(censo.id)] = el;
                }}
              >
                <button
                  onClick={() =>
                    setMenuOpenId(
                      menuOpenId === String(censo.id) ? null : String(censo.id),
                    )
                  }
                  className={`p-1.5 rounded-full transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white ${
                    isInactive ? "hover:bg-white/20" : "hover:bg-red-500"
                  }`}
                  aria-label="Opciones"
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpenId === String(censo.id) && (
                  <div className="absolute right-0 mt-2 w-auto min-w-fit whitespace-nowrap rounded-xl border border-gray-200 bg-white shadow-xl z-20 py-1.5">
                    {isActive ? (
                      <>
                        <button
                          onClick={() => {
                            onView(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Eye size={16} className="shrink-0" />
                          <span>Detalles</span>
                        </button>

                        <button
                          onClick={() => {
                            onEdit(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Edit size={16} className="shrink-0" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            onBan(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        >
                          <Ban size={16} className="shrink-0" />
                          <span>Desactivar</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onView(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Eye size={16} className="shrink-0" />
                          <span>Detalles</span>
                        </button>

                        <button
                          onClick={() => {
                            onRestore(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-gray-100 transition-colors"
                        >
                          <CircleArrowUp size={16} className="shrink-0" />
                          <span>Restaurar</span>
                        </button>

                        <button
                          onClick={() => {
                            onDelete(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 size={16} className="shrink-0" />
                          <span>Eliminar</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                    isActive
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-[#f5f7fa] text-[#6b7280] border border-[#e5e7eb]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      isActive ? "bg-green-500 animate-pulse" : "bg-[#9ca3af]"
                    }`}
                  />
                  {statusText} {yearDisplay !== "—" ? `· ${yearDisplay}` : ""}
                </span>
              </div>

              <div
                className={`space-y-3 text-sm mb-4 p-3 rounded-lg border ${
                  isInactive
                    ? "bg-[#f8f9fb] border-[#e7eaf0]"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <div
                  className={`flex items-center rounded-xl px-3 py-3 ${startStyles.row}`}
                >
                  <Calendar size={16} className={`mr-2 ${startStyles.icon}`} />
                  <span className={`font-medium ${startStyles.label}`}>
                    Inicio:
                  </span>
                  <span className={`ml-1 font-mono ${startStyles.value}`}>
                    {startDate}
                  </span>
                </div>

                <div
                  className={`flex items-center rounded-xl px-3 py-3 ${endStyles.row}`}
                >
                  <Calendar size={16} className={`mr-2 ${endStyles.icon}`} />
                  <span className={`font-medium ${endStyles.label}`}>Fin:</span>
                  <span className={`ml-1 font-mono ${endStyles.value}`}>
                    {endDate}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isInactive) return;
                    onModules(censo);
                  }}
                  disabled={isInactive}
                  className={`flex-1 font-medium py-2.5 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                    isInactive
                      ? "bg-[#eef1f5] text-[#9aa3b2] cursor-not-allowed shadow-none"
                      : "bg-[var(--pantone-465)] hover:bg-[#a8844f] text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--pantone-465)] focus:ring-offset-2"
                  }`}
                >
                  <ListOrdered size={16} />
                  Asignaciones
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isInactive) return;
                    onClone(censo);
                  }}
                  disabled={isInactive}
                  className={`flex-1 font-medium py-2.5 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                    isInactive
                      ? "bg-[#eef1f5] text-[#9aa3b2] cursor-not-allowed shadow-none"
                      : "bg-[var(--pantone-465)] hover:bg-[#a8844f] text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--pantone-465)] focus:ring-offset-2"
                  }`}
                >
                  <Copy size={16} />
                  Clonar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
