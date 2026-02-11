from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import httpx
from pathlib import Path
from urllib.parse import urlencode
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Polymarket API",
    description="Geopolitical Events Extraction API",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data loading
DATA_DIR = Path(__file__).parent.parent / "backend" / "data"
EVENTS_FILE = DATA_DIR / "backend_results.json"

def load_events():
    """Load events from JSON file"""
    try:
        with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('events', [])
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

# Cache events on startup
_events_cache = None

def get_cached_events():
    """Get cached events"""
    global _events_cache
    if _events_cache is None:
        _events_cache = load_events()
    return _events_cache

@app.on_event("startup")
async def startup_event():
    """Load events on startup"""
    get_cached_events()

@app.get("/")
async def root():
    """Root endpoint"""
    events = get_cached_events()
    return {
        "message": "Polymarket API",
        "version": "0.2.0",
        "docs": "/docs",
        "events_count": len(events)
    }

@app.get("/api/events")
async def get_all_events(tag: str = None, skip: int = 0, limit: int = 100):
    """
    Get all events, optionally filtered by tag
    
    Query parameters:
    - tag: Filter events by tag slug (optional)
    - skip: Number of events to skip (default: 0)
    - limit: Maximum number of events to return (default: 100)
    """
    events = get_cached_events()
    
    # Filter by tag if provided
    if tag:
        filtered_events = []
        for event in events:
            event_tags = [t.get('slug', '') for t in event.get('tags', [])]
            if tag in event_tags:
                filtered_events.append(event)
        events = filtered_events
    
    # Pagination
    total = len(events)
    paginated_events = events[skip:skip + limit]
    
    return {
        "success": True,
        "data": paginated_events,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.get("/api/events/{event_id}")
async def get_event_by_id(event_id: str):
    """Get a specific event by ID"""
    events = get_cached_events()
    
    for event in events:
        if event.get('id') == event_id:
            return {
                "success": True,
                "data": event
            }
    
    raise HTTPException(status_code=404, detail=f"Event {event_id} not found")

@app.get("/api/tags")
async def get_all_tags():
    """Get all available tags across events"""
    events = get_cached_events()
    tags_dict = {}
    
    for event in events:
        for tag in event.get('tags', []):
            slug = tag.get('slug', '')
            label = tag.get('label', '')
            if slug:
                tags_dict[slug] = label
    
    return {
        "success": True,
        "tags": sorted(list(tags_dict.keys())),
        "data": sorted(list(tags_dict.keys()))
    }

POLYMARKET_API = "https://gamma-api.polymarket.com/public-search"

@app.get("/api/search")
async def search_polymarket(q: str, tags: str = None):
    """
    Search Polymarket's public API in real-time.
    
    Query parameters:
    - q: Search query (required). E.g. "elección de colombia"
    - tags: Comma-separated tag slugs to filter by (optional). E.g. "politics,elections"
    """
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    
    params: dict = {
        "search_tags": "true",
        "q": q.strip(),
    }
    
    if tags:
        params["events_tag"] = tags.strip()
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(POLYMARKET_API, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Polymarket API timed out")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Polymarket API error: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")
    
    events = data if isinstance(data, list) else data.get("events", [])
    
    return {
        "success": True,
        "data": events,
        "total": len(events),
        "query": q.strip(),
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    events = get_cached_events()
    return {
        "status": "healthy",
        "events_loaded": len(events) > 0,
        "events_count": len(events)
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
