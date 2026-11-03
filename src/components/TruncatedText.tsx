import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * Largo al que el buscador genérico del backend (SearchService, `LEFT(name, 60)`)
 * recorta los nombres de los listados. Si cambia allá, hay que cambiarlo aquí.
 */
export const SEARCH_NAME_LIMIT = 60;

const SHOW_DELAY_MS = 250;
const HIDE_DELAY_MS = 120;
const GAP_PX = 6;
const VIEWPORT_MARGIN_PX = 8;

type Anchor = { top: number; bottom: number; left: number };

type TruncatedTextProps = {
  /** Texto a mostrar. */
  text: string | number | null | undefined;
  /** Líneas visibles antes de cortar con "…". Por defecto, una. */
  lines?: number;
  /**
   * Largo al que el backend ya entrega recortado este texto. Si llega con
   * exactamente ese largo se da por incompleto y se le agrega "…".
   */
  truncatedAt?: number;
  /** Qué mostrar cuando `text` viene vacío. */
  fallback?: ReactNode;
  /** Clases extra para el texto: color, peso, tamaño, ancho máximo… */
  className?: string;
};

/** ¿El navegador está ocultando parte del texto? */
function isClipped(el: HTMLElement, lines: number): boolean {
  if (lines <= 1) return el.scrollWidth > el.clientWidth;
  // Media línea de tolerancia: algunos glifos sobresalen un par de píxeles de
  // su caja y eso no es texto oculto.
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
  return el.scrollHeight - el.clientHeight > lineHeight / 2;
}

/**
 * Texto que se corta con puntos suspensivos cuando no cabe y, solo en ese caso,
 * muestra el texto completo en un tooltip al pasar el mouse (o al tocarlo).
 *
 * En una tabla, la celda necesita `max-w-0` y su columna un ancho (p. ej.
 * `w-full` en el `<th>`); sin eso la tabla se ensancha hasta el largo del texto
 * y nunca se corta. Si la columna no tiene ancho, pon un tope en `className`
 * (`max-w-xs`). Con `lines` > 1 el texto se ajusta en varias líneas y no hace
 * falta nada de eso.
 */
export function TruncatedText({
  text,
  lines = 1,
  truncatedAt,
  fallback = null,
  className = "",
}: TruncatedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const raw = text == null ? "" : String(text);
  const hasText = raw.trim() !== "";
  const shown =
    truncatedAt !== undefined && raw.length === truncatedAt
      ? `${raw.trimEnd()}…`
      : raw;

  // Abre con un pequeño retraso, para no parpadear al recorrer la tabla con el
  // mouse, y cierra con otro, para que el puntero alcance a pasar al tooltip.
  useEffect(() => {
    if (hovered === (anchor !== null)) return;
    const timer = window.setTimeout(
      () => {
        if (!hovered) {
          setAnchor(null);
          return;
        }
        const el = textRef.current;
        if (!el || !isClipped(el, lines)) return;
        const { top, bottom, left } = el.getBoundingClientRect();
        setAnchor({ top, bottom, left });
      },
      hovered ? SHOW_DELAY_MS : HIDE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [hovered, anchor, lines]);

  // La posición del tooltip es fija: un scroll o un cambio de tamaño lo dejarían
  // desfasado, así que lo cierran. Escape también.
  useEffect(() => {
    if (!anchor) return;
    const close = () => {
      setHovered(false);
      setAnchor(null);
    };
    const onScroll = (event: Event) => {
      // El propio tooltip tiene scroll cuando el texto es muy largo.
      if (tooltipRef.current?.contains(event.target as Node)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchor]);

  // Coloca el tooltip arriba del texto (abajo si no cabe) sin salirse de la
  // pantalla. Corre antes de pintar, así que nunca se ve en la esquina.
  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) return;
    const { width, height } = tooltip.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    const left = Math.max(
      VIEWPORT_MARGIN_PX,
      Math.min(anchor.left, clientWidth - width - VIEWPORT_MARGIN_PX),
    );
    const spaceAbove = anchor.top - GAP_PX - VIEWPORT_MARGIN_PX;
    const spaceBelow = clientHeight - anchor.bottom - GAP_PX - VIEWPORT_MARGIN_PX;
    const top =
      height <= spaceAbove || spaceAbove >= spaceBelow
        ? Math.max(VIEWPORT_MARGIN_PX, anchor.top - GAP_PX - height)
        : anchor.bottom + GAP_PX;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.visibility = "visible";
  }, [anchor]);

  const clampStyle: CSSProperties | undefined =
    lines > 1
      ? {
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: lines,
          overflow: "hidden",
          overflowWrap: "break-word",
        }
      : undefined;

  return (
    <>
      {/* El fallback va en el mismo contenedor para que también se corte. */}
      <span
        ref={textRef}
        className={`${lines > 1 ? "" : "block truncate"} ${className}`}
        style={clampStyle}
        onMouseEnter={hasText ? () => setHovered(true) : undefined}
        onMouseLeave={hasText ? () => setHovered(false) : undefined}
      >
        {hasText ? shown : fallback}
      </span>

      {anchor &&
        hasText &&
        createPortal(
          // aria-hidden: el texto ya está completo en el DOM para lectores de pantalla.
          <div
            ref={tooltipRef}
            aria-hidden="true"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="invisible fixed left-0 top-0 z-[100] max-h-[calc(100vh_-_1rem)] max-w-[min(28rem,calc(100vw_-_1rem))] overflow-y-auto whitespace-pre-line break-words rounded-lg bg-gray-900 px-3 py-2 text-left text-xs leading-relaxed text-white shadow-lg animate-[fadeIn_120ms_ease-out]"
          >
            {shown}
          </div>,
          document.body,
        )}
    </>
  );
}
