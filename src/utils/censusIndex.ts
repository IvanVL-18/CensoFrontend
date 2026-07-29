import type {
  CensusSectionNode,
  CensusViewQuestionItem,
  CensusViewSectionItem,
} from "../pages/censos/Censos.types";

/**
 * Los índices del censo ("1", "1.2", "1.2.10") son texto, así que compararlos como cadenas
 * deja "1.10" antes de "1.2" y "10" antes de "2". Aquí se comparan segmento por segmento
 * como números, que es el orden jerárquico real.
 */
export function parseIndex(index: string): number[] {
  return String(index ?? "")
    .split(".")
    .map((part) => {
      const n = Number.parseInt(part, 10);
      return Number.isNaN(n) ? 0 : n;
    });
}

export function compareIndex(a: string, b: string): number {
  const left = parseIndex(a);
  const right = parseIndex(b);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i++) {
    const diff = (left[i] ?? -1) - (right[i] ?? -1);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** "1.2.3" desciende de "1.2" pero no de "1.20" ni de sí mismo. */
export function isDescendantIndex(child: string, parent: string): boolean {
  return String(child ?? "").startsWith(`${parent}.`);
}

/** Cuántos niveles cuelga el índice por debajo del módulo: módulo "1" → "1.2" es 1, "1.2.3" es 2. */
export function depthFromModule(index: string, moduleIndex: string): number {
  return Math.max(0, parseIndex(index).length - parseIndex(moduleIndex).length);
}

/**
 * Arma el árbol de secciones/subsecciones a partir de los índices. La jerarquía no existe en
 * la base de datos: se deduce del prefijo del índice ("1.2.3" cuelga de "1.2"). Si falta el
 * padre en la lista (por un filtro o un hueco de captura) el nodo sube a la raíz, pero
 * conserva su `depth` real para que la sangría siga reflejando el índice.
 */
export function buildSectionTree(
  sections: CensusViewSectionItem[],
  moduleIndex: string,
): CensusSectionNode[] {
  const roots: CensusSectionNode[] = [];
  const ancestors: CensusSectionNode[] = [];

  const sorted = [...sections].sort((a, b) =>
    compareIndex(a.section.index, b.section.index),
  );

  for (const item of sorted) {
    const node: CensusSectionNode = {
      ...item,
      census_questions: sortQuestions(item.census_questions),
      depth: depthFromModule(item.section.index, moduleIndex),
      children: [],
    };

    while (
      ancestors.length > 0 &&
      !isDescendantIndex(
        item.section.index,
        ancestors[ancestors.length - 1].section.index,
      )
    ) {
      ancestors.pop();
    }

    if (ancestors.length > 0) ancestors[ancestors.length - 1].children.push(node);
    else roots.push(node);

    ancestors.push(node);
  }

  return roots;
}

export function sortQuestions(
  questions: CensusViewQuestionItem[] | undefined,
): CensusViewQuestionItem[] {
  return [...(questions ?? [])].sort((a, b) =>
    compareIndex(a.question.index, b.question.index),
  );
}

/** Cuenta el nodo y toda su descendencia. */
export function countSections(nodes: CensusSectionNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countSections(node.children), 0);
}

export function countQuestions(nodes: CensusSectionNode[]): number {
  return nodes.reduce(
    (total, node) =>
      total + node.census_questions.length + countQuestions(node.children),
    0,
  );
}
