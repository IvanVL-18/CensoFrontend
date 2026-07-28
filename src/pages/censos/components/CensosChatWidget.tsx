import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import clsx from "clsx";

type ChatMessage = {
  id: number;
  from: "user" | "bot";
  text: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    from: "bot",
    text: "¡Hola! Soy el asistente de Censos. ¿En qué te puedo ayudar?",
  },
];

const BOT_REPLY =
  "Gracias por tu mensaje. Un miembro del equipo lo revisará pronto.";

export function CensosChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping, isOpen]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, from: "user", text },
    ]);
    setDraft("");
    setIsBotTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, from: "bot", text: BOT_REPLY },
      ]);
      setIsBotTyping(false);
    }, 1200);
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
          className="w-80 sm:w-96 h-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slideIn"
          role="dialog"
          aria-label="Chat de ayuda"
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
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    message.from === "user"
                      ? "bg-[#5b1d27] text-white rounded-br-sm"
                      : "bg-white text-gray-700 border border-gray-200 rounded-bl-sm",
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
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
    </div>
  );
}
