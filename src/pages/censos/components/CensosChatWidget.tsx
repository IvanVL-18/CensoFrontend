import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import clsx from "clsx";
import { compareQuestions, findCensus, getCensusesList } from "../Censos.service";
import type {
  CensusOption,
  ChatHistoryTurn,
  CompareCensusGroup,
  SelectedQuestion,
} from "../Censos.types";
import { CensusQuestionSearchModal } from "./CensusQuestionSearchModal";
import { ChatMarkdown } from "./ChatMarkdown";

/**
 * Flujo del asistente, en tres pasos:
 *   1. Elegir censos (panel inferior, se puede cambiar cuando sea).
 *   2. Elegir preguntas de cada censo (modal de búsqueda).
 *   3. Escribir la consulta, que va a /compare-questions con esas preguntas.
 *
 * La selección vive en un panel fijo sobre la caja de texto y no como
 * mensajes del hilo: así lo que se ve en el panel es siempre exactamente lo
 * que la IA va a usar, y no quedan tarjetas viejas en el historial apuntando
 * a censos que ya no están seleccionados.
 */

type ChatMessage = {
  id: number;
  from: "user" | "bot";
  text: string;
  /**
   * Mensajes que solo existen en la UI: el saludo, las guías de cada paso, los
   * errores y lo que el usuario escribió sin tener preguntas seleccionadas. No
   * se mandan como historial a la IA porque no son parte de su conversación.
   */
  localOnly?: boolean;
};

/** censusId -> (questionId -> pregunta). */
type QuestionSelection = Map<string, Map<string, SelectedQuestion>>;

let messageIdCounter = 0;
const nextMessageId = () => ++messageIdCounter;

// Los endpoints de QueryAIController están en desarrollo activo y a veces
// devuelven `message` como objeto (p. ej. un eco de debug del request) en
// vez de un string. React no puede renderizar un objeto como children, así
// que esto evita que la app entera se caiga en blanco por una respuesta
// inesperada del backend: si no es un string usable, se muestra su JSON en
// vez de asumir un shape que el backend aún no garantiza.
const toDisplayText = (value: unknown, fallback: string): string => {
  if (typeof value === "string" && value.trim() !== "") return value;
  if (value == null) return fallback;
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

const getErrorText = (err: unknown, fallback: string): string => {
  const e = err as {
    response?: { data?: { message?: unknown } };
    message?: unknown;
  };
  return toDisplayText(e?.response?.data?.message ?? e?.message, fallback);
};

/** Convierte el hilo del chat al formato que espera el backend. */
const toHistory = (messages: ChatMessage[]): ChatHistoryTurn[] =>
  messages
    .filter((m) => !m.localOnly)
    .map(
      (m): ChatHistoryTurn => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      }),
    );

const plural = (n: number, singular: string) =>
  `${n} ${singular}${n === 1 ? "" : "s"}`;

const guideMessage = (text: string): ChatMessage => ({
  id: nextMessageId(),
  from: "bot",
  text,
  localOnly: true,
});

const createGreeting = () =>
  guideMessage(
    [
      "¡Hola! Te ayudo a consultar y comparar las respuestas de los censos.",
      "",
      "1. Elige los censos en el panel de abajo y toca **Confirmar**.",
      "2. Toca **Elegir preguntas** en cada censo y busca las que te interesan.",
      "3. Escribe tu consulta y te respondo con base en esas preguntas.",
    ].join("\n"),
  );

const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

export function CensosChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createGreeting(),
  ]);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Para avisar una sola vez que ya se puede escribir la consulta.
  const guidedToAskRef = useRef(false);

  // Catálogo de censos.
  const [censusOptions, setCensusOptions] = useState<CensusOption[] | null>(
    null,
  );
  const [loadingCensuses, setLoadingCensuses] = useState(false);
  const [censusLoadFailed, setCensusLoadFailed] = useState(false);
  // Incrementarlo vuelve a pedir la lista (botón "Reintentar").
  const [censusLoadAttempt, setCensusLoadAttempt] = useState(0);
  const loadedAttemptRef = useRef<number | null>(null);

  // Paso 1: censos. `pickerSelection` son las casillas marcadas mientras se
  // elige; `confirmedCensusIds` es lo que de verdad se está consultando.
  const [confirmedCensusIds, setConfirmedCensusIds] = useState<string[]>([]);
  const [isPickingCensuses, setIsPickingCensuses] = useState(true);
  const [pickerSelection, setPickerSelection] = useState<Set<string>>(
    new Set(),
  );
  const [confirmingCensuses, setConfirmingCensuses] = useState(false);

  // Paso 2: preguntas, agrupadas por censo desde el inicio para no tener que
  // reconstruir la asociación al armar el payload de /compare-questions.
  const [selectedQuestions, setSelectedQuestions] =
    useState<QuestionSelection>(new Map());
  const [activeQuestionCenso, setActiveQuestionCenso] =
    useState<CensusOption | null>(null);

  // Paso 3: consulta.
  const [isComparing, setIsComparing] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const confirmedCensuses = (censusOptions ?? []).filter((option) =>
    confirmedCensusIds.includes(option.id),
  );
  const hasConfirmedCensuses = confirmedCensusIds.length > 0;
  const totalSelectedQuestions = Array.from(selectedQuestions.values()).reduce(
    (sum, questions) => sum + questions.size,
    0,
  );
  const canAsk = !isPickingCensuses && totalSelectedQuestions > 0;
  const canReset =
    !isComparing &&
    !confirmingCensuses &&
    (messages.length > 1 || hasConfirmedCensuses || pickerSelection.size > 0);

  const activeSelectedQuestions = activeQuestionCenso
    ? Array.from(selectedQuestions.get(activeQuestionCenso.id)?.values() ?? [])
    : [];

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isComparing]);

  useEffect(() => {
    if (!isOpen || loadedAttemptRef.current === censusLoadAttempt) return;
    loadedAttemptRef.current = censusLoadAttempt;

    setLoadingCensuses(true);
    setCensusLoadFailed(false);
    getCensusesList()
      .then((options) => setCensusOptions(options))
      .catch(() => setCensusLoadFailed(true))
      .finally(() => setLoadingCensuses(false));
  }, [isOpen, censusLoadAttempt]);

  const addMessages = (...newMessages: ChatMessage[]) =>
    setMessages((prev) => [...prev, ...newMessages]);

  // ---- Paso 1: censos -----------------------------------------------------

  const togglePickerCensus = (id: string) => {
    setPickerSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startChangingCensuses = () => {
    setPickerSelection(new Set(confirmedCensusIds));
    setIsPickingCensuses(true);
    setPanelCollapsed(false);
  };

  const cancelChangingCensuses = () => {
    setPickerSelection(new Set(confirmedCensusIds));
    setIsPickingCensuses(false);
  };

  const handleConfirmCensuses = async () => {
    if (pickerSelection.size === 0 || confirmingCensuses) return;

    // En el orden de la lista, no en el orden en que se marcaron.
    const chosen = (censusOptions ?? []).filter((option) =>
      pickerSelection.has(option.id),
    );
    const chosenIds = chosen.map((option) => option.id);
    const isFirstTime = !hasConfirmedCensuses;

    if (!isFirstTime && sameIds(chosenIds, confirmedCensusIds)) {
      setIsPickingCensuses(false);
      return;
    }

    setConfirmingCensuses(true);
    try {
      const result = await findCensus(chosenIds);
      if (result.ok === false) {
        throw new Error(
          toDisplayText(
            result.message,
            "No se pudieron validar los censos seleccionados.",
          ),
        );
      }

      // Las preguntas de los censos que se quitaron ya no aplican.
      const droppedQuestions = Array.from(selectedQuestions.entries())
        .filter(([censusId]) => !chosenIds.includes(censusId))
        .reduce((sum, [, questions]) => sum + questions.size, 0);

      setConfirmedCensusIds(chosenIds);
      setSelectedQuestions(
        (prev) =>
          new Map(
            Array.from(prev).filter(([censusId]) =>
              chosenIds.includes(censusId),
            ),
          ),
      );
      setIsPickingCensuses(false);
      setPanelCollapsed(false);

      const names = chosen.map((option) => `**${option.name}**`).join(", ");
      addMessages(
        guideMessage(
          isFirstTime
            ? `Perfecto, vamos a consultar ${names}. Ahora toca **Elegir preguntas** en un censo del panel de abajo y busca las preguntas que te interesan.`
            : `Listo, ahora consultamos ${names}.` +
                (droppedQuestions > 0
                  ? ` Quité ${plural(droppedQuestions, "pregunta")} de los censos que ya no están seleccionados.`
                  : ""),
        ),
      );
    } catch (err) {
      // El selector se queda abierto para que se pueda reintentar.
      addMessages(
        guideMessage(
          getErrorText(
            err,
            "No pude validar los censos seleccionados. Intenta de nuevo.",
          ),
        ),
      );
    } finally {
      setConfirmingCensuses(false);
    }
  };

  // ---- Paso 2: preguntas --------------------------------------------------

  const handleToggleQuestion = (question: SelectedQuestion) => {
    if (!activeQuestionCenso) return;
    const censusId = activeQuestionCenso.id;

    setSelectedQuestions((prev) => {
      const next = new Map(prev);
      const current = new Map(next.get(censusId) ?? []);
      if (current.has(question.id)) current.delete(question.id);
      else current.set(question.id, question);

      if (current.size === 0) next.delete(censusId);
      else next.set(censusId, current);
      return next;
    });
  };

  const handleCloseQuestionModal = () => {
    setActiveQuestionCenso(null);
    if (totalSelectedQuestions === 0) return;

    if (!guidedToAskRef.current) {
      guidedToAskRef.current = true;
      addMessages(
        guideMessage(
          "¡Listo! Ya puedes escribir tu consulta sobre las preguntas seleccionadas. Puedes agregar o quitar preguntas cuando quieras desde el panel de abajo.",
        ),
      );
    }
    inputRef.current?.focus();
  };

  // ---- Paso 3: consulta ---------------------------------------------------

  /** Qué le falta al usuario para poder consultar, según dónde va. */
  const getNotReadyHint = (): string => {
    if (censusLoadFailed) {
      return "Primero necesito que selecciones las preguntas que quieres consultar, pero no pude cargar la lista de censos. Toca **Reintentar** en el panel de abajo.";
    }
    if (censusOptions?.length === 0) {
      return "Por ahora no hay censos disponibles, así que todavía no hay preguntas que pueda consultar.";
    }
    if (isPickingCensuses && hasConfirmedCensuses) {
      return "Primero termina de elegir los censos: toca **Confirmar** (o **Cancelar** para conservar los anteriores) y así podré responderte con las preguntas seleccionadas.";
    }
    if (isPickingCensuses) {
      return "Primero necesito que selecciones las preguntas que quieres consultar para poder responderte. Marca los censos en el panel de abajo, toca **Confirmar** y después elige sus preguntas.";
    }
    return "Primero necesito que selecciones las preguntas que quieres consultar para poder responderte. Toca **Elegir preguntas** en alguno de los censos del panel de abajo.";
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isComparing) return;
    setDraft("");

    // Sin preguntas no hay nada que mandar al backend (no hay ruta para chat
    // libre), así que el bot indica qué falta en vez de quedarse callado.
    if (!canAsk) {
      setPanelCollapsed(false);
      addMessages(
        { id: nextMessageId(), from: "user", text, localOnly: true },
        guideMessage(getNotReadyHint()),
      );
      return;
    }

    const userMessage: ChatMessage = { id: nextMessageId(), from: "user", text };
    // El historial se toma antes de agregar este mensaje: el backend agrega
    // el prompt actual por su cuenta.
    const history = toHistory(messages);
    addMessages(userMessage);
    setIsComparing(true);

    // Si la IA no respondió, el intercambio no existió para ella: se saca del
    // historial para que la siguiente consulta no lleve un turno colgado.
    const discardExchange = (reason: string) =>
      setMessages((prev) => [
        ...prev.map((m) =>
          m.id === userMessage.id ? { ...m, localOnly: true } : m,
        ),
        guideMessage(reason),
      ]);

    try {
      const censusGroups: CompareCensusGroup[] = Array.from(
        selectedQuestions.entries(),
      ).map(([censusId, questions]) => ({
        id: censusId,
        questions: Array.from(questions.keys()),
      }));
      const result = await compareQuestions(censusGroups, text, history);

      // El texto para el usuario está en analysis.answer; `result.message` es
      // solo el estado del endpoint. Si el análisis falló, analysis.message
      // trae el motivo (p. ej. credenciales de Bedrock vencidas).
      const analysis = result.analysis;
      if (analysis?.ok && typeof analysis.answer === "string") {
        addMessages({ id: nextMessageId(), from: "bot", text: analysis.answer });
      } else {
        discardExchange(
          toDisplayText(
            analysis?.message,
            "No se pudo obtener el análisis de la IA.",
          ),
        );
      }
      // La selección se conserva a propósito: es el contexto sobre el que
      // sigue conversando el usuario.
    } catch (err) {
      discardExchange(
        getErrorText(
          err,
          "Ocurrió un error al comparar las preguntas seleccionadas.",
        ),
      );
    } finally {
      setIsComparing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleReset = () => {
    setMessages([createGreeting()]);
    setDraft("");
    setConfirmedCensusIds([]);
    setPickerSelection(new Set());
    setIsPickingCensuses(true);
    setSelectedQuestions(new Map());
    setActiveQuestionCenso(null);
    setPanelCollapsed(false);
    guidedToAskRef.current = false;
  };

  const renderCensusPicker = () => {
    if (loadingCensuses) {
      return (
        <p className="flex items-center gap-2 py-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando censos...
        </p>
      );
    }
    if (censusLoadFailed) {
      return (
        <div className="flex items-center justify-between gap-2 py-1 text-xs text-red-700">
          <span>No pude cargar la lista de censos.</span>
          <button
            onClick={() => setCensusLoadAttempt((n) => n + 1)}
            className="font-medium hover:underline"
          >
            Reintentar
          </button>
        </div>
      );
    }
    if (!censusOptions) return null;
    if (censusOptions.length === 0) {
      return (
        <p className="py-2 text-xs text-gray-500">
          No hay censos disponibles para consultar.
        </p>
      );
    }

    return (
      <>
        <ul className="max-h-32 space-y-0.5 overflow-y-auto pr-1">
          {censusOptions.map((option) => (
            <li key={option.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={pickerSelection.has(option.id)}
                  disabled={confirmingCensuses}
                  onChange={() => togglePickerCensus(option.id)}
                  className="accent-[#5b1d27]"
                />
                <span className="truncate text-gray-700">{option.name}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex gap-2">
          {hasConfirmedCensuses && (
            <button
              onClick={cancelChangingCensuses}
              disabled={confirmingCensuses}
              className="flex-1 rounded-lg border border-gray-300 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => void handleConfirmCensuses()}
            disabled={pickerSelection.size === 0 || confirmingCensuses}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#5b1d27] py-1.5 text-sm font-medium text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {confirmingCensuses && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar
          </button>
        </div>
      </>
    );
  };

  const renderSelectionSummary = () => (
    <>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setPanelCollapsed((collapsed) => !collapsed)}
          aria-expanded={!panelCollapsed}
          className="flex min-w-0 items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          <ChevronDown
            className={clsx(
              "h-4 w-4 shrink-0 transition-transform",
              panelCollapsed && "-rotate-90",
            )}
          />
          <span className="truncate">
            {totalSelectedQuestions === 0
              ? "Paso 2 de 3 · Elige las preguntas"
              : `${plural(confirmedCensuses.length, "censo")} · ${plural(totalSelectedQuestions, "pregunta")}`}
          </span>
        </button>
        <button
          onClick={startChangingCensuses}
          className="shrink-0 text-xs font-medium text-[#5b1d27] hover:underline"
        >
          Cambiar censos
        </button>
      </div>

      {!panelCollapsed && (
        <ul className="mt-1 max-h-32 overflow-y-auto">
          {confirmedCensuses.map((censo) => {
            const count = selectedQuestions.get(censo.id)?.size ?? 0;
            return (
              <li key={censo.id}>
                <button
                  onClick={() => setActiveQuestionCenso(censo)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-gray-50"
                  title={`Elegir preguntas de ${censo.name}`}
                >
                  <span className="truncate text-gray-700">{censo.name}</span>
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[#5b1d27]">
                    {count > 0 ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">
                        {plural(count, "pregunta")}
                      </span>
                    ) : (
                      "Elegir preguntas"
                    )}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className="w-80 sm:w-96 h-[34rem] max-h-[calc(100vh-7.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slideIn"
          role="dialog"
          aria-label="Chat de censos"
        >
          <div className="flex items-center justify-between bg-[#5b1d27] text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">Asistente de Censos</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                disabled={!canReset}
                className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/10 transition disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Nueva conversación"
                title="Nueva conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/10 transition"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  "flex",
                  message.from === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={clsx(
                    "rounded-2xl px-3 py-2 text-sm shadow-sm",
                    message.from === "user"
                      ? "max-w-[75%] bg-[#5b1d27] text-white rounded-br-sm"
                      : // Las respuestas de la IA traen tablas y listas, así
                        // que su burbuja va más ancha que la del usuario.
                        "max-w-[90%] bg-white text-gray-700 border border-gray-200 rounded-bl-sm",
                  )}
                >
                  {message.from === "bot" ? (
                    <ChatMarkdown text={message.text} />
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}

            {isComparing && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2 shadow-sm text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analizando las preguntas...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 bg-white px-3 py-2 text-sm">
            {isPickingCensuses ? (
              <>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-600">
                    {hasConfirmedCensuses
                      ? "Cambia los censos a consultar"
                      : "Paso 1 de 3 · Elige los censos"}
                  </span>
                  {pickerSelection.size > 0 && (
                    <span className="text-xs text-gray-400">
                      {plural(pickerSelection.size, "seleccionado")}
                    </span>
                  )}
                </div>
                {renderCensusPicker()}
              </>
            ) : (
              renderSelectionSummary()
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-gray-200 bg-white p-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                canAsk
                  ? "Escribe tu consulta..."
                  : "Elige preguntas para hacer tu consulta"
              }
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b48a70]"
            />
            <button
              onClick={() => void handleSend()}
              disabled={!draft.trim() || isComparing}
              className="h-9 w-9 shrink-0 grid place-items-center rounded-full bg-[#5b1d27] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition"
              aria-label="Enviar mensaje"
            >
              {isComparing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-14 w-14 grid place-items-center rounded-full bg-gradient-to-r from-[#5b1d27] via-[#7a2c3a] to-[#8f3547] text-white shadow-lg hover:brightness-110 active:scale-95 transition"
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      <CensusQuestionSearchModal
        isOpen={activeQuestionCenso !== null}
        censo={activeQuestionCenso}
        onClose={handleCloseQuestionModal}
        selectedQuestions={activeSelectedQuestions}
        onToggleQuestion={handleToggleQuestion}
      />
    </div>
  );
}
