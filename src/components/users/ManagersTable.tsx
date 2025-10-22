type User = {
  id: number;
  avatar: string;
  fullName: string;
  role: string;
  institution: string;
};

type ManagersTableProps = {
  users: User[]; // Recibimos los datos de los usuarios como prop
};

export default function ManagersTable({ users }: ManagersTableProps) {
  return (
    <table className="min-w-full table-auto">
      <thead>
        <tr className="border-b text-sm text-neutral-500">
          <th className="py-2 px-4">Avatar</th>
          <th className="py-2 px-4">Nombre Completo</th>
          <th className="py-2 px-4">Rol</th>
          <th className="py-2 px-4">Institución</th>
          <th className="py-2 px-4">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b text-sm text-neutral-600">
            <td className="py-2 px-4">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-8 h-8 rounded-full"
              />
            </td>
            <td className="py-2 px-4">{user.fullName}</td>
            <td className="py-2 px-4">{user.role}</td>
            <td className="py-2 px-4">{user.institution}</td>
            <td className="py-2 px-4 flex gap-2 justify-center">
              <button className="text-green-500 hover:text-green-600" title="Ver">
                👁️
              </button>
              <button className="text-red-500 hover:text-red-600" title="Eliminar">
                🗑️
              </button>
            </td>
          </tr>
        ))}
        {users.length === 0 && (
          <tr>
            <td colSpan={5} className="py-6 text-center text-neutral-400">
              No hay resultados
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
