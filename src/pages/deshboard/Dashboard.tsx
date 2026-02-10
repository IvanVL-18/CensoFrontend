import { useEffect, useMemo, useState } from "react";
import { Users, Building2, ClipboardList } from "lucide-react";

import StatCard from "./components/StatCard";
import QuestionnairesCard from "./components/QuestionnairesCard";
import ChartsCard from "./components/ChartsCard";

import type {
  QuestionnaireItem,
  Meta,
  Links,
} from "../Deshboard/Dashboard.types";

import {
  getDashboardCount,
  getCentralizedInstitutions,
  getAllCensos,
  getQuestionsByCenso,
} from "../Deshboard/Dashboard.service";

export default function Dashboard() {
  // Totales (StatCards)
  const [usersTotal, setUsersTotal] = useState<number>(0);
  const [instTotal, setInstTotal] = useState<number>(0);
  const [censosTotal, setCensosTotal] = useState<number>(0);

  // Donut
  const [centralized, setCentralized] = useState<number>(0);
  const [decentralized, setDecentralized] = useState<number>(0);

  // Questions by censo (por si luego lo usas en otra gráfica)
  const [qByCenso, setQByCenso] = useState<{ name: string; total: number }[]>(
    []
  );

  // Tabla censos
  const [items, setItems] = useState<QuestionnaireItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [links, setLinks] = useState<Links | null>(null);

  const [search, setSearch] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);
  const [errorTable, setErrorTable] = useState<string | null>(null);

  // --- Carga inicial ---
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        // 1) Totales
        const [u, i, c] = await Promise.all([
          getDashboardCount("users", controller.signal),
          getDashboardCount("institutions", controller.signal),
          getDashboardCount("censos", controller.signal),
        ]);

        setUsersTotal(u.total);
        setInstTotal(i.total);
        setCensosTotal(c.total);

        // 2) Donut
        const inst = await getCentralizedInstitutions(controller.signal);
        const totalInst = inst.total_institutions ?? 0;
        const totalCentral = inst.total_centralized_institutions ?? 0;

        setCentralized(totalCentral);
        setDecentralized(Math.max(totalInst - totalCentral, 0));

        // 3) Preguntas por censo (si lo quieres luego)
        const qb = await getQuestionsByCenso(controller.signal);
        setQByCenso(
          (qb.data ?? []).map((x) => ({
            name: x.name,
            total: Number(x.total_preguntas ?? 0),
          }))
        );

        // 4) Tabla inicial
        await fetchCensos(1, controller.signal);
      } catch (e: any) {
        console.error("Dashboard error:", e?.message || e);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCensos = async (page: number, signal?: AbortSignal) => {
    try {
      setLoadingTable(true);
      setErrorTable(null);

      const res = await getAllCensos(page, signal);
      setItems(res.data ?? []);
      setMeta(res.meta ?? null);
      setLinks(res.links ?? null);
    } catch (e: any) {
      setErrorTable(
        e?.response?.data?.message || e?.message || "Error al cargar censos"
      );
    } finally {
      setLoadingTable(false);
    }
  };

  // Search en frontend
  const filteredItems = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => (x.name || "").toLowerCase().includes(s));
  }, [items, search]);

  // Pagination por URL
  const handlePageClick = (url: string | null) => {
    if (!url) return;

    try {
      const u = new URL(url);
      const page = Number(u.searchParams.get("page") || "1");
      fetchCensos(page);
      return;
    } catch {
      // si viene relative
      const match = url.match(/page=(\d+)/);
      const page = match ? Number(match[1]) : 1;
      fetchCensos(page);
    }
  };

  const handlePageNumber = (page: number) => fetchCensos(page);

  const handleViewCenso = (id: string) => {
    // aquí conectas navegación o modal
    console.log("Ver censo:", id);
  };

  return (
    <div className="space-y-6">
      {/* Cards de arriba */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="USUARIOS"
          value={usersTotal.toLocaleString()}
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="INSTITUCIONES"
          value={instTotal.toLocaleString()}
          icon={<Building2 className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="CUESTIONARIOS"
          value={censosTotal.toLocaleString()}
          icon={<ClipboardList className="h-5 w-5 text-cyan-600" />}
        />
      </div>

      {/* Tabla + Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuestionnairesCard
          title="Cuestionarios"
          searchValue={search}
          onSearchChange={setSearch}
          items={filteredItems}
          onView={handleViewCenso}
          meta={meta}
          links={links}
          loading={loadingTable}
          error={errorTable}
          onPageClick={handlePageClick}
          onPageNumber={handlePageNumber}
          baseUrl={"/dashboard/censos"}
        />

        <ChartsCard
          title="Gráficas"
          centralized={centralized}
          decentralized={decentralized}
          questionsByCenso={qByCenso}
        />
      </div>
    </div>
  );
}
