import { Info } from "lucide-react";

type Props = {
  title?: string;
  messages: string[];
};

export default function FormAlert({ title = "Por favor, corrige los siguientes errores:", messages }: Props) {
  return (
    <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
      <div className="flex items-start gap-2">
        <Info className="w-5 h-5 mt-[2px]" />

        <div className="flex-1">
          <p className="font-semibold text-sm">{title}</p>

          <ul className="mt-1 list-disc pl-6 space-y-[2px] text-sm">
            {messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
