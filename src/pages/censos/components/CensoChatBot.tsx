import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

const CHATBOT_URL =
  "https://te6i9iw6k3.execute-api.us-east-1.amazonaws.com/prod/question";

interface ChatMessage {
  id: number;
  role: "user" | "bot";
  text: string;
  isError?: boolean;
}

interface CensoChatBotProps {
  bucketName?: string;
  fileName?: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  role: "bot",
  text: "¡Hola! Soy tu asistente de censos. Pregúntame lo que necesites sobre el documento y te ayudaré.",
};

// La lambda puede regresar la respuesta bajo distintas llaves o como body anidado
function extractAnswer(data: unknown): string {
  if (typeof data === "string") {
    try {
      return extractAnswer(JSON.parse(data));
    } catch {
      return data;
    }
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["answer", "response", "message", "result", "text"]) {
      if (typeof obj[key] === "string" && obj[key]) return obj[key] as string;
    }
    if (obj.body !== undefined) return extractAnswer(obj.body);
  }
  return JSON.stringify(data);
}

export function CensoChatBot({
  bucketName = "sigeh-chatbot",
  fileName = "respuestas_Angeles_Anegeles.pdf",
}: CensoChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: trimmed },
    ]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch(CHATBOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucketName, fileName, question: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: extractAnswer(data) },
      ]);
    } catch (err) {
      console.error("Error al consultar el chatbot:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: "Lo siento, ocurrió un error al procesar tu pregunta. Intenta de nuevo.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:w-96">
          {/* Encabezado */}
          <div className="flex items-center justify-between bg-[#691b31] px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">
                  Asistente de censos
                </p>
                <p className="text-xs text-white/70 leading-tight">
                  Pregunta sobre el documento
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-[#691b31] text-white"
                      : msg.isError
                        ? "rounded-bl-sm border border-red-200 bg-red-50 text-red-700"
                        : "rounded-bl-sm border border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#BC955B] [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#BC955B] [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#BC955B]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Entrada de texto */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-[#691b31] focus:ring-1 focus:ring-[#691b31] disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#691b31] text-white transition-colors hover:bg-[#7A0C2E] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Enviar pregunta"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#691b31] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#7A0C2E]"
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
