import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 👈 Importante para manejar rutas
import "bootstrap/dist/css/bootstrap.min.css"; // Estructura del formulario
import "formiojs/dist/formio.full.min.css";    // Estilos de los inputs

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

