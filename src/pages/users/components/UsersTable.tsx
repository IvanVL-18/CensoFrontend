// src/components/users/UsersTable.tsx
import { Eye, Trash2, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { AvatarCircle } from "./AvatarCircle";

export interface UserRow {
  id: string | number;
  fullName: string;
  avatarUrl?: string | null;
}

interface UsersTableProps {
  users: UserRow[];
  sortDirection: "asc" | "desc";
  onToggleSort: () => void;
  onView: (user: UserRow) => void;
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}

export function UsersTable({
  users,
  sortDirection,
  onToggleSort,
  onView,
  onEdit,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-b-2xl overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs font-semibold text-gray-500">
            <th className="px-4 py-3 w-12">#</th>
            <th className="px-4 py-3 w-16">Avatar</th>
            <th className="px-4 py-3">
              <button
                type="button"
                onClick={onToggleSort}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[#691B31]"
              >
                <span>Nombre Completo</span>
                {sortDirection === "asc" ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </th>
            <th className="px-4 py-3 text-right pr-6">Eliminar</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-xs text-gray-600">
                {index + 1}
              </td>

              <td className="px-4 py-3">
                <AvatarCircle fullName={user.fullName} avatarUrl={user.avatarUrl} />
              </td>

              <td className="px-4 py-3 text-sm text-gray-800">
                {user.fullName}
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end items-center gap-2">
                  <button
                    onClick={() => onView(user)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#DDC9A3] text-[#691B31] hover:bg-[#E6D8B5] transition-colors"
                    title="Ver"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onEdit(user)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-[#691B31]/40 text-[#691B31] hover:bg-[#FDF5F7] transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onDelete(user)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#691B31] text-white hover:bg-[#4D0F24] transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No hay encuestados para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
