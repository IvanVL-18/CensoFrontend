/**
 * Helpers de presentación para exportar formularios Form.io (PDF / Excel).
 */

/** Convierte el HTML de componentes content/htmlelement a texto plano. */
export function htmlToText(html: string): string {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

/**
 * Labels por defecto que Form.io asigna al arrastrar un componente.
 * En la web suelen ir con hideLabel; en exportaciones tampoco deben
 * imprimirse ("Number", "Text Field"...) porque el texto real está
 * en un componente content/htmlelement vecino.
 */
export const DEFAULT_LABELS = new Set([
  "number", "text field", "text area", "select", "checkbox", "radio",
  "currency", "date / time", "datetime", "day", "time", "email",
  "phone number", "url", "password", "tags", "address", "select boxes",
  "survey", "signature", "file", "columns", "table", "panel", "content",
  "html element", "well", "field set", "data grid", "edit grid", "container",
]);

export function shouldShowLabel(comp: any): boolean {
  if (comp?.hideLabel === true) return false;
  const label = String(comp?.label ?? "").trim();
  return label !== "" && !DEFAULT_LABELS.has(label.toLowerCase());
}
