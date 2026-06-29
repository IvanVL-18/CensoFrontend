import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { askAi } from "./CensusQuestions.service";
import { useToast } from "../../../context/ToastContext";

interface AiChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  /** census_question_id cifrado de la pregunta asignada a analizar. */
  censusQuestionId: string | null;
  /** Nombre de la pregunta, para mostrarlo en el encabezado. */
  questionName?: string | null;
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

export function AiChatWidget({
  isOpen,
  onClose,
  censusQuestionId,
  questionName,
}: AiChatWidgetProps) {
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [histories, setHistories] = useState<HistoriesMap>(loadHistories);
  const [loading, setLoading] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const messages = censusQuestionId ? (histories[censusQuestionId] ?? []) : [];
  const canSend = Boolean(censusQuestionId) && !loading && prompt.trim().length > 0;

  // Persistir el historial en sessionStorage (sobrevive recargas, sin backend).
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
    } catch {
      /* sin persistencia si el storage no está disponible */
    }
  }, [histories]);

  // Auto-scroll al último mensaje / indicador de escritura.
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  // Al cerrar el modal: cancelar la petición en curso y limpiar el input.
  useEffect(() => {
    if (!isOpen) {
      controllerRef.current?.abort();
      controllerRef.current = null;
      setLoading(false);
      setPrompt("");
    }
  }, [isOpen]);

  // Cancelar cualquier petición pendiente al desmontar.
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const appendMessage = (id: string, message: ChatMessage) => {
    setHistories((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), message],
    }));
  };

  const handleSend = async () => {
    const text = prompt.trim();
    if (!censusQuestionId || !text || loading) return;

    const id = censusQuestionId;
    appendMessage(id, { role: "user", content: text });
    setPrompt("");
    setLoading(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const { response } = await askAi(id, text, controller.signal);
      appendMessage(id, {
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
      appendMessage(id, { role: "ai", content: msg, error: true });
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) void handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[80vh] max-h-[640px] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 bg-[var(--pantone-7421)] px-4 py-3 text-white">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h2 className="text-lg font-bold">Análisis con IA</h2>
            </div>
            {questionName && (
              <p className="mt-0.5 truncate text-xs text-white/80">
                {questionName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-300"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cuerpo: historial de mensajes */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
          {messages.length === 0 && !loading ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-500">
              Escribe una consulta para analizar las respuestas de esta pregunta
              con IA.
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

              {loading && (
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
              disabled={!censusQuestionId || loading}
              rows={1}
              placeholder="Escribe tu consulta…"
              className="max-h-28 min-h-[40px] flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--pantone-7421)] disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!canSend}
              aria-label="Enviar consulta"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pantone-7421)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
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
    </div>
  );
}

export default AiChatWidget;
