import { useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2, MessageCircle, Send, X } from "lucide-react";
import clsx from "clsx";
import { findCensus, getCensusesList } from "../Censos.service";
import type { CensusOption } from "../Censos.types";
import { CensusQuestionSearchModal } from "./CensusQuestionSearchModal";

type ChatMessage =
  | { id: number; from: "user" | "bot"; kind: "text"; text: string }
  | { id: number; from: "bot"; kind: "census-list"; census: CensusOption[] };

let messageIdCounter = 0;
const nextMessageId = () => ++messageIdCounter;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: nextMessageId(),
    from: "bot",
    kind: "text",
    text: "¡Hola! Estos son los censos disponibles. Selecciona los que quieras consultar y confirma tu elección.",
  },
];

export function CensosChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  const [censusOptions, setCensusOptions] = useState<CensusOption[] | null>(
    null,
  );
  const [loadingCensuses, setLoadingCensuses] = useState(false);
  const [selectedCensusIds, setSelectedCensusIds] = useState<Set<string>>(
    new Set(),
  );
  const [pickerConfirmed, setPickerConfirmed] = useState(false);
  const [findingCensus, setFindingCensus] = useState(false);
  const [activeQuestionCenso, setActiveQuestionCenso] =
    useState<CensusOption | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, censusOptions, loadingCensuses]);

  useEffect(() => {
    if (!isOpen || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setLoadingCensuses(true);
    getCensusesList()
      .then((options) => setCensusOptions(options))
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            from: "bot",
            text: "No pude cargar la lista de censos. Intenta de nuevo más tarde.",
          },
        ]);
      })
      .finally(() => setLoadingCensuses(false));
  }, [isOpen]);

  const toggleCensusSelection = (id: string) => {
    if (pickerConfirmed) return;
    setSelectedCensusIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmSelection = async () => {
    if (selectedCensusIds.size === 0 || findingCensus) return;

    setFindingCensus(true);
    setPickerConfirmed(true);

    try {
      const result = await findCensus(Array.from(selectedCensusIds));
      // find-questions necesita el id encriptado tal como lo entrega /censuses,
      // no el id crudo que regresa /find-census, así que usamos las opciones
      // originales seleccionadas en el picker en vez de result.census.
      const matchedOptions = (censusOptions ?? []).filter((option) =>
        selectedCensusIds.has(option.id),
      );
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId(),
          from: "bot",
          kind: "text",
          text: result.message ?? "Censos encontrados correctamente.",
        },
        ...(matchedOptions.length > 0
          ? [
              {
                id: nextMessageId(),
                from: "bot" as const,
                kind: "census-list" as const,
                census: matchedOptions,
              },
            ]
          : []),
      ]);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Ocurrió un error al buscar los censos seleccionados.";
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), from: "bot", kind: "text", text: msg },
      ]);
    } finally {
      setFindingCensus(false);
    }
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), from: "user", kind: "text", text },
    ]);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className="w-80 sm:w-96 h-[30rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slideIn"
          role="dialog"
          aria-label="Chat de censos"
        >
          <div className="flex items-center justify-between bg-[#5b1d27] text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">Asistente de Censos</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/10 transition"
              aria-label="Cerrar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
            {messages.map((message) => {
              if (message.kind === "census-list") {
                return (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[90%] w-full bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm p-2 text-sm text-gray-700">
                      <ul className="divide-y divide-gray-100">
                        {message.census.map((censo) => (
                          <li
                            key={censo.id}
                            className="flex items-center justify-between py-1.5 px-1 gap-2"
                          >
                            <span className="truncate">{censo.name}</span>
                            <button
                              onClick={() => setActiveQuestionCenso(censo)}
                              className="shrink-0 h-7 w-7 grid place-items-center rounded-full hover:bg-gray-100 text-[#5b1d27] transition"
                              aria-label={`Buscar preguntas de ${censo.name}`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={clsx(
                    "flex",
                    message.from === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      message.from === "user"
                        ? "bg-[#5b1d27] text-white rounded-br-sm"
                        : "bg-white text-gray-700 border border-gray-200 rounded-bl-sm",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}

            {loadingCensuses && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2 shadow-sm text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando censos...
                </div>
              </div>
            )}

            {censusOptions && censusOptions.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[90%] w-full bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm p-3 text-sm text-gray-700">
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {censusOptions.map((option) => (
                      <li key={option.id}>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCensusIds.has(option.id)}
                            disabled={pickerConfirmed}
                            onChange={() => toggleCensusSelection(option.id)}
                            className="accent-[#5b1d27]"
                          />
                          <span
                            className={clsx(
                              pickerConfirmed && "text-gray-400",
                            )}
                          >
                            {option.name}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleConfirmSelection}
                    disabled={
                      pickerConfirmed ||
                      selectedCensusIds.size === 0 ||
                      findingCensus
                    }
                    className="mt-3 w-full rounded-lg bg-[#5b1d27] text-white text-sm font-medium py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    {findingCensus && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {pickerConfirmed ? "Selección enviada" : "Confirmar"}
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-gray-200 bg-white p-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b48a70]"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="h-9 w-9 shrink-0 grid place-items-center rounded-full bg-[#5b1d27] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
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
        onClose={() => setActiveQuestionCenso(null)}
      />
    </div>
  );
}
