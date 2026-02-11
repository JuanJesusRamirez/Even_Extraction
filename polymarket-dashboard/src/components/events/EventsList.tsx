'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import EventCard from '@/components/events/EventCard';
import TagFilter from '@/components/filters/TagFilter';
import { API_BASE_URL } from '@/constants/config';

interface Market {
  id: string;
  question: string;
  endDate: string;
  volume: string;
  outcomePrices: string;
  outcomes: string;
  groupItemTitle?: string;
  active: boolean;
  closed: boolean;
  [key: string]: any;
}

interface BackendEvent {
  id: string;
  title: string;
  description: string;
  tags: Array<{ label: string; slug: string }>;
  active: boolean;
  closed: boolean;
  startDate: string;
  endDate: string;
  volume: number;
  liquidity: number;
  commentCount: number;
  image?: string;
  markets: Market[];
  [key: string]: any;
}

function transformEvent(event: BackendEvent) {
  const outcomePrices =
    event.markets?.map((market) => {
      const title = market.groupItemTitle || market.question || 'Unknown';
      const prices = JSON.parse(market.outcomePrices || '[]');
      const yesPrice = parseFloat(prices[0] || '0');
      return { outcome: title, price: yesPrice };
    }) || [];

  const scenarios =
    event.markets?.map((market) => ({
      question: market.question,
      endDate: market.endDate,
      volume: parseFloat(market.volume || '0'),
    })) || [];

  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    tags: event.tags || [],
    active: event.active,
    outcomes: outcomePrices.map((o) => o.outcome),
    outcomePrices,
    startDate: event.startDate || '',
    endDate: event.endDate || '',
    volume: Number(event.volume) || 0,
    liquidity: Number(event.liquidity) || 0,
    commentCount: Number(event.commentCount) || 0,
    image: event.image,
    scenarios,
  };
}

export default function EventsList() {
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Array<{ label: string; slug: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = API_BASE_URL || 'http://localhost:8000';

  const extractTags = (data: BackendEvent[]) => {
    const tagSet = new Map<string, string>();
    data.forEach((event) => {
      event.tags?.forEach((tag) => tagSet.set(tag.slug, tag.label));
    });
    setAllTags(Array.from(tagSet, ([slug, label]) => ({ slug, label })));
  };

  // Load saved events from backend (default view)
  const fetchSavedEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiUrl}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const result = await response.json();
      const data: BackendEvent[] = result.data || [];
      setEvents(data);
      extractTags(data);
      setActiveQuery(null);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Live search on Polymarket API via backend
  const searchPolymarket = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        fetchSavedEvents();
        return;
      }

      try {
        setSearching(true);
        setError(null);
        const params = new URLSearchParams({ q: query.trim() });
        const response = await fetch(`${apiUrl}/api/search?${params}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Search failed (${response.status})`);
        }
        const result = await response.json();
        const data: BackendEvent[] = result.data || [];
        setEvents(data);
        extractTags(data);
        setActiveQuery(query.trim());
        setSelectedTags([]);
        setLastUpdate(Date.now());
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setEvents([]);
      } finally {
        setSearching(false);
      }
    },
    [apiUrl, fetchSavedEvents]
  );

  // Load saved events on mount
  useEffect(() => {
    fetchSavedEvents();
  }, [fetchSavedEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPolymarket(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery(null);
    fetchSavedEvents();
    searchInputRef.current?.focus();
  };

  const handleTagChange = (tagSlug: string, selected: boolean) => {
    if (tagSlug === '' && !selected) {
      setSelectedTags([]);
    } else if (selected) {
      setSelectedTags([...selectedTags, tagSlug]);
    } else {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagSlug));
    }
  };

  const filteredEvents =
    selectedTags.length === 0
      ? events
      : events.filter((event) =>
          event.tags?.some((tag) => selectedTags.includes(tag.slug))
        );

  const isLoading = loading || searching;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en Polymarket... ej: elección de colombia, bitcoin, trump"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {searching ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Buscando...
              </span>
            ) : (
              'Buscar'
            )}
          </button>
        </form>

        {/* Active search indicator */}
        {activeQuery && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Resultados para: <strong className="text-indigo-700">&quot;{activeQuery}&quot;</strong>
            </span>
            <button
              onClick={handleClearSearch}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Limpiar y volver a eventos guardados
            </button>
          </div>
        )}
      </div>

      {/* Event Tag Filter */}
      {allTags.length > 0 && (
        <TagFilter
          availableTags={allTags}
          selectedTags={selectedTags}
          onTagChange={handleTagChange}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">
              {searching ? `Buscando "${searchQuery}" en Polymarket...` : 'Cargando eventos...'}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Events Count */}
      {!isLoading && !error && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-blue-900">
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}{' '}
                encontrado{filteredEvents.length !== 1 ? 's' : ''}
              </p>
              {selectedTags.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">Filtrado de {events.length} total</p>
              )}
              {activeQuery && (
                <p className="text-xs text-indigo-600 mt-1">Resultados en vivo de Polymarket</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{new Date(lastUpdate).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} {...transformEvent(event)} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEvents.length === 0 && events.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay eventos que coincidan con los filtros</p>
        </div>
      )}

      {/* No Events State */}
      {!isLoading && events.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {activeQuery
              ? `No se encontraron eventos para "${activeQuery}"`
              : `No hay eventos. Asegúrate que el backend esté corriendo en ${apiUrl}`}
          </p>
        </div>
      )}
    </div>
  );
}
