// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

// Layout y páginas del dashboard
import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import InstitutionsPage from "./pages/InstitutionsPage";
import CensosPage from "./pages/CensosPage";
import ChartsPage from "./pages/ChartsPage";
import FiscalPage from "./pages/FiscalPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      {/* Login independiente */}
      <Route path="/login" element={<LoginPage />} />

      {/* Área autenticada con layout (sidebar + topbar) */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/instituciones" element={<InstitutionsPage />} />
        <Route path="/censos" element={<CensosPage />} />
        <Route path="/graficador" element={<ChartsPage />} />
        <Route path="/ejercicios-fiscales" element={<FiscalPage />} />
        <Route path="/ajustes" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
    
  );
}
