import HeaderSection from "../components/HeaderSection";
import CuestionariosTable from "../components/CuestionariosTable";
import GraphicsSection from "../components/GraphicsSection";

const DashboardPage = () => {
  return (
    <div className="p-6">
      <HeaderSection />

      <div className="flex flex-col lg:flex-row gap-13 mt-10">
        <div className="flex-2 bg-white rounded-x1 shadow-md overflow-hidden">
          <CuestionariosTable />
        </div>
        <div className="flex-2 bg-white rounded-xl shadow-md overflow-hidden">
          <GraphicsSection />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
