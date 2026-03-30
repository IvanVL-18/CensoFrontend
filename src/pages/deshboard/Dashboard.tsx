import { useEffect, useMemo, useState } from "react";
import { Users, Building2, ClipboardList } from "lucide-react";

import StatCard from "./components/StatCard";
import QuestionnairesCard from "./components/QuestionnairesCard";
import ChartsCard from "./components/ChartsCard";

import type { QuestionnaireItem, Meta, Links } from "./dashboard.types";

import {
  getDashboardCount,
  getCentralizedInstitutions,
  getAllCensos,
  getQuestionsByCenso,
} from "./Dashboard.service";

type SortField = "id" | "name";
type SortDir = "asc" | "desc";

export default function Dashboard() {
  const [usersTotal, setUsersTotal] = useState(0);
  const [instTotal, setInstTotal] = useState(0);
  const [censosTotal, setCensosTotal] = useState(0);

  const [centralizedCount, setCentralizedCount] = useState(0);
  const [totalInstitutions, setTotalInstitutions] = useState(0);

  const [qByCenso, setQByCenso] = useState<{ name: string; total: number }[]>(
    []
  );

  const [items, setItems] = useState<QuestionnaireItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [links, setLinks] = useState<Links | null>(null);

  const [search, setSearch] = useState("");
  const [loadingTable, setLoadingTable] = useState(true);
  const [errorTable, setErrorTable] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchCensos = async (page: number) => {
    try {
      setLoadingTable(true);
      setErrorTable(null);

      const res = await getAllCensos(page);

      setItems(res.data ?? []);
      setMeta(res.meta ?? null);
      setLinks(res.links ?? null);
    } catch (e: any) {
      console.error("fetchCensos error:", e);
      setErrorTable(e?.message || "Error al cargar censos");
      setItems([]);
      setMeta(null);
      setLinks(null);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    (async () => {
      const [usersRes, instRes, censosRes] = await Promise.allSettled([
        getDashboardCount("users"),
        getDashboardCount("institutions"),
        getDashboardCount("censos"),
      ]);

      if (usersRes.status === "fulfilled") {
        setUsersTotal(usersRes.value.total ?? 0);
      } else {
        console.error("Users count error:", usersRes.reason);
      }

      if (instRes.status === "fulfilled") {
        setInstTotal(instRes.value.total ?? 0);
      } else {
        console.error("Institutions count error:", instRes.reason);
      }

      if (censosRes.status === "fulfilled") {
        setCensosTotal(censosRes.value.total ?? 0);
      } else {
        console.error("Censos count error:", censosRes.reason);
      }

      try {
        const inst = await getCentralizedInstitutions();
        setCentralizedCount(inst.total_centralized_institutions ?? 0);
        setTotalInstitutions(inst.total_institutions ?? 0);
      } catch (e: any) {
        console.error("Centralized institutions error:", e?.message || e);
      }

      try {
        const qb = await getQuestionsByCenso();

        setQByCenso(
          (qb.data ?? []).map((x: any) => ({
            name: String(x.name ?? x.censo_name ?? x.census_name ?? ""),
            total: Number(
              x.total_preguntas ?? x.total_questions ?? x.total ?? 0
            ),
          }))
        );
      } catch (e: any) {
        console.error("Questions by censo error:", e?.message || e);
        setQByCenso([]);
      }

      await fetchCensos(1);
    })();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDir("asc");
  };

  const filteredItems = useMemo(() => {
    const s = search.trim().toLowerCase();

    let arr = items;

    if (s) {
      arr = arr.filter((x) => (x.name || "").toLowerCase().includes(s));
    }

    if (sortField === "name") {
      const dir = sortDir === "asc" ? 1 : -1;
      return [...arr].sort((a, b) => a.name.localeCompare(b.name) * dir);
    }

    return sortDir === "asc" ? arr : [...arr].reverse();
  }, [items, search, sortField, sortDir]);

  const handlePageClick = (url: string | null) => {
    if (!url) return;

    try {
      const u = new URL(url);
      const page = Number(u.searchParams.get("page") || "1");
      fetchCensos(page);
    } catch {
      const match = url.match(/page=(\d+)/);
      const page = match ? Number(match[1]) : 1;
      fetchCensos(page);
    }
  };

  const handlePageNumber = (page: number) => {
    fetchCensos(page);
  };

  const handleViewCenso = (id: string) => {
    console.log("Ver censo:", id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
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
          title="CENSOS"
          value={censosTotal.toLocaleString()}
          icon={<ClipboardList className="h-5 w-5 text-cyan-600" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuestionnairesCard
          title="Censos"
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
          baseUrl="/dashboard/get-censos"
          onSort={handleSort}
        />

        <ChartsCard
          title="Gráficas"
          centralizedCount={centralizedCount}
          totalInstitutions={totalInstitutions}
          questionsByCenso={qByCenso}
        />
      </div>
    </div>
  );
}