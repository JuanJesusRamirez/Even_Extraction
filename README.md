# Polymarket Event Dashboard

Una aplicación fullstack moderna para explorar y filtrar eventos de Polymarket con análisis geopolítico.

## 📋 Estructura del Proyecto

```
Even_Extraction/
├── backend/                           # Backend API (FastAPI + Python)
│   ├── __init__.py
│   ├── app.py                        # Aplicación FastAPI principal
│   ├── .env.example                  # Variables de entorno ejemplo
│   ├── data/                         # Archivos JSON de datos
│   │   └── backend_results.json      # Datos de eventos
│   └── scripts/                      # Scripts de extracción (geopolitical.py, etc.)
│
├── polymarket-dashboard/              # Frontend (Next.js + React + TypeScript)
│   ├── src/
│   │   ├── app/                      # App Router de Next.js
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/               # Componentes React reutilizables
│   │   │   ├── common/               # Layout, Header, Footer
│   │   │   ├── events/               # EventCard, EventsList
│   │   │   ├── filters/              # TagFilter, TagInput
│   │   │   └── ui/                   # Componentes base
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useEvents.ts
│   │   │   └── useTags.ts
│   │   ├── lib/                      # Librerías y clientes
│   │   │   └── api.ts                # Cliente HTTP para backend
│   │   ├── types/                    # Tipos TypeScript
│   │   │   ├── event.ts
│   │   │   └── api.ts
│   │   ├── utils/                    # Funciones auxiliares
│   │   │   └── formatters.ts
│   │   ├── constants/                # Constantes de la app
│   │   │   └── config.ts
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── .env.local                    # Configuración local
│   └── next.config.ts
│
├── pyproject.toml                    # Configuración Python (uv)
├── start-dev.bat                     # Script inicio (Windows)
├── start-dev.sh                      # Script inicio (Linux/Mac)
└── README.md                         # Este archivo

```

## 🚀 Inicio Rápido

### Requisitos Previos

- **Python 3.13+**
- **Node.js 18+** (para npm)
- **uv** - Instalador moderno de Python

#### Instalar UV (si no lo tienes)

```bash
# Recomendado (instalación rápida)
curl -LsSf https://astral.sh/uv/install.sh | sh

# O con pip
pip install uv
```

### Opción 1: Script Automático (Recomendado)

**Windows:**
```bash
.\start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

El script automáticamente:
- ✅ Sincroniza dependencias Python con `uv`
- ✅ Instala dependencias de frontend
- ✅ Inicia backend en puerto 8000
- ✅ Inicia frontend en puerto 3000

### Opción 2: Inicio Manual

**Backend:**
```bash
# Sincronizar dependencias
uv sync

# Ejecutar la aplicación
uv run python -m uvicorn backend.app:app --reload --port 8000
```

El API estará disponible en: **http://localhost:8000/docs**

**Frontend (en otra terminal):**
```bash
cd polymarket-dashboard

# Instalar dependencias (solo primera vez)
npm install

# Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## 📡 API Endpoints

El backend expone los siguientes endpoints:

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/` | Información general del API |
| GET | `/api/events` | Obtener todos los eventos |
| GET | `/api/events?tag=<slug>` | Filtrar eventos por tag |
| GET | `/api/events/{id}` | Obtener evento específico |
| GET | `/api/tags` | Obtener todos los tags disponibles |
| GET | `/api/health` | Health check del servidor |
| GET | `/docs` | Documentación interactiva (Swagger UI) |
| GET | `/redoc` | Documentación ReDoc |

### Ejemplos de Uso

```bash
# Obtener todos los eventos
curl http://localhost:8000/api/events

# Filtrar por tag específico
curl "http://localhost:8000/api/events?tag=geopolitics"

# Obtener evento por ID
curl http://localhost:8000/api/events/119721

# Obtener todos los tags
curl http://localhost:8000/api/tags

# Con paginación
curl "http://localhost:8000/api/events?skip=0&limit=10"

# Health check
curl http://localhost:8000/api/health
```

## 🔧 Configuración

### Variables de Entorno - Backend

Crear archivo `backend/.env` (copia de `backend/.env.example`):

```env
API_PORT=8000
API_HOST=0.0.0.0
ENVIRONMENT=development
LOG_LEVEL=INFO
POLYMARKET_API_URL=https://clob.polymarket.com
```

### Variables de Entorno - Frontend

El archivo `polymarket-dashboard/.env.local` contiene:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Para cambiar en producción:
```env
NEXT_PUBLIC_API_URL=https://tu-api.com
```

## 📦 Dependencias Principales

### Backend (Python)
- **FastAPI** (0.109+) - Framework web moderno y rápido
- **Uvicorn** (0.27+) - Servidor ASGI de alto rendimiento
- **Python-dotenv** - Gestión de variables de entorno
- **Requests** - Cliente HTTP para scripts de extracción

### Frontend (Node.js)
- **Next.js 16** - Framework React con SSR y optimizaciones
- **React 19** - Librería UI moderna
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de utilidades CSS

## 📚 Scripts Npm Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo

# Producción
npm run build        # Compilar para producción
npm start            # Ejecutar build compilado

# Validación
npm run lint         # ESLint + Next.js linting
npm run lint:fix     # Auto-fix linting issues
```

## 🏗️ Estructura de Tipos TypeScript

El proyecto mantiene tipos centralizados en `src/types/`:

```typescript
// Event - Evento principal
interface Event {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  active: boolean;
  volume: number;
  liquidity: number;
  endDate: string;
}

// Tag - Etiqueta de categorización
interface Tag {
  id: string;
  label: string;
  slug: string;
}

// Respuestas API tipadas
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 🎯 Custom Hooks

### `useEvents(tag?: string)`

Hook para obtener eventos del backend con refreshing automático.

```typescript
const { events, loading, error } = useEvents('geopolitics');
```

### `useTags()`

Hook para obtener todos los tags disponibles.

```typescript
const { tags, loading, error } = useTags();
```

## 🛠️ Utilidades

### Formateo de Datos

```typescript
import { formatDate, formatNumber, formatCurrency, getTimeRemaining } from '@/utils/formatters';

formatDate('2026-03-31')           // "31 de marzo de 2026"
formatNumber(15000)                 // "15K"
formatCurrency(15000)               // "$15K"
getTimeRemaining('2026-03-31')     // "48d 5h"
```

## 🐛 Solución de Problemas

### Puerto 8000 en uso (Backend)

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

### Puerto 3000 en uso (Frontend)

```bash
# Cambiar puerto en desarrollo
npm run dev -- -p 3001
```

### Errores de CORS

Asegurar que `NEXT_PUBLIC_API_URL` en `polymarket-dashboard/.env.local` apunta al URL correto del backend.

### Backend no responde

Verificar:
1. Backend está ejecutándose en puerto 8000
2. `http://localhost:8000/api/health` retorna status `healthy`
3. Archivo `backend/data/backend_results.json` existe y es válido

## 📖 Documentación Adicional

- [Documentación del Proyecto](./DOCUMENTATION.md) - Detalles de extracción de datos
- [FastAPI Interactive Docs](http://localhost:8000/docs) - Swagger UI
- [FastAPI ReDoc](http://localhost:8000/redoc) - ReDoc documentation
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

## 📝 Estructura Estándar Next.js

Este proyecto sigue las mejores prácticas de Next.js:

✅ App Router (no Pages Router)
✅ Server Components por defecto
✅ TypeScript strict
✅ Path aliases (`@/`)
✅ Organización por features
✅ Custom hooks reutilizables
✅ Tipos centralizados

## 🔄 Actualizar Datos

El backend carga automáticamente los eventos desde `backend/data/backend_results.json`. Para actualizar datos:

1. Ejecutar scripts Python en `backend/scripts/`:
   ```bash
   cd backend/scripts
   python geopolitical.py
   ```

2. Recargar la página del frontend (o el backend recarga cada 30s)

## 🚀 Deployment (Próximas Versiones)

Instrucciones para desplegar en producción vendrán próximamente.

## 📄 Licencia

Privado

---

**¿Preguntas o sugerencias?** Revisa los archivos de configuración o la documentación del proyecto.