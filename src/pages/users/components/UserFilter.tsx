type UserFilterProps = {
  selectedUserType: string;
  onUserTypeChange: (userType: string) => void;
};

const UserFilter = ({ selectedUserType, onUserTypeChange }: UserFilterProps) => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-[#f7f7f7] rounded-lg shadow-md w-full md:w-1/2 mb-8">
      <label htmlFor="userType" className="text-lg font-semibold text-[#5F0F1B] mb-2">Elige un usuario</label>

      <div className="flex items-center bg-white border border-[#ddd] rounded-md p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#5F0F1B] transition-all duration-200">
        <select
          id="userType"
          value={selectedUserType}
          onChange={(e) => onUserTypeChange(e.target.value)}
          className="w-full bg-transparent text-[#5F0F1B] focus:outline-none"
          aria-label="Selecciona el tipo de usuario"
        >
          <option value="encuestados">Encuestados</option>
          <option value="administracion">Administración</option>
          <option value="managers">Managers</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilter;
