
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/Login/page/LoginPage";
import HomePage from "./pages/Home/page/HomePage";
import DashboardPage from "./pages/Deshboard/DashboardPage";
import ChartsPage from "./pages/Grapher/page/ChartsPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import DashboardLayout from "./components/DashboardLayout";

import Units from "./pages/Units/units";
import Census from "./pages/Census/CensosPage";
import CreateCensusPage from "./pages/Census/CreateCensus";
import CensusUnitsPage from "./pages/Census/CensusUnitsPage";
import CensusSectionsPage from "./pages/Census/CensusSectionsPage";   
import CensusQuestionsPage from "./pages/Census/CensusQuestionsPage"; 

import Sections from "./pages/Sections/Sections";
import Insitutions from "./pages/Institutions/Institutions";
import Occupations from "./pages/Occupations/Occupations";
import Index from "./pages/Index/indexs";
import Roles from "./pages/Roles/Roles";

export default function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Área autenticada */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/instituciones" element={<Insitutions />} />
        <Route path="/indices" element={<Index />} />

        {/* Censos */}
        <Route path="/censos" element={<Census />} />
        <Route path="/censos/crear" element={<CreateCensusPage />} />
        <Route path="/censos/unidades" element={<CensusUnitsPage />} />
        <Route path="/censos/secciones" element={<CensusSectionsPage />} />     
        <Route path="/censos/preguntas" element={<CensusQuestionsPage />} />    

        <Route path="/graficador" element={<ChartsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />

        {/* Catálogos */}
        <Route path="/unidades" element={<Units />} />
        <Route path="/secciones" element={<Sections />} />
        <Route path="/ocupaciones" element={<Occupations />} />
        <Route path="/Roles" element={<Roles />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
