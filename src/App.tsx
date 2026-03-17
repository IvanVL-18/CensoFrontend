import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login/page/LoginPage";
import HomePage from "./pages/home/page/HomePage";
import DashboardPage from "./pages/deshboard/Dashboard";
import ChartsPage from "./pages/grapher/page/ChartsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ConfigurationsPage from "./pages/Configuration/Configuration";
import DashboardLayout from "./components/DashboardLayout";
import Modules from "./pages/Modules/Modules";
import Users from "./pages/Users/Users";
import Dependencies from "./pages/Dependencies/Dependencies";
import Sections from "./pages/Sections/Sections";
import Insitutions from "./pages/Institutions/Institutions";
import Occupations from "./pages/Occupations/Occupations";
import Index from "./pages/Indexs/Indexs";
import Roles from "./pages/Roles/Roles";
import Permissions from "./pages/Permissions/Permissions";
import PermissionRoles from "./pages/PermissionRoles/PermissionRoles";
import Categories from "./pages/categories/Categories";
import Catalogs from "./pages/catalogs/Catalogs";
import Verification from "./pages/Verification/Verification";
import ResetPassword from "./pages/ResetPassword/ResetPassword"

import Censos from "./pages/censos/Censos";
import { CensoDetail } from "./pages/censos/components/CensoDetail";
import CensoModulesView from "./pages/censos/CensoModules/CensoModulesView";
import CensoSectionsView from "./pages/censos/CensoSections/CensoSectionsView";

import Questions from "./pages/Questions/Questions";
import Builder from "././pages/Designer/components/Builder"
import "./App.css";
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

        <Route path="/ResetPassword" element={<ResetPassword/>} />

        {/* Censos */}
        <Route path="/graficador" element={<ChartsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/configuracion" element={<ConfigurationsPage />} />
        {/* Catálogos */}
        <Route path="/Modulos" element={<Modules />} />
        <Route path="/secciones" element={<Sections />} />
        <Route path="/ocupaciones" element={<Occupations />} />
        <Route path="/roles" element={<Roles />} />
        
        <Route path="/preguntas" element={<Questions />} />
        <Route path="/roles/permission-roles" element={<PermissionRoles />} />
        <Route path="/permisos" element={<Permissions />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/catalogos" element={<Catalogs />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/Dependency" element={<Dependencies />} />
        <Route path="/censos" element={<Censos />} />
        <Route path="/censos/:id" element={<CensoDetail />} />
        <Route path="/censos/:id/modulos" element={<CensoModulesView />} />
        <Route path="/censos/secciones/:id" element={<CensoSectionsView />} />
        <Route path="/builder/:id" element={<Builder />} />

      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
