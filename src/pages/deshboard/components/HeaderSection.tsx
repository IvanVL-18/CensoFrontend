import { Users, Building, FileText } from "lucide-react";

const HeaderSection = () => {
  return (
    <div className="flex justify-between mb-6 p-4">
      {/* USUARIOS */}
      <div className="flex items-center bg-white p-3 rounded-lg border-l-8 border-[#003366] w-1/4 justify-start shadow-md">
        <Users size={24} className="mr-2 text-[#0E5AA7]" />
        <div>
          <span className="font-semibold">USUARIOS</span>
          <div className="text-lg">14,566</div>
        </div>
      </div>

      {/* INSTITUCIONES */}
      <div className="flex items-center bg-white p-4 rounded-lg border-l-8 border-[#006400] w-1/4 justify-start shadow-md">
        <Building size={24} className="mr-2 text-[#1B7A2D]" />
        <div>
          <span className="font-semibold">INSTITUCIONES</span>
          <div className="text-lg">14,566</div>
        </div>
      </div>

      {/* CUESTIONARIOS */}
      <div className="flex items-center bg-white p-4 rounded-lg border-l-8 border-[#12B8CF] w-1/4 justify-start shadow-md">
        <FileText size={24} className="mr-2 text-[#12B8CF]" />
        <div>
          <span className="font-semibold">CUESTIONARIOS</span>
          <div className="text-lg">14,566</div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
