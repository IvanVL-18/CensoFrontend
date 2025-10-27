import { Routes, Route, Navigate } from "react-router-dom";

// Páginas base
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import CensosPage from "./pages/CensosPage";
import ChartsPage from "./pages/ChartsPage";
import FiscalPage from "./pages/FiscalPage";
import SettingsPage from "./pages/SettingsPage";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Features
import UsersPage from "./features/users/pages/UsersPage";
import InstitutionsPage from "./features/institutions/pages/InstitutionsPage";

export default function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Área autenticada (usa layout con sidebar/topbar) */}
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
