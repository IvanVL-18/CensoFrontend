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
import Loading from "../../../components/Loading";

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
      <div className="flex items-center justify-center p-12">
        <td colSpan={3} className="text-center p-6 text-gray-500">
                <Loading />
              </td>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center font-semibold text-red-600">
        {error}
      </div>
    );
  }

  if (censos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
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
        icon: "text-[#9ca3af]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    return {
      row: "bg-white border border-[#e5e7eb]",
      icon: "text-emerald-600",
      label: "text-[#111827]",
      value: "text-[#111827]",
    };
  };

  const getEndDateStyles = (daysLeft: number | null, isInactive: boolean) => {
    if (isInactive) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-[#9ca3af]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft === null) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-[#6b7280]",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 90) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-emerald-600",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 60) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-lime-600",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 40) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-yellow-500",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 20) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-amber-500",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    if (daysLeft > 7) {
      return {
        row: "bg-white border border-[#e5e7eb]",
        icon: "text-orange-500",
        label: "text-[#111827]",
        value: "text-[#111827]",
      };
    }

    return {
      row: "bg-white border border-[#e5e7eb]",
      icon: "text-red-500",
      label: "text-[#111827]",
      value: "text-[#111827]",
    };
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            className={`group flex flex-col overflow-hidden rounded-2xl border shadow-md transition-all duration-300 ${
              isInactive
                ? "border-[#eceff3] bg-[#fafafb]"
                : "border-gray-200 bg-white hover:border-[var(--pantone-7421)] hover:shadow-xl"
            }`}
          >
            <div
              className={`flex items-start justify-between p-5 ${
                isInactive ? "bg-[#c4cad3]" : "bg-[var(--pantone-7421)]"
              }`}
            >
              <div className="min-w-0 flex-1 overflow-hidden pr-3">
                <p
                  className="truncate text-lg font-semibold text-white cursor-default"
                  title={censo.name}
                >
                  {censo.name}
                </p>
              </div>
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
                  className={`rounded-full p-1.5 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                    isInactive ? "hover:bg-white/20" : "hover:bg-white/15"
                  }`}
                  aria-label="Opciones"
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpenId === String(censo.id) && (
                  <div className="absolute right-0 z-20 mt-2 min-w-fit whitespace-nowrap rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
                    {isActive ? (
                      <>
                        <button
                          onClick={() => {
                            onView(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          <Eye size={16} className="shrink-0" />
                          <span>Detalles</span>
                        </button>

                        <button
                          onClick={() => {
                            onEdit(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          <Edit size={16} className="shrink-0" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            onBan(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--pantone-7421)] transition-colors hover:bg-gray-100"
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
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          <Eye size={16} className="shrink-0" />
                          <span>Detalles</span>
                        </button>

                        <button
                          onClick={() => {
                            onRestore(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-green-600 transition-colors hover:bg-gray-100"
                        >
                          <CircleArrowUp size={16} className="shrink-0" />
                          <span>Restaurar</span>
                        </button>

                        <button
                          onClick={() => {
                            onDelete(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--pantone-7421)] transition-colors hover:bg-gray-100"
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

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ${
                    isActive
                      ? "border border-green-200 bg-green-100 text-green-800"
                      : "border border-[#e5e7eb] bg-[#f5f7fa] text-[#6b7280]"
                  }`}
                >
                  <span
                    className={`mr-1.5 h-2 w-2 rounded-full ${
                      isActive ? "bg-green-500 animate-pulse" : "bg-[#9ca3af]"
                    }`}
                  />
                  {statusText} {yearDisplay !== "—" ? `· ${yearDisplay}` : ""}
                </span>
              </div>

              <div
                className={`mb-4 space-y-3 rounded-lg border p-3 text-sm ${
                  isInactive
                    ? "border-[#e7eaf0] bg-[#f8f9fb]"
                    : "border-gray-100 bg-gray-50"
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
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-medium shadow-md transition-all duration-300 ${
                    isInactive
                      ? "cursor-not-allowed bg-[#eef1f5] text-[#9aa3b2] shadow-none"
                      : "bg-[var(--pantone-465)] text-white hover:bg-[#a8844f] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--pantone-465)] focus:ring-offset-2"
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
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-medium shadow-md transition-all duration-300 ${
                    isInactive
                      ? "cursor-not-allowed bg-[#eef1f5] text-[#9aa3b2] shadow-none"
                      : "bg-[var(--pantone-465)] text-white hover:bg-[#a8844f] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--pantone-465)] focus:ring-offset-2"
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
