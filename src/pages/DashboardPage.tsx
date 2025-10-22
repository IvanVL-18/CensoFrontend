import { Users, Landmark, ClipboardList } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import SectionCard from "../components/dashboard/SectionCard";
import QuestionnairesTable from "../components/dashboard/QuestionnairesTable";
import DonutInstitutions from "../components/dashboard/DonutInstitutions";
import BarQuestionnaires from "../components/dashboard/BarQuestionnaires";

export default function DashboardPage(){
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Usuarios" value="14,566" icon={<Users size={22}/>} accent="blue"/>
        <StatCard title="Instituciones" value="14,566" icon={<Landmark size={22}/>} accent="green"/>
        <StatCard title="Cuestionarios" value="14,566" icon={<ClipboardList size={22}/>} accent="teal"/>
      </div>

      {/* Tabla + Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Cuestionarios">
          <QuestionnairesTable />
        </SectionCard>

        <SectionCard title="Gráficas">
          <div className="grid grid-cols-1 gap-4">
            <DonutInstitutions />
            <BarQuestionnaires />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
