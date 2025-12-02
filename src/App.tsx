// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// Páginas base
import LoginPage from "./pages/login/page/LoginPage";
import HomePage from "./pages/home/page/HomePage";
import DashboardPage from "./pages/deshboard/page/DashboardPage";
import ChartsPage from "./pages/grapher/page/ChartsPage";
import FiscalPage from "./pages/fiscal-years/page/FiscalPage";
import SettingsPage from "./pages/settings/page/SettingsPage";
import DashboardLayout from "./components/DashboardLayout";

import Units from "./pages/Units/units";
import Census from "./pages/census/CensosPage";
import CreateCensusPage from "./pages/census/CreateCensus";
import CensusUnitsPage from "./pages/census/CensusUnitsPage";

import Section from "./pages/Section/Section";
import Insitutions from "./pages/Institutions/Institutions";
import Occupations from "./pages/Occupations/Occupations";

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
        <Route path="/instituciones" element={<Insitutions />} />

        {/*Censos */}
        <Route path="/censos" element={<Census />} />
        <Route path="/censos/crear" element={<CreateCensusPage />} />
        <Route path="/censos/unidades" element={<CensusUnitsPage />} />

        <Route path="/graficador" element={<ChartsPage />} />
        <Route path="/ejercicios-fiscales" element={<FiscalPage />} />
        <Route path="/ajustes" element={<SettingsPage />} />

        {/* Rutas de catálogos (accesibles desde Ajustes) */}
        <Route path="/unidades" element={<Units />} />
        <Route path="/secciones" element={<Section />} />
        <Route path="/ocupaciones" element={<Occupations />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
