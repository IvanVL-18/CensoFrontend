import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Builder from "./components/Builder";

export default function App() {
  return (
    <Routes>
      <Route path="/builder/:id" element={<Builder />} />
      {/* Cualquier otra ruta redirige al builder o muestra 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
