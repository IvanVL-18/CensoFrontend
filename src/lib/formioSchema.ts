/**
 * Utilidades compartidas para schemas de Form.io.
 * Única fuente de verdad — antes cada modal tenía su propia copia de
 * sanitizeComponents / disableCalculatedFields / disableAllFields.
 */

type AnyComponent = Record<string, any>;

/**
 * Recorre recursivamente el árbol de componentes (components, columns y
 * rows) aplicando `fn` a una copia de cada componente. Nunca muta el
 * schema original, por lo que es seguro usarlo sobre datos de estado/caché.
 *
 * Nota: rows es array de arrays de celdas { components: [...] }; las celdas
 * y las definiciones de columna no son componentes, así que `fn` no se les
 * aplica — solo a los componentes que contienen.
 */
export const mapComponents = (
  components: AnyComponent[],
  fn: (comp: AnyComponent) => AnyComponent
): AnyComponent[] => {
  if (!Array.isArray(components)) return [];
  return components.map((comp) => {
    const c = fn({ ...comp });

    if (Array.isArray(c.components))
      c.components = mapComponents(c.components, fn);

    if (Array.isArray(c.columns))
      c.columns = c.columns.map((col: AnyComponent) => ({
        ...col,
        components: mapComponents(col.components ?? [], fn),
      }));

    if (Array.isArray(c.rows))
      c.rows = c.rows.map((row: any) =>
        Array.isArray(row)
          ? row.map((cell: AnyComponent) => ({
              ...cell,
              components: mapComponents(cell.components ?? [], fn),
            }))
          : row
      );

    return c;
  });
};

/**
 * Limpia datos que rompen Form.io o ensucian el render:
 * - inputMask/displayMask null crashean Form.io
 *   ("Cannot read properties of null (reading 'length')")
 * - labels con tabs o espacios sobrantes (copiados de Excel) deforman
 *   el layout de columnas
 */
export const sanitizeComponents = (
  components: AnyComponent[]
): AnyComponent[] =>
  mapComponents(components, (c) => {
    if (c.inputMask === null) c.inputMask = "";
    if (c.displayMask === null) c.displayMask = "";
    if (typeof c.label === "string")
      c.label = c.label.replace(/\t+/g, " ").trim();
    return c;
  });

export const sanitizeSchema = <
  T extends { components?: any[]; display?: string }
>(
  schema: T
): T => ({
  ...schema,
  display: schema.display ?? "form",
  components: sanitizeComponents(schema.components ?? []),
});

/** Deshabilita los campos con calculateValue para que el usuario no los edite. */
export const disableCalculatedFields = (
  components: AnyComponent[]
): AnyComponent[] =>
  mapComponents(components, (c) => {
    if (
      c.calculateValue &&
      typeof c.calculateValue === "string" &&
      c.calculateValue.trim() !== ""
    ) {
      c.disabled = true;
    }
    return c;
  });

/** Modo solo lectura: deshabilita todos los campos. */
export const disableAllFields = (components: AnyComponent[]): AnyComponent[] =>
  mapComponents(components, (c) => ({ ...c, disabled: true }));
