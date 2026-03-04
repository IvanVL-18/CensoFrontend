import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  value?: Date | null;
  onChange?: (date: Date | null) => void;

  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;

  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
  yearRange?: { from: number; to: number };
  startWeekOnMonday?: boolean;
  className?: string;
  inputClassName?: string;
  displayFormat?: "long" | "short";
};

const MONTHS_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const WEEKDAYS_ES_MON = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const WEEKDAYS_ES_SUN = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function addMonths(date: Date, diff: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + diff);
  return d;
}
function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
function weekdayIndex(date: Date, startWeekOnMonday: boolean) {
  const js = date.getDay(); 
  if (!startWeekOnMonday) return js; 
  return (js + 6) % 7; 
}
function isBefore(a: Date, b: Date) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}
function isAfter(a: Date, b: Date) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

type Cell = { date: Date; inCurrentMonth: boolean };

function buildMonthGrid(viewDate: Date, startWeekOnMonday: boolean): Cell[] {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();

  const first = new Date(y, m, 1);
  const leading = weekdayIndex(first, startWeekOnMonday);
  const total = daysInMonth(y, m);

  const cells: Cell[] = [];

  const prev = addMonths(first, -1);
  const py = prev.getFullYear();
  const pm = prev.getMonth();
  const ptotal = daysInMonth(py, pm);

  for (let i = 0; i < leading; i++) {
    const day = ptotal - leading + 1 + i;
    cells.push({ date: new Date(py, pm, day), inCurrentMonth: false });
  }

  for (let day = 1; day <= total; day++) {
    cells.push({ date: new Date(y, m, day), inCurrentMonth: true });
  }

  const next = addMonths(first, 1);
  const ny = next.getFullYear();
  const nm = next.getMonth();

  while (cells.length < 42) {
    const day = cells.length - (leading + total) + 1;
    cells.push({ date: new Date(ny, nm, day), inCurrentMonth: false });
  }

  return cells;
}

function formatShort(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatLongEs(d: Date) {
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("es-MX", { month: "long" }).format(d);
  const year = d.getFullYear();
  return `${day} de ${month} de ${year}`;
}

function clampYearRange(range?: { from: number; to: number }) {
  if (!range) return null;
  const from = Math.min(range.from, range.to);
  const to = Math.max(range.from, range.to);
  return { from, to };
}

export default function Calendar({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  clearable = true,
  minDate,
  maxDate,
  isDateDisabled,
  yearRange,
  startWeekOnMonday = true,
  className = "",
  inputClassName = "",
  displayFormat = "long",
}: Props) {
  const [internal, setInternal] = useState<Date | null>(null);
  const selectedRaw = value !== undefined ? value : internal;
  const selected = selectedRaw ? startOfDay(selectedRaw) : null;

  const setSelected = (d: Date | null) => {
    if (value === undefined) setInternal(d);
    onChange?.(d);
  };

  const today = useMemo(() => startOfDay(new Date()), []);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => selected ?? today);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selected) setViewDate(selected);
  }, [selected]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const el = wrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const grid = useMemo(() => buildMonthGrid(viewDate, startWeekOnMonday), [viewDate, startWeekOnMonday]);

  function canSelect(date: Date) {
    const d = startOfDay(date);
    if (minDate && isBefore(d, minDate)) return false;
    if (maxDate && isAfter(d, maxDate)) return false;
    if (isDateDisabled && isDateDisabled(d)) return false;
    return true;
  }

  function pick(date: Date) {
    if (!canSelect(date)) return;
    setSelected(startOfDay(date));
    setOpen(false);
  }

  const yr = clampYearRange(yearRange) ?? { from: today.getFullYear() - 50, to: today.getFullYear() + 10 };
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = yr.from; y <= yr.to; y++) arr.push(y);
    return arr;
  }, [yr.from, yr.to]);

  const inputText = selected
    ? displayFormat === "short"
      ? formatShort(selected)
      : formatLongEs(selected)
    : placeholder;

  const weekdays = startWeekOnMonday ? WEEKDAYS_ES_MON : WEEKDAYS_ES_SUN;

  return (
    <div ref={wrapRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center justify-between gap-2",
          "min-w-[220px]",
          "rounded-lg border border-slate-200 bg-white px-3 py-2",
          "text-sm text-slate-800 shadow-sm",
          "hover:bg-slate-50",
          "focus:outline-none focus:ring-2 focus:ring-slate-300",
          "disabled:cursor-not-allowed disabled:opacity-60",
          inputClassName,
        ].join(" ")}
      >
        <span className={`truncate ${selected ? "text-slate-900" : "text-slate-500"}`}>{inputText}</span>

        <span className="inline-flex items-center gap-1">
          {clearable && selected && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelected(null);
              }}
              className="rounded-md p-1 hover:bg-slate-100"
              aria-label="Limpiar fecha"
              title="Limpiar"
            >
              <X className="h-4 w-4 text-slate-500" />
            </span>
          ) : null}

          <CalendarIcon className="h-4 w-4 text-slate-600" />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 mt-2 z-50 w-[320px] rounded-xl border border-slate-200 bg-white shadow-xl p-3">

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, -1))}
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 hover:bg-slate-50"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4 text-slate-700" />
            </button>

            <div className="flex items-center gap-2">

              <div className="relative">
                <select
                  className="h-9 rounded-md border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none"
                  value={viewDate.getMonth()}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setViewDate((d) => new Date(d.getFullYear(), m, 1));
                  }}
                >
                  {MONTHS_ES.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
              </div>

              <div className="relative">
                <select
                  className="h-9 w-[96px] rounded-md border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none"
                  value={viewDate.getFullYear()}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setViewDate((d) => new Date(y, d.getMonth(), 1));
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 hover:bg-slate-50"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4 text-slate-700" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-xs font-medium text-slate-500">
            {weekdays.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map(({ date, inCurrentMonth }, idx) => {
              const d = startOfDay(date);
              const isSelected = selected ? isSameDay(d, selected) : false;
              const disabledDay = !canSelect(d);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pick(d)}
                  disabled={disabledDay}
                  className={[
                    "h-9 rounded-md text-sm transition",
                    inCurrentMonth ? "text-slate-900" : "text-slate-400",
                    disabledDay ? "cursor-not-allowed opacity-35" : "hover:bg-slate-100",
                    isSelected ? "bg-slate-900 text-white hover:bg-slate-900" : "",
                    "focus:outline-none focus:ring-2 focus:ring-slate-300",
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}