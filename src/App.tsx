
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/login/page/LoginPage";
import HomePage from "./pages/home/page/HomePage";
import DashboardPage from "./pages/deshboard/Dashboard";
import ChartsPage from "./pages/grapher/page/ChartsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ConfigurationsPage from "./pages/Configuration/Configuration";
import DashboardLayout from "./components/DashboardLayout";

import Units from "./pages/Units/units";


import Sections from "./pages/Sections/Sections";
import Insitutions from "./pages/institutions/Institutions";
import Occupations from "./pages/Occupations/Occupations";
import Index from "./pages/Indexs/Indexs";
import Roles from "./pages/Roles/Roles";
import Areas from "./pages/Dependencies/Dependencies";
import Permissions from "./pages/Permissions/Permissions";
import PermissionRoles from "./pages/PermissionRoles/PermissionRoles";

import Categories from "./pages/categories/Categories";
import Catalogs from "./pages/catalogs/Catalogs";
import Verification from "./pages/Verification/Verification";

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

        <Route path="/verification" element={<Verification />} />

        {/* Censos */}
   

        <Route path="/graficador" element={<ChartsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/configuracion" element={<ConfigurationsPage />} />

        {/* Catálogos */}
        <Route path="/unidades" element={<Units />} />
        <Route path="/secciones" element={<Sections />} />
        <Route path="/ocupaciones" element={<Occupations />} />
        <Route path="/Roles" element={<Roles />} />
        <Route path="/permission-roles" element={<PermissionRoles />} />
        <Route path="/Area" element={<Areas />} />
        <Route path="/permisos" element={<Permissions />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/catalogos" element={<Catalogs />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
