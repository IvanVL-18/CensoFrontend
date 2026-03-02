import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/login/page/LoginPage";
import HomePage from "./pages/home/page/HomePage";
import Dashboard from "./pages/deshboard/Dashboard";
import ChartsPage from "./pages/grapher/page/ChartsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ConfigurationsPage from "./pages/Configuration/Configuration";
import DashboardLayout from "./components/DashboardLayout";

import Users from "./pages/Users/Users";

import Units from "./pages/Units/units";

import Sections from "./pages/Sections/Sections";
import Insitutions from "./pages/Institutions/Institutions";
import Occupations from "./pages/Occupations/Occupations";
import Index from "./pages/Indexs/Indexs";
import Roles from "./pages/Roles/Roles";
import Dependencies from "./pages/Dependencies/Dependencies";
import Permissions from "./pages/Permissions/Permissions";

import Categories from "./pages/categories/Categories";
import Catalogs from "./pages/catalogs/Catalogs";
import Censos from "./pages/censos/Censos";
import { CensoDetail } from "./pages/censos/components/CensoDetail";
// Importar la nueva vista de unidades del censo (ajusta la ruta si el nombre es diferente)
import CensoUnitsView from "./pages/censos/components/CensoUnitsView";

export default function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dependencia autenticada */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/instituciones" element={<Insitutions />} />
        <Route path="/indices" element={<Index />} />

        {/* Censos */}
        <Route path="/censos" element={<Censos />} />
        <Route path="/censos/:id" element={<CensoDetail />} />
        {/* Ruta para ver las unidades de un censo */}
        <Route path="/censos/:id/unidades" element={<CensoUnitsView />} />

        <Route path="/graficador" element={<ChartsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/configuracion" element={<ConfigurationsPage />} />

        {/* Catálogos */}
        <Route path="/unidades" element={<Units />} />
        <Route path="/secciones" element={<Sections />} />
        <Route path="/ocupaciones" element={<Occupations />} />
        <Route path="/Roles" element={<Roles />} />
        <Route path="/Dependency" element={<Dependencies />} />
        <Route path="/permisos" element={<Permissions />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/catalogos" element={<Catalogs />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}