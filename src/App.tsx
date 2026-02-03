import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import HomePage from "./pages/home/HomePage";
import DashboardPage from "./pages/deshboard/DashboardPage";
import ChartsPage from "./pages/grapher/ChartsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import DashboardLayout from "./components/DashboardLayout";

import Units from "./pages/Units/units";
import Census from "./pages/census/CensosPage";
import CreateCensusPage from "./pages/census/CreateCensus";
import CensusUnitsPage from "./pages/census/CensusUnitsPage";
import CensusSectionsPage from "./pages/census/CensusSectionsPage";  
import CensusQuestionsPage from "./pages/census/CensusQuestionsPage"; 

import Section from "./pages/Section/Section";
import Insitutions from "./pages/Institutions/Institutions";
import Occupations from "./pages/Occupations/Occupations";
import Index from "./pages/Index/indexs";
import Area from "./pages/area/Areas";
import Questions from "./pages/Questions/questions";

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

        {/* Censos */}
        <Route path="/censos" element={<Census />} />
        <Route path="/censos/crear" element={<CreateCensusPage />} />
        <Route path="/censos/unidades" element={<CensusUnitsPage />} />
        <Route path="/censos/secciones" element={<CensusSectionsPage />} />    
        <Route path="/censos/preguntas" element={<CensusQuestionsPage />} /> 

        <Route path="/graficador" element={<ChartsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />

        {/* Configuración */}
        <Route path="/unidades" element={<Units />} />
        <Route path="/secciones" element={<Section />} />
        <Route path="/ocupaciones" element={<Occupations />} />
        <Route path="/indices" element={<Index />} />
        <Route path="/area" element={<Area />} />
        <Route path="/preguntas" element={<Questions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
