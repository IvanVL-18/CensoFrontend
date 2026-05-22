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
import Institutions from "./pages/Institutions/Institutions";
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
import CensusViewPage from "./pages/censos/CensusViewPage";
import Questions from "./pages/Questions/Questions";
import Builder from "././pages/Designer/components/Builder";
import Answers from "./pages/Answers/Answers";
import CensusInstitutionsPage from "./pages/AdminAnswers/CensusInstitutionsPage";
import InstitutionUsersPage from "./pages/AdminAnswers/InstitutionUsersPage";
import UserAnswersPage from "./pages/AdminAnswers/UserAnswersPage";
import ForgotPasswordPage from "./pages/login/page/ForgotPasswordPage";
import "./App.css";

export default function App() {
  return (
    <Routes>
      {/* ── Ruta pública ─────────────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── Área autenticada ─────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/inicio" replace />} />

          {/* Sin permiso específico (cualquier usuario autenticado) */}
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
          <Route path="/configuracion" element={<ConfigurationsPage />} />
          <Route path="/mis-censos" element={<Answers />} />

          {/* Dashboard */}
          <Route element={<ProtectedRoute permission="dashboard.view" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/admin/censos/:censusId/instituciones"
              element={<CensusInstitutionsPage />}
            />
            <Route
              path="/admin/censos/:censusId/instituciones/:institutionId/usuarios"
              element={<InstitutionUsersPage />}
            />
            <Route
              path="/admin/censos/:censusId/instituciones/:institutionId/usuarios/:userId/respuestas"
              element={<UserAnswersPage />}
            />
          </Route>

          {/* ── Censos ───────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="censos.view" />}>
            <Route path="/censos" element={<Censos />} />
            <Route path="/censos/:id" element={<CensoDetail />} />
            <Route path="/censos/:id/modulos" element={<CensoModulesView />} />
            <Route
              path="/censos/secciones/:id"
              element={<CensoSectionsView />}
            />
            <Route
              path="/censos/preguntas/:id"
              element={<CensusQuestionsView />}
            />
            <Route
              path="/censos/:censusId/ver-censo"
              element={<CensusViewPage />}
            />
          </Route>

          <Route element={<ProtectedRoute permission="censos.edit" />}>
            <Route path="/builder/:id" element={<Builder />} />
          </Route>

          {/* ── Catálogos ────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="modules.view" />}>
            <Route path="/Modulos" element={<Modules />} />
          </Route>

          <Route element={<ProtectedRoute permission="sections.view" />}>
            <Route path="/secciones" element={<Sections />} />
          </Route>

          <Route element={<ProtectedRoute permission="questions.view" />}>
            <Route path="/preguntas" element={<Questions />} />
          </Route>

          <Route element={<ProtectedRoute permission="occupations.view" />}>
            <Route path="/ocupaciones" element={<Occupations />} />
          </Route>

          <Route element={<ProtectedRoute permission="categories.view" />}>
            <Route path="/categorias" element={<Categories />} />
          </Route>

          <Route element={<ProtectedRoute permission="catalogs.view" />}>
            <Route path="/catalogos" element={<Catalogs />} />
          </Route>

          {/* ── Administración ───────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="users.view" />}>
            <Route path="/usuarios" element={<Users />} />
          </Route>

          <Route element={<ProtectedRoute permission="institutions.view" />}>
            <Route path="/instituciones" element={<Institutions />} />
          </Route>

          <Route element={<ProtectedRoute permission="dependencie.view" />}>
            <Route path="/Dependency" element={<Dependencies />} />
          </Route>

          {/* ── Roles y Permisos ─────────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="roles.view" />}>
            <Route path="/roles" element={<Roles />} />
            <Route path="/permisos" element={<Permissions />} />
          </Route>

          <Route element={<ProtectedRoute permission="roles.edit" />}>
            <Route
              path="/roles/permission-roles"
              element={<PermissionRoles />}
            />
          </Route>

          {/* ── Reportes y análisis ──────────────────────────────────────── */}
          <Route element={<ProtectedRoute permission="indexs.view" />}>
            <Route path="/indices" element={<Index />} />
          </Route>

          <Route element={<ProtectedRoute permission="graficador.view" />}>
            <Route path="/graficador" element={<ChartsPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="reports.view" />}>
            <Route path="/reportes" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
