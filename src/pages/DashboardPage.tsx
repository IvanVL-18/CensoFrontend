import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Users, Landmark, ClipboardList } from "lucide-react";
import StatCard from "../components/ui/dashboard/StatCard";
import SectionCard from "../components/ui/dashboard/SectionCard";

// ⬇️ Lazy load para reducir costo inicial
const QuestionnairesTable = lazy(() => import("../components/ui/dashboard/QuestionnairesTable"));
const DonutInstitutions   = lazy(() => import("../components/ui/dashboard/DonutInstitutions"));
const BarQuestionnaires   = lazy(() => import("../components/ui/dashboard/BarQuestionnaires"));

// Tipos de datos (cuando conectes API)
import type { QRow } from "../components/ui/dashboard/QuestionnairesTable";
import type { DonutPoint } from "../components/ui/dashboard/DonutInstitutions";
import type { BarPoint } from "../components/ui/dashboard/BarQuestionnaires";

export default function DashboardPage(){
  // 🔹 Estado mínimo para server-side table
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [rows, setRows] = useState<QRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingTable, setLoadingTable] = useState(false);

  // 🔹 Datos de gráficas (desde API cuando lo conectes)
  const [donutData, setDonutData] = useState<DonutPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  // 🔸 Fetch simulado (deja los arrays vacíos hasta que tengas API)
  const fetchTable = useCallback(async () => {
    setLoadingTable(true);
    try {
      // TODO: const { data, total } = await api.getQuestionnaires({ q, page, perPage })
      setRows([]);      // ⬅️ sin datos de ejemplo
      setTotal(0);
    } finally {
      setLoadingTable(false);
    }
  }, [q, page]);

  const fetchCharts = useCallback(async () => {
    // TODO: const d1 = await api.getInstitutionsBreakdown()
    // TODO: const d2 = await api.getQuestionnaireTotals()
    setDonutData([]);  // ⬅️ vacíos hasta conectar
    setBarData([]);
  }, []);

  useEffect(() => { fetchTable(); }, [fetchTable]);
  useEffect(() => { fetchCharts(); }, [fetchCharts]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Usuarios"       value="—" icon={<Users size={22}/>} accent="blue"/>
        <StatCard title="Instituciones"  value="—" icon={<Landmark size={22}/>} accent="green"/>
        <StatCard title="Cuestionarios"  value="—" icon={<ClipboardList size={22}/>} accent="teal"/>
      </div>

      {/* Tabla + Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Cuestionarios">
          <Suspense fallback={<div className="text-sm text-neutral-500">Cargando tabla…</div>}>
            <QuestionnairesTable
              rows={rows}
              page={page}
              perPage={perPage}
              total={total}
              query={q}
              loading={loadingTable}
              onQueryChange={(val) => { setQ(val); setPage(1); }}
              onPageChange={setPage}
              onView={(r) => console.log("ver", r)}
            />
          </Suspense>
        </SectionCard>

        <SectionCard title="Gráficas">
          <div className="grid grid-cols-1 gap-4">
            <Suspense fallback={<div className="text-sm text-neutral-500">Cargando donut…</div>}>
              <DonutInstitutions data={donutData} />
            </Suspense>
            <Suspense fallback={<div className="text-sm text-neutral-500">Cargando barras…</div>}>
              <BarQuestionnaires data={barData} />
            </Suspense>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
