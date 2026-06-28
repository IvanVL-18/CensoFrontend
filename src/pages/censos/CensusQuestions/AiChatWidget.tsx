import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, X, Send, Loader2, ChevronDown } from "lucide-react";
import { askAi } from "./CensusQuestions.service";
import { useToast } from "../../../context/ToastContext";

export interface AiQuestionOption {
  /** census_question_id cifrado (value del selector). */
  censusQuestionId: string;
  /** Nombre de la pregunta (etiqueta del selector). */
  name: string;
}

interface AiChatWidgetProps {
  /** Preguntas analizables (solo las asignadas, con census_question_id != null). */
  questions: AiQuestionOption[];
}

type ChatMessage = {
  role: "user" | "ai";
  content: string;
  error?: boolean;
};

/** Historial en memoria por census_question_id (cada pregunta tiene su propio hilo). */
type HistoriesMap = Record<string, ChatMessage[]>;

const STORAGE_KEY = "ai-chat-histories";

const loadHistories = (): HistoriesMap => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoriesMap) : {};
  } catch {
    return {};
  }
};

export function AiChatWidget({ questions }: AiChatWidgetProps) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [histories, setHistories] = useState<HistoriesMap>(loadHistories);
  // census_question_id cuya respuesta está en curso (null si no hay petición).
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const hasQuestions = questions.length > 0;
  const messages = selectedId ? (histories[selectedId] ?? []) : [];
  const isLoadingSelected = loadingId !== null && loadingId === selectedId;
  const canSend =
    Boolean(selectedId) && loadingId === null && prompt.trim().length > 0;

  // Persistir el historial en sessionStorage (sobrevive recargas, no usa backend).
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
    } catch {
      /* sin persistencia si el storage no está disponible */
    }
  }, [histories]);

  // Mantener una selección válida cuando cambian las preguntas disponibles.
  useEffect(() => {
    if (!hasQuestions) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && questions.some((q) => q.censusQuestionId === prev)
        ? prev
        : questions[0].censusQuestionId,
    );
  }, [questions, hasQuestions]);

  // Auto-scroll al último mensaje / indicador de escritura.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingSelected]);

  // Cancelar cualquier petición pendiente al desmontar.
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const appendMessage = (censusQuestionId: string, message: ChatMessage) => {
    setHistories((prev) => ({
      ...prev,
      [censusQuestionId]: [...(prev[censusQuestionId] ?? []), message],
    }));
  };

  const handleClose = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setLoadingId(null);
    setOpen(false);
  };

  const handleSelectChange = (value: string) => {
    setSelectedId(value || null);
    setPrompt("");
  };

  const handleSend = async () => {
    const text = prompt.trim();
    if (!selectedId || !text || loadingId !== null) return;

    const censusQuestionId = selectedId;
    appendMessage(censusQuestionId, { role: "user", content: text });
    setPrompt("");
    setLoadingId(censusQuestionId);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const { response } = await askAi(censusQuestionId, text, controller.signal);
      appendMessage(censusQuestionId, {
        role: "ai",
        content: response?.trim() || "Sin respuesta.",
      });
    } catch (err: unknown) {
      const e = err as {
        name?: string;
        response?: { data?: { message?: string } };
      };
      if (e?.name === "CanceledError" || e?.name === "AbortError") return;
      const msg =
        e?.response?.data?.message ?? "No se pudo obtener la respuesta de la IA.";
      addToast(msg, "danger");
      appendMessage(censusQuestionId, {
        role: "ai",
        content: msg,
        error: true,
      });
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoadingId(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) void handleSend();
    }
  };

  const selectedName = useMemo(
    () => questions.find((q) => q.censusQuestionId === selectedId)?.name ?? null,
    [questions, selectedId],
  );

  return (
    <>
      {/* Bolita flotante (FAB) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar análisis con IA" : "Abrir análisis con IA"}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--pantone-7421)] text-white shadow-lg transition hover:scale-105 hover:opacity-90"
      >
        {open ? <X size={26} /> : <Bot size={26} />}
      </button>

      {/* Panel de chat */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          style={{
            height: "70vh",
            animation: "ai-chat-in 0.2s ease-out",
          }}
        >
          <style>{`
            @keyframes ai-chat-in {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-[var(--pantone-7421)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h2 className="text-base font-bold">Análisis con IA</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar panel"
            >
              <X size={22} />
            </button>
          </div>

          {/* Selector de pregunta */}
          <div className="border-b border-gray-200 bg-white p-3">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Pregunta a analizar
            </label>
            {hasQuestions ? (
              <div className="relative">
                <select
                  value={selectedId ?? ""}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm outline-none transition focus:border-[var(--pantone-7421)]"
                >
                  {questions.map((q) => (
                    <option key={q.censusQuestionId} value={q.censusQuestionId}>
                      {q.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                No hay preguntas asignadas para analizar.
              </p>
            )}
          </div>

          {/* Cuerpo: historial de mensajes */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {!selectedId ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-500">
                Selecciona una pregunta para analizar.
              </div>
            ) : messages.length === 0 && !isLoadingSelected ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-500">
                {selectedName
                  ? `Escribe una consulta para analizar “${selectedName}”.`
                  : "Escribe una consulta para analizar esta pregunta."}
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "rounded-br-sm bg-[var(--pantone-7421)] text-white"
                          : msg.error
                            ? "rounded-bl-sm border border-red-200 bg-red-50 text-red-700"
                            : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoadingSelected && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Analizando, esto puede tardar un momento…</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer: input */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!selectedId || loadingId !== null}
                rows={1}
                placeholder={
                  selectedId
                    ? "Escribe tu consulta…"
                    : "Selecciona una pregunta para analizar"
                }
                className="max-h-28 min-h-[40px] flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--pantone-7421)] disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!canSend}
                aria-label="Enviar consulta"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pantone-7421)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingSelected ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              Enter para enviar · Shift + Enter para salto de línea
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AiChatWidget;
