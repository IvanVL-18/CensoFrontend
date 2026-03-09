import React from "react";

type Props = {
  title?: string;
};

const PermissionRolesToolbar: React.FC<Props> = ({ title = "Asignar Permisos" }) => {
  return (
    <>
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
      </div>
    </>
  );
};

export default PermissionRolesToolbar;