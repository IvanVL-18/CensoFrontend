import { Routes, Route, Navigate } from "react-router-dom";

// Páginas base
import LoginPage from "./pages/login/page/LoginPage";
import HomePage from "./pages/home/page/HomePage";
import DashboardPage from "./pages/deshboard/page/DashboardPage";
import CensosPage from "./pages/census/page/CensosPage";
import ChartsPage from "./pages/grapher/page/ChartsPage";
import FiscalPage from "./pages/fiscal-years/page/FiscalPage";
import SettingsPage from "./pages/settings/page/SettingsPage";
import DashboardLayout from "./components/DashboardLayout";
import UsersPage from "./pages/users/page/UsersPage";
import Units from "./pages/Units/units";
import Section from "./pages/Section/Section";
import Insitutions from "./pages/Institutions/Institutions";
import Occupations from "./pages/Occupations/occupations";

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
        <Route path="/censos" element={<CensosPage />} />
        <Route path="/graficador" element={<ChartsPage />} />
        <Route path="/ejercicios-fiscales" element={<FiscalPage />} />
        <Route path="/ajustes" element={<SettingsPage />} />
        <Route path="/Unidades" element={<Units />} />
        <Route path="/Secciones" element={<Section/>} />
        <Route path="/Instituciones" element={<Insitutions/>} />

         <Route path="/Ocupaciones" element={<Occupations />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
