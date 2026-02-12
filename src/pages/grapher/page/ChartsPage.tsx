// src/pages/ChartsPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import GeneralCharts from "../components/GeneralCharts";
import QuestionnaireCharts from "../components/QuestionnaireCharts";
import type { ChartKind, GeneralSummary, InstitutionStat } from "../components/charts";

function isValidKind(value: string | null): value is ChartKind {
  return value === "general" || value === "cuestionario";
}

export default function ChartsPage() {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("tipo");
  const tipo = isValidKind(raw) ? raw : null;

  const [summary, setSummary] = useState<GeneralSummary | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tipo !== "general") return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = {
          summary: { totalQuestions: 120, mappedQuestions: 85 },
          institutions: [
            { name: "Oficialía\nmayor", value: 40 },
            { name: "Seguridad\npública", value: 80 },
            { name: "Contraloría", value: 70 },
            { name: "CPE", value: 55 },
          ],
        };

        setSummary(data.summary);
        setInstitutions(data.institutions);
      } catch (err) {
        setError("No se pudieron obtener los datos de las gráficas.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tipo]);

  return (
    <div className="bg-white rounded-xl border border-black/5 p-4 sm:p-6 shadow-sm sm:shadow-md">
      {!tipo && <EmptyChartsHint />}

      {tipo === "general" && (
        <>
          {loading && <ChartsSkeleton />}
          {error && (
            <p className="text-sm text-red-600 font-medium py-4">{error}</p>
          )}
          {!loading && !error && summary && (
            <GeneralCharts summary={summary} institutions={institutions} />
          )}
        </>
      )}

      {tipo === "cuestionario" && <QuestionnaireCharts />}
    </div>
  );
}

function EmptyChartsHint() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center px-2">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F1EA] border border-[#7C1227]/20">
        <BarChart3 className="h-5 w-5 text-[#7C1227]" />
      </div>
      <p className="text-sm font-medium text-[#4b1220]">
        Selecciona un tipo de gráfica
      </p>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-100 rounded-md" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-52 bg-gray-100 rounded-2xl" />
        <div className="h-52 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}
