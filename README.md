<div align="center">

# CensoCitnova — Frontend



Plataforma web para la creación, administración y levantamiento de censos institucionales con constructor visual de formularios, mapas interactivos y generación de reportes estadísticos.

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos Principales](#módulos-principales)
- [Sistema de Autenticación y Permisos](#sistema-de-autenticación-y-permisos)
- [Integración con la API](#integración-con-la-api)
- [Convenciones de Código](#convenciones-de-código)

---

## Descripción General

CensoCitnova Frontend es una **Single Page Application (SPA)** construida con React 19 y TypeScript que actúa como interfaz principal del sistema de gestión censal. Permite a instituciones y organismos:

- Diseñar formularios censales mediante un **constructor visual drag & drop** (Form.io)
- Organizar censos en módulos, secciones y preguntas jerárquicas
- Asignar censos a instituciones y usuarios con un sistema de **roles y permisos granulares**
- Capturar respuestas y visualizar resultados con **gráficos estadísticos** y **mapas georreferenciados**
- Exportar información a Excel y generar reportes administrativos

---

## Tecnologías

### Core

| Tecnología | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | ^19.1.0 | Framework de UI |
| [TypeScript](https://www.typescriptlang.org/) | ~5.8.3 | Tipado estático |
| [Vite](https://vitejs.dev/) + SWC | ^6.3.5 | Bundler y servidor de desarrollo |
| [React Router DOM](https://reactrouter.com/) | ^7.9.4 | Enrutamiento del cliente |

### UI y Estilos

| Tecnología | Versión | Uso |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com/) | ^4.1.16 | Utilidades CSS |
| [React Bootstrap](https://react-bootstrap.netlify.app/) | ^2.10.10 | Componentes UI (con scope `.bs`) |
| [Headless UI](https://headlessui.com/) | ^2.2.9 | Componentes accesibles sin estilos |
| [Lucide React](https://lucide.dev/) | ^0.546.0 | Íconos |
| Sass | ^1.98.0 | Preprocesador CSS |

### Formularios y Datos

| Tecnología | Versión | Uso |
|---|---|---|
| [@formio/react](https://github.com/formio/react) | ^5.0.0 | Constructor y renderizador visual de formularios |
| [Axios](https://axios-http.com/) | ^1.13.2 | Cliente HTTP con interceptores de autenticación |
| [Zod](https://zod.dev/) | ^4.3.6 | Validación de esquemas |
| [XLSX](https://sheetjs.com/) | ^0.18.5 | Exportación a Excel |

### Visualización

| Tecnología | Versión | Uso |
|---|---|---|
| [Recharts](https://recharts.org/) | ^3.3.0 | Gráficos estadísticos |
| [Leaflet](https://leafletjs.com/) + React Leaflet | ^1.9.4 | Mapas interactivos georreferenciados |
| [Geoapify](https://www.geoapify.com/) | API | Geocodificación y búsqueda de lugares |

---

## Requisitos Previos

- **Node.js** >= 18.x
- **pnpm** >= 8.x
- Backend **CensoCitnova API** corriendo localmente (Laravel / Sanctum)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd CensoFrontend

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correspondientes

# 4. Iniciar el servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
# URL base de la API (sin barra final)
VITE_API_BASE_URL=http://localhost:8000/api

# Clave de la API de Geoapify para geocodificación
VITE_GEOAPIFY_KEY=tu_clave_aqui
```

> **Nota:** El servidor de Vite incluye un proxy hacia `http://apis-censo.test` para evitar problemas de CORS en desarrollo. Revisa `vite.config.ts` si necesitas apuntar a un dominio diferente.

---

## Scripts Disponibles

```bash
# Servidor de desarrollo con HMR
pnpm dev

# Compilación de producción (TypeScript + Vite)
pnpm build

# Vista previa del build de producción
pnpm preview

# Linting con ESLint
pnpm lint
```

---

## Estructura del Proyecto

```
src/
├── App.tsx                     # Definición de rutas y layout raíz
├── main.tsx                    # Entry point — BrowserRouter + AuthProvider
│
├── assets/                     # Recursos estáticos
│   └── fonts/                  # Fuentes GMX y Montserrat
│
├── components/                 # Componentes reutilizables globales
│   ├── CensusFormRenderer.tsx  # Renderizador de formularios censales
│   ├── DashboardLayout.tsx     # Layout principal con sidebar
│   ├── ProtectedRoute.tsx      # Protección de rutas por permiso
│   ├── Sidebar.tsx
│   └── ...
│
├── context/
│   ├── AuthContext.tsx         # Estado global de autenticación y permisos
│   └── ToastContext.tsx        # Notificaciones toast globales
│
├── lib/
│   └── Axios.ts                # Instancia de Axios con interceptor de token
│
├── pages/                      # Páginas de la aplicación (por módulo)
│   ├── Designer/               # Constructor visual de formularios (Form.io)
│   ├── censos/                 # Gestión de censos
│   ├── Institutions/           # Instituciones con mapa Leaflet
│   ├── grapher/                # Gráficos y análisis estadístico
│   ├── reports/                # Reportes administrativos
│   ├── Users/                  # Gestión de usuarios
│   ├── Roles/ & Permissions/   # Control de acceso
│   └── ...
│
├── services/
│   └── authService.ts          # Endpoints de login, logout y /me
│
├── styles/
│   ├── bootstrap-scoped.scss   # Bootstrap encapsulado bajo selector .bs
│   └── bootstrap-scoped.css    # CSS compilado para producción
│
└── utils/
    └── validation.ts           # Esquemas de validación con Zod
```

---

## Módulos Principales

### Constructor de Formularios (`/builder/:id`)

El corazón del sistema. Basado en **Form.io**, permite diseñar formularios censales complejos mediante una interfaz de arrastrar y soltar. Características:

- Editor visual WYSIWYG con todos los tipos de campo de Form.io
- **Configuración de repeticiones:** define secciones que el usuario puede repetir N veces
- **Operaciones matemáticas:** calcula campos derivados automáticamente
- Guardado automático con debounce (700 ms) al detectar cambios
- Vista previa en tiempo real del formulario resultante
- Visualización del esquema JSON generado

### Gestión de Censos (`/censos`)

Jerarquía de contenido: **Censo → Módulos → Secciones → Preguntas**. Cada pregunta tiene un formulario diseñado en el Builder. Los censos se asignan a instituciones, que a su vez los asignan a sus usuarios.

### Instituciones (`/instituciones`)

Catálogo de instituciones participantes con geolocalización integrada mediante **Leaflet** y **Geoapify**. Permite visualizar la distribución geográfica de las instituciones en un mapa interactivo.

### Graficador (`/graficador`)

Generación de gráficos estadísticos a partir de las respuestas recopiladas, usando **Recharts**. Soporta múltiples tipos de visualización comparativa entre instituciones y periodos.

### Reportes (`/reportes`)

Exportación de datos en formato **Excel** (.xlsx) con filtros por censo, institución y periodo. Tabla interactiva con paginación y opciones de descarga.

### Control de Acceso (`/roles`, `/permisos`)

Sistema de roles con permisos granulares. Cada ruta de la aplicación requiere un permiso específico (ej. `censos.view`, `censos.edit`). El rol **Super Admin** tiene acceso irrestricto.

---

## Sistema de Autenticación y Permisos

La autenticación usa **Laravel Sanctum** (tokens Bearer). El token se almacena en `sessionStorage` y se adjunta automáticamente a cada petición mediante un interceptor de Axios.

### Flujo de Autenticación

```
App mount
  └── GET /me (con token almacenado)
        ├── 200 → restaurar sesión
        └── 401 → redirigir a /login

POST /login
  └── { access_token } → sessionStorage
        └── GET /me → cargar user + role + permissions
```

### Protección de Rutas

```tsx
<ProtectedRoute permission="censos.edit">
  <Builder />
</ProtectedRoute>
```

`ProtectedRoute` verifica el permiso usando `hasPermission()` del `AuthContext`. Los usuarios sin el permiso requerido son redirigidos a `/inicio`.

---

## Integración con la API

El cliente HTTP ([src/lib/Axios.ts](src/lib/Axios.ts)) apunta a `VITE_API_BASE_URL` y agrega automáticamente el header `Authorization: Bearer <token>` en cada petición.

### Endpoints Principales

| Recurso | Método | Endpoint |
|---|---|---|
| Autenticación | POST | `/login` |
| Perfil actual | GET | `/me` |
| Formulario de pregunta | GET | `/questions/:id/getForm` |
| Guardar formulario | POST | `/questions/:id/saveForm` |
| Censos | GET/POST | `/censos` |
| Instituciones | GET/POST | `/institutions` |

> Para el listado completo de endpoints, consulta la documentación del backend (CensoCitnova API).

---

## Convenciones de Código

- **Componentes:** PascalCase (`Builder.tsx`, `DashboardLayout.tsx`)
- **Hooks personalizados:** camelCase con prefijo `use` (`useModulesData.ts`)
- **Servicios:** sufijo `.service.ts` (`Modules.service.ts`)
- **Esquemas de validación:** sufijo `.schema.ts` o en carpeta `schemas/`
- **Tipos e interfaces:** carpeta `interfaces/` o sufijo `.types.ts`
- **Bootstrap encapsulado:** envolver con `<div className="bs">` para activar estilos con scope y evitar conflictos con Form.io

---

<div align="center">

Desarrollado para **GOBIERNO DE HIDALGO** — 

</div>
