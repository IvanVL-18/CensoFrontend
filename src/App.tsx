import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
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
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Censos from "./pages/censos/Censos";
import { CensoDetail } from "./pages/censos/components/CensoDetail";
import CensoModulesView from "./pages/censos/CensoModules/CensoModulesView";
import CensoSectionsView from "./pages/censos/CensoSections/CensoSectionsView";
import CensusQuestionsView from "./pages/censos/CensusQuestions/CensusQuestionsView";
import Questions from "./pages/Questions/Questions";
import Builder from "././pages/Designer/components/Builder";
import "./App.css";

export default function App() {
  return (
    <Routes>
      {/* ── Ruta pública ─────────────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── Área autenticada ─────────────────────────────────────────────── */}
      {/* ProtectedRoute sin permission = solo verifica autenticación         */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          <Route path="/" element={<Navigate to="/inicio" replace />} />

          {/* Sin permiso específico (cualquier usuario autenticado) */}
          <Route path="/inicio"        element={<HomePage />} />
          <Route path="/verification"  element={<Verification />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />

          {/* Dashboard */}
          <Route element={<ProtectedRoute permission="dashboard.ver" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* ── Censos ───────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="censos.ver" />}>
            <Route path="/censos"               element={<Censos />} />
            <Route path="/censos/:id"           element={<CensoDetail />} />
            <Route path="/censos/:id/modulos"   element={<CensoModulesView />} />
            <Route path="/censos/secciones/:id" element={<CensoSectionsView />} />
            <Route path="/censos/preguntas/:id" element={<CensusQuestionsView />} />
          </Route>

          <Route element={<ProtectedRoute permission="censos.editar" />}>
            <Route path="/builder/:id" element={<Builder />} />
          </Route>

          {/* ── Catálogos ────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="modulos.ver" />}>
            <Route path="/Modulos" element={<Modules />} />
          </Route>

          <Route element={<ProtectedRoute permission="secciones.ver" />}>
            <Route path="/secciones" element={<Sections />} />
          </Route>

          <Route element={<ProtectedRoute permission="preguntas.ver" />}>
            <Route path="/preguntas" element={<Questions />} />
          </Route>

          <Route element={<ProtectedRoute permission="ocupaciones.ver" />}>
            <Route path="/ocupaciones" element={<Occupations />} />
          </Route>

          <Route element={<ProtectedRoute permission="categorias.ver" />}>
            <Route path="/categorias" element={<Categories />} />
          </Route>

          <Route element={<ProtectedRoute permission="catalogos.ver" />}>
            <Route path="/catalogos" element={<Catalogs />} />
          </Route>

          {/* ── Administración ───────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="usuarios.ver" />}>
            <Route path="/usuarios" element={<Users />} />
          </Route>

          <Route element={<ProtectedRoute permission="instituciones.ver" />}>
            <Route path="/instituciones" element={<Insitutions />} />
          </Route>

          <Route element={<ProtectedRoute permission="dependencias.ver" />}>
            <Route path="/Dependency" element={<Dependencies />} />
          </Route>

          {/* ── Roles y Permisos ─────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="roles.ver" />}>
            <Route path="/roles" element={<Roles />} />
          </Route>

          <Route element={<ProtectedRoute permission="roles.editar" />}>
            <Route path="/roles/permission-roles" element={<PermissionRoles />} />
          </Route>

          <Route element={<ProtectedRoute permission="permisos.ver" />}>
            <Route path="/permisos" element={<Permissions />} />
          </Route>

          {/* ── Reportes y análisis ──────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="indices.ver" />}>
            <Route path="/indices" element={<Index />} />
          </Route>

          <Route element={<ProtectedRoute permission="graficas.ver" />}>
            <Route path="/graficador" element={<ChartsPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="reportes.ver" />}>
            <Route path="/reportes" element={<ReportsPage />} />
          </Route>

          {/* ── Configuración ────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="configuracion.ver" />}>
            <Route path="/configuracion" element={<ConfigurationsPage />} />
          </Route>

        </Route>
      </Route>

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
