import { Users, ShieldCheck, Briefcase, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

type UserKind = "encuestados" | "administracion" | "managers";

const OPTIONS: Array<{ key: UserKind; label: string; Icon: any }> = [
  { key: "encuestados", label: "Encuestados", Icon: Users },
  { key: "administracion", label: "Administración", Icon: ShieldCheck },
  { key: "managers", label: "Managers", Icon: Briefcase },
];

// en UserTypePopover props:
type Props = {
  className?: string;
  onNavigate?: () => void; // <-- agrega esto
};

export default function UserTypePopover({ className, onNavigate }: Props) {
  const navigate = useNavigate();

  const go = (k: UserKind) => {
    onNavigate?.();
    navigate(`/usuarios?tipo=${k}`); // o /usuarios/${k}
  };

  return (
    <div
      role="menu"
      className={clsx(
        "w-40 rounded-xl border border-black/5 bg-[#F5F1EA] shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
        "backdrop-blur-sm",
        className
      )}
    >
      {/* Header del popover */}
      <div className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#5F0F1B]/80 border-b border-black/5">
        <ChevronLeft className="size-3.5 opacity-60" />
        <span className="font-semibold">Tipos de usuarios</span>
      </div>

      {/* Lista de opciones */}
      <div className="py-1">
        {OPTIONS.map(({ key, label, Icon }) => (
          <button
            key={key}
            role="menuitem"
            onClick={() => go(key)}
            className={clsx(
              "flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] rounded-md",
              "hover:bg-[#DCCDB3] focus:bg-[#DCCDB3] transition"
            )}
          >
            <Icon className="size-4 text-[#5F0F1B]" />
            <span className="text-[#3b2a2e]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
