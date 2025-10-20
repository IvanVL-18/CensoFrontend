export default function AdministracionTable() {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Tabla de Encuestados</h3>
      {/* Aquí puedes agregar la tabla real con los datos de Encuestados */}
      <table className="min-w-full table-auto mt-2">
        <thead>
          <tr>
            <th className="py-2 px-4">Nombre</th>
            <th className="py-2 px-4">Rol</th>
            <th className="py-2 px-4">Institución</th>
          </tr>
        </thead>
        <tbody>
          {/* Aquí se iteraría sobre los datos */}
          <tr>
            <td className="py-2 px-4">Alexis Maturano</td>
            <td className="py-2 px-4">Encuestado</td>
            <td className="py-2 px-4">Oficina Mayor</td>
          </tr>
          {/* Agrega más filas de la tabla aquí */}
        </tbody>
      </table>
    </div>
  );
}
