import { useMemo, useState } from "react";
import StatCard from "./components/StatCard";
import QuestionnairesCard from "./components/QuestionnairesCard";
import ChartsCard from "./components/ChartsCard";
import { Users, Building2, ClipboardList } from "lucide-react";

import type {
  StatCardItem,
  QuestionnaireItem,
  DonutItem,
  BarItem,
} from "./dashboard.types";

export default function DashboardPage() {
  const stats: StatCardItem[] = useMemo(
    () => [
      { title: "Usuarios", value: "14,566", icon: Users, color: "blue" },
      { title: "Instituciones", value: "14,566", icon: Building2, color: "green" },
      { title: "Cuestionarios", value: "14,566", icon: ClipboardList, color: "cyan" },
    ],
    []
  );

  const [qSearch, setQSearch] = useState("");

  const questionnaires: QuestionnaireItem[] = [
    { id: "1", name: "Censo prueba" },
  ];

  const filtered = useMemo(() => {
    const q = qSearch.trim().toLowerCase();
    if (!q) return questionnaires;
    return questionnaires.filter((x) => x.name.toLowerCase().includes(q));
  }, [qSearch, questionnaires]);

  const donutData: DonutItem[] = [
    { label: "Centralizadas", value: 72 },
    { label: "Descentralizadas", value: 28 },
  ];

  const barData: BarItem[] = [
    { label: "Censo de prueba", value: 16 },
    { label: "Censo Nacional", value: 32 },
    { label: "Censo Yolo", value: 24 },
    { label: "Censo Nal.", value: 20 },
  ];

  return (
    <div className="space-y-4">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            color={s.color}
            onAction={() => console.log("Action:", s.title)}
          />
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuestionnairesCard
          title="Cuestionarios"
          searchValue={qSearch}
          onSearchChange={setQSearch}
          items={filtered}
          onView={(id) => console.log("Ver cuestionario:", id)}
        />

        <ChartsCard
          title="Gráficas"
          donutTitle="Tipo de Instituciones"
          donutData={donutData}
          barTitle="Cuestionarios"
          barData={barData}
        />
      </div>
    </div>
  );
}
