import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, PlusCircle } from "lucide-react";
import { useCensoModules } from "../hooks/useCensoModules";

const CensoModulesView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    censo,
    indexs,
    rows,
    loading,
    saving,
    error,
    allChecked,
    toggleModule,
    toggleAllModules,
    changeIndex,
    saveChanges,
  } = useCensoModules(id ?? "");

  const handleSave = async () => {
    const ok = await saveChanges();
    if (ok) {
      console.log("Módulos guardados correctamente");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between bg-[var(--pantone-7421)] px-6 py-4 text-white">
          <div>
            <h1 className="text-lg font-semibold">Módulos</h1>
            <p className="text-sm text-white/80">
              {censo ? `Censo: ${censo.name}` : "Asignación de módulos"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Cerrar
          </button>
        </div>

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => toggleAllModules(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span>Seleccionar</span>
                    </div>
                  </th>
                  <th className="px-4 py-3">Módulo</th>
                  <th className="px-4 py-3">Índice a asignar</th>
                  <th className="px-4 py-3">Asignación actual</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No hay módulos disponibles.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.module_id}
                      className="border-t border-gray-200 text-sm text-gray-700"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.checked}
                          onChange={(e) =>
                            toggleModule(row.module_id, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {row.module_name}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={row.selected_index_id}
                          onChange={(e) =>
                            changeIndex(row.module_id, e.target.value)
                          }
                          disabled={!row.checked}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--pantone-7421)] disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          <option value="">Selecciona un índice</option>
                          {indexs.map((index) => (
                            <option key={index.id} value={index.id}>
                              {index.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        {row.checked ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            {row.selected_index_id
                              ? (indexs.find(
                                  (index) =>
                                    String(index.id) ===
                                    String(row.selected_index_id),
                                )?.name ?? "Sin asignar")
                              : (row.stored_index_name ?? "Sin asignar")}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Sin asignar
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (!row.encrypted_id) return;
                            navigate(`/censos/secciones/${row.encrypted_id}`);
                          }}
                          disabled={!(row.checked && row.encrypted_id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          title={
                            row.checked && row.encrypted_id
                              ? "Ir a secciones"
                              : "Selecciona el módulo y guárdalo primero"
                          }
                        >
                          <PlusCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CensoModulesView;
