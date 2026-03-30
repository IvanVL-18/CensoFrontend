import { useState, useEffect } from "react";
import { getMyCensuses } from "../Answers.service";
import type { MyCensus } from "../Answers.types";

export function useAnswersCensuses() {
  const [censuses, setCensuses] = useState<MyCensus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getMyCensuses()
      .then((res) => {
        setCensuses(res.censuses);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        setError(err.message || "Error al cargar los censos.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { censuses, loading, error };
}
