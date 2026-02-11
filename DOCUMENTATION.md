# Documentación: Extracción de Eventos Geopolíticos de Polymarket

## 📋 Índice
1. [Visión General](#visión-general)
2. [Estructura de Datos](#estructura-de-datos)
3. [Código de Extracción](#código-de-extracción)
4. [Flujo de Ejecución](#flujo-de-ejecución)
5. [Ejemplos](#ejemplos)
6. [API Utilizada](#api-utilizada)

---

## 🎯 Visión General

Este proyecto extrae **eventos geopolíticos activos** de la API de Polymarket, filtrando por categorías específicas (geopolítica y política) y guardar la información en un archivo JSON estructurado.

**Archivos principales:**
- `geopolitical.py` - Script principal de extracción
- `results.json` - Archivo de salida con eventos extraídos

---

## 📊 Estructura de Datos

### Estructura General del JSON

```json
[
  {
    "id": "string",
    "title": "string",
    "tags": ["string"],
    "active": "boolean",
    "markets_count": "number",
    "first_market": {...},
    "raw_event": {...}
  },
  ...
]
```

**Es un array de objetos**, donde cada objeto representa un **evento geopolítico** con todos sus mercados asociados.

---

### Campos Principales de cada Evento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String | Identificador único del evento en Polymarket |
| `title` | String | Título del evento (ej: "Macron out by...?") |
| `tags` | Array[String] | Categorías/etiquetas del evento |
| `active` | Boolean | Si el evento está activo |
| `markets_count` | Number | Cantidad de mercados predectivos dentro del evento |
| `first_market` | Object | Primer mercado con estructura resumida |
| `raw_event` | Object | Datos completos del evento desde la API |

---

### Estructura de `first_market`

```json
{
  "outcomes": ["Yes", "No"],
  "outcomePrices": ["0.015", "0.985"],
  "market": {
    "id": "521949",
    "question": "Will Elon and DOGE cut more than $250b in federal spending in 2025?",
    "conditionId": "0x9d24d9f9b...",
    "slug": "will-elon-and-doge-cut-more-than-250b...",
    "endDate": "2025-12-31T12:00:00Z",
    "liquidity": "5565.26772",
    "volume": "718787.294561",
    "active": true,
    "closed": false,
    ...
  }
}
```

**Campos:**
- `outcomes` - Posibles resultados del mercado (Yes/No)
- `outcomePrices` - Precios actuales (probabilidades implícitas)
- `market` - Objeto completo del primer mercado

---

### Estructura de `raw_event` (Evento Completo)

El `raw_event` contiene el evento expandido desde la API con:

#### Metadata del Evento
```json
{
  "id": "16263",
  "ticker": "macron-out-in-2025",
  "slug": "macron-out-in-2025",
  "title": "Macron out by...?",
  "description": "This market will resolve...",
  "active": true,
  "closed": false,
  "featured": false,
  "restricted": true,
  ...
}
```

#### Métricas de Actividad
```json
{
  "volume": "1796921.064752",           // Volumen total
  "liquidity": "23630.39449",           // Liquidez total
  "volume24hr": "1010.675576",          // Volumen en últimas 24h
  "volume1wk": "55150.276687",          // Volumen en última semana
  "volume1mo": "464907.8064850002",     // Volumen en último mes
  "volume1yr": "1796190.202977002",     // Volumen anual
  "competitive": 0.8269203934073772,    // Índice de competitividad
  "commentCount": 86                    // Comentarios en el evento
}
```

#### Información de Tiempo
```json
{
  "startDate": "2025-01-03T19:35:04.095066Z",
  "creationDate": "2025-01-03T19:35:04.095064Z",
  "endDate": "2026-06-30T12:00:00Z",
  "createdAt": "2025-01-03T19:28:39.855536Z",
  "updatedAt": "2026-02-11T16:00:10.874703Z"
}
```

#### Array de Mercados Asociados
```json
{
  "markets": [
    {
      "id": "517231",
      "question": "Macron out in 2025?",
      "outcomes": ["Yes", "No"],
      "outcomePrices": ["0", "1"],
      "volume": "1386219.767204",
      "liquidity": "5565.26772",
      "endDate": "2025-12-31T12:00:00Z",
      "lastTradePrice": 0.024,
      "bestBid": 0.002,
      "bestAsk": 0.028,
      ...
    },
    {
      "id": "517232",
      "question": "Macron out by June 2025?",
      ...
    },
    ...
  ]
}
```

---

## 💻 Código de Extracción

### Archivo: `geopolitical.py`

#### Importes
```python
import requests    # Para hacer HTTP requests
import json        # Para manejo de JSON
import os         # Para rutas de archivos
```

#### URL de la API
```python
url = "https://gamma-api.polymarket.com/events"
```
- Endpoint: `/events`
- Parámetro: `?closed=false` (solo eventos abiertos)

#### Flujo del Script

**1. Obtener respuesta de la API**
```python
r = requests.get(url + "?closed=false")
response = r.json()
```

**2. Inicializar contenedor de resultados**
```python
results = []
geopolitical_tags = ['geopolitics', 'politics']
```

**3. Iterar sobre eventos**
```python
for event in response:
    if 'tags' in event:
        event_tags = [tag.get('slug') for tag in event.get('tags', [])]
        if any(tag in geopolitical_tags for tag in event_tags):
            # ... procesamiento
```

**Lógica:**
- Verifica si el evento tiene tags
- Extrae los slug de las tags
- Filtra solo eventos con tags 'geopolitics' o 'politics'

**4. Extraer datos del evento**
```python
title = event.get('title', 'N/A')
tags = [tag.get('label') for tag in event.get('tags', [])]
active = event.get('active')
markets = event.get('markets', [])
markets_count = len(markets)
first_market = markets[0] if markets else {}
outcomes = first_market.get('outcomes')
outcome_prices = first_market.get('outcomePrices')
```

**5. Construir estructura resultado**
```python
results.append({
    'id': event.get('id'),
    'title': title,
    'tags': tags,
    'active': active,
    'markets_count': markets_count,
    'first_market': {
        'outcomes': outcomes,
        'outcomePrices': outcome_prices,
        'market': first_market
    },
    'raw_event': event
})
```

**6. Imprimir para feedback**
```python
print(f"Title: {title}")
print(f"Tags: {tags}")
print(f"Active: {active}")
print(f"Number of markets: {markets_count}")
print(f"Outcomes : {outcomes}")
print(f"Outcome Prices: {outcome_prices}")
print("-" * 50)
```

**7. Guardar a archivo**
```python
out_path = os.path.join(os.path.dirname(__file__), "results.json")
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
```

---

## 🔄 Flujo de Ejecución

```
┌─────────────────────────────────────┐
│  API Polymarket                     │
│  /events?closed=false               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  GET Request → response.json()       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Filtrar por tags:                  │
│  ['geopolitics', 'politics']         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Para cada evento filtrado:          │
│  - Extraer titulo, tags, mercados    │
│  - Obtener primer mercado            │
│  - Construir estructura resultado    │
│  - Imprimir datos                    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Guardar array en results.json       │
│  con json.dump() (indentado)         │
└─────────────────────────────────────┘
```

---

## 📝 Ejemplos

### Ejemplo 1: Evento Simple

**Input (API Response):**
```json
{
  "id": "16263",
  "title": "Macron out by...?",
  "tags": [
    {"label": "France", "slug": "france"},
    {"label": "Politics", "slug": "politics"}
  ],
  "active": true,
  "markets": [
    {
      "id": "517231",
      "question": "Macron out in 2025?",
      "outcomes": ["Yes", "No"],
      "outcomePrices": ["0", "1"],
      "volume": "1386219.767204",
      ...
    }
  ]
}
```

**Output (results.json):**
```json
{
  "id": "16263",
  "title": "Macron out by...?",
  "tags": ["France", "Politics"],
  "active": true,
  "markets_count": 1,
  "first_market": {
    "outcomes": ["Yes", "No"],
    "outcomePrices": ["0", "1"],
    "market": {
      "id": "517231",
      "question": "Macron out in 2025?",
      ...
    }
  },
  "raw_event": { ... datos completos ... }
}
```

### Ejemplo 2: Extracción de Información

```python
# Leer el archivo generado
with open('results.json', 'r') as f:
    events = json.load(f)

# Acceder a un evento
event = events[0]
print(f"Evento: {event['title']}")
print(f"Tags: {', '.join(event['tags'])}")
print(f"Activo: {event['active']}")
print(f"Mercados: {event['markets_count']}")

# Acceder al primer mercado
first_market = event['first_market']['market']
print(f"Pregunta: {first_market['question']}")
print(f"Resultados posibles: {first_market['outcomes']}")
print(f"Precios: {first_market['outcomePrices']}")
```

---

## 🔗 API Utilizada

### Endpoint Principal
```
GET https://gamma-api.polymarket.com/events?closed=false
```

### Request
- **Método**: GET
- **URL**: `https://gamma-api.polymarket.com/events`
- **Parámetro**: `closed=false` (solo eventos abiertos/activos)
- **Headers**: Ninguno especial requerido

### Response
- **Formato**: JSON array
- **Contenido**: Lista de eventos de trading
- **Límites**: No especificados en documentación

### Estructura de Evento (API Response)
Cada evento contiene:
- Metadatos: `id`, `title`, `slug`, `description`
- Tags: Array de objetos con `label` y `slug`
- Mercados: Array de objetos con detalles de trading
- Métricas: `volume`, `liquidity`, `active`, `closed`, etc.
- Timestamps: `startDate`, `endDate`, `createdAt`, `updatedAt`

---

## 📌 Notas Importantes

1. **Filtro Actual**: Solo filtra eventos con tags 'geopolitics' o 'politics'
   - Para agregar más tags, edita: `geopolitical_tags = ['geopolitics', 'politics']`

2. **Eventos Abiertos**: Solo extrae eventos no cerrados (`closed=false`)
   - Para incluir cerrados, cambiar URL a: `url + "?closed=true"`

3. **Mercados Múltiples**: Cada evento puede tener múltiples mercados
   - `first_market` solo captura el primero
   - Todos están en `raw_event.markets[]`

4. **Precios**: Representa probabilidades implícitas del mercado
   - Rango: 0 a 1
   - Ejemplo: 0.976 ≈ 97.6% de probabilidad

5. **Liquidez y Volumen**: Métricas clave para calidad del mercado
   - Mayor liquidez = mejor para trades grandes
   - Mayor volumen = más actividad

---

## 🚀 Uso del Script

```bash
# Ejecutar desde el directorio del proyecto
python geopolitical.py

# Salida esperada:
# Title: Macron out by...?
# Tags: ['France', 'Politics', ...]
# Active: True
# Number of markets: 3
# Outcomes: ['Yes', 'No']
# Outcome Prices: ['0.015', '0.985']
# --------------------------------------------------
# ... (más eventos)
# Saved 45 events to /path/to/results.json
```

---

## 📂 Estructura del Proyecto

```
Even_Extraction/
├── geopolitical.py              # Script principal de extracción
├── hello.py                     # Script auxiliar (hello world)
├── results.json                 # Output: eventos extraídos
├── pyproject.toml               # Configuración del proyecto
├── README.md                    # Documentación básica
├── DOCUMENTATION.md             # Este archivo
├── .venv/                       # Virtual environment
└── polymarket-dashboard/        # Dashboard Next.js
    ├── src/
    │   ├── app/
    │   │   ├── api/             # Rutas API
    │   │   └── pages/           # Páginas del dashboard
    │   └── components/          # Componentes React
    └── package.json
```

---

## 🔄 Relación con el Dashboard

El archivo `results.json` se utiliza en el **polymarket-dashboard** (Next.js):

- Las rutas API en `src/app/api/` leen datos de `results.json`
- Los componentes React en `src/components/` visualizan los datos
- Los datos se filtran y procesan según los tags seleccionados

**Rutas API asociadas:**
- `/api/geopolitical-events` - Retorna eventos geopolíticos
- `/api/available-tags` - Retorna tags disponibles
- `/api/check-dates` - Verifica fechas de eventos
- `/api/debug-events` - Debug de eventos

---

## 📚 Referencias

- **API Polymarket**: https://gamma-api.polymarket.com/
- **Polymarket**: https://polymarket.com/
- **Documentación Event Structure**: Check Polymarket docs

---

**Última actualización**: Febrero 11, 2026
**Versión**: 1.0
