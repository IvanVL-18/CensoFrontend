export default {
  plugins: {
    "postcss-prefix-selector": {
      prefix: ".bs",
      /**
       * Genera reglas CSS para DOS scopes en una sola pasada:
       *
       *   1. .bs            → uso normal dentro del wrapper <div className="bs">
       *   2. .formio-dialog → modales de edición que Form.io monta via portal
       *                       en document.body (fuera del árbol de React)
       *
       * Resultado de ejemplo:
       *   .btn { ... }
       *   → .bs .btn, .formio-dialog .btn { ... }
       *
       * Esto elimina la necesidad de MutationObserver o body.classList —
       * los estilos aplican desde CSS puro, sin JavaScript en runtime.
       */
      transform(prefix, selector, prefixedSelector, filePath) {
        // Solo afectar nuestro archivo scoped; ignorar todo lo demás
        if (!filePath || !filePath.includes("bootstrap-scoped")) return selector;

        const s = selector.trim();

        // Selectores globales que NO deben prefijarse en ningún scope
        if (
          s === ":root" ||
          s === "html" ||
          s === "body" ||
          s === "*" ||
          s === "*, ::before, ::after" ||
          s === "*,\n::before,\n::after" ||
          s.startsWith(":root")
        ) {
          return selector;
        }

        // Genera la regla doble: scope .bs + scope .formio-dialog
        return `${prefixedSelector}, .formio-dialog ${s}`;
      },
    },
  },
};