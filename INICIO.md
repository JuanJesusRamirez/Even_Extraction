# 🚀 Guía de Inicio - Polymarket Event Dashboard

Instrucciones para levantar el backend y el frontend del proyecto localmente.

---

## 📋 Requisitos Previos

### Backend
- **Python 3.13+** instalado
- **uv** (gestor de paquetes de Python) - [Instalar](https://github.com/astral-sh/uv)

### Frontend
- **Node.js 18+** instalado
- **npm** (gestor de paquetes de JavaScript)

---

## 🔧 Configuración Inicial (Primera vez)

### 1. Clonar o descargar el repositorio

```bash
cd Even_Extraction
```

### 2. Configurar Backend

```bash
# En la raíz del proyecto
uv sync
```

Esto instalará todas las dependencias de Python definidas en `pyproject.toml`.

### 3. Configurar Frontend

```bash
cd polymarket-dashboard
npm install
cd ..
```

---

## ▶️ Levantar el Backend

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
uv run uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

**Esperado:**
```
Uvicorn running on http://0.0.0.0:8000
```

El backend estará disponible en: **http://localhost:8000**

### Endpoints útiles:
- Health check: `http://localhost:8000/api/health`
- Search: `http://localhost:8000/api/search?q=bitcoin`

---

## ▶️ Levantar el Frontend

Abre **otra terminal** y navega a la carpeta `polymarket-dashboard`:

```bash
cd polymarket-dashboard
npm run dev
```

**Esperado:**
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

El frontend estará disponible en: **http://localhost:3000**

---

## 🚀 Opción: Levantar Ambos Simultáneamente (Windows)

Desde la raíz del proyecto, ejecuta:

```bash
.\start-dev.bat
```

Este script iniciará el backend y el frontend en diferentes ventanas de terminal.

### Para Linux/Mac:

```bash
./start-dev.sh
```

---

## ⏹️ Detener los Servidores

### Mientras está corriendo en la terminal
Presiona **`Ctrl + C`** para detener el servidor (funciona para backend y frontend).

### Detener y limpiar completamente
Si necesitas actualizar la app o hay problemas, ejecuta esto en PowerShell:

```powershell
# Matar todos los procesos
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar
Start-Sleep -Seconds 2

# Limpiar caché
Remove-Item -Recurse -Force "polymarket-dashboard\.next" -ErrorAction SilentlyContinue

Write-Output "✅ Limpio y listo"
```

---

## 🧹 Limpiar Caché (Si hay problemas)

Si experimentas problemas al levantar el frontend, limpia la caché:

```bash
# Windows
Remove-Item -Recurse -Force polymarket-dashboard\.next -ErrorAction SilentlyContinue

# Linux/Mac
rm -rf polymarket-dashboard/.next
```

---

## ✅ Verificar que todo funciona

1. **Backend**: Abre en el navegador → `http://localhost:8000/api/health`
   - Deberías ver una respuesta JSON

2. **Frontend**: Abre en el navegador → `http://localhost:3000`
   - Deberías ver la aplicación web cargada

---

## 🔌 Puertos Utilizados

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend (FastAPI) | 8000 | http://localhost:8000 |
| Frontend (Next.js) | 3000 | http://localhost:3000 |

---

## 🆘 Solución de Problemas

### Puerto ya está en uso

**Backend (Puerto 8000)**:
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 8000 | Stop-Process -Force

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Frontend (Puerto 3000)**:
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Error de módulos de Python no encontrados

```bash
# Sincroniza las dependencias nuevamente
uv sync
```

### Errores de compilación del Frontend

```bash
# Limpia dependencias y reinstala
cd polymarket-dashboard
rm -r node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 Archivos Importantes

- **Backend**: [backend/app.py](backend/app.py) - Aplicación principal FastAPI
- **Frontend**: [polymarket-dashboard/src/app/page.tsx](polymarket-dashboard/src/app/page.tsx) - Página principal
- **Configuración**: [polymarket-dashboard/next.config.ts](polymarket-dashboard/next.config.ts)

---

## 📝 Notas

- El backend incluye CORS habilitado para desarrollo local
- El frontend está optimizado con Next.js 16 y TypeScript
- Los datos se cargan desde `backend/data/backend_results.json`

---

¡Listo! Si todo funcionó, ya deberías tener ambas aplicaciones corriendo localmente. 🎉
