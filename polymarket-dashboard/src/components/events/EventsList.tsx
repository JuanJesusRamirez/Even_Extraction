'use client';

import React, { useState, useEffect } from 'react';
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
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
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

// Transform backend event into EventCard-compatible format
function transformEvent(event: BackendEvent) {
  // Parse markets into outcomePrices
  const outcomePrices = event.markets?.map((market) => {
    const title = market.groupItemTitle || market.question || 'Unknown';
    const prices = JSON.parse(market.outcomePrices || '[]');
    const yesPrice = parseFloat(prices[0] || '0');
    return {
      outcome: title,
      price: yesPrice,
    };
  }) || [];

  // Parse markets into scenarios
  const scenarios = event.markets?.map((market) => ({
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
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Array<{ label: string; slug: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const apiUrl = API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/events`);

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const result = await response.json();
        const data: BackendEvent[] = result.data || [];
        
        setEvents(data);
        
        // Extract all unique tags from events
        const tagSet = new Map<string, string>();
        data.forEach((event) => {
          event.tags?.forEach((tag) => {
            tagSet.set(tag.slug, tag.label);
          });
        });
        setAllTags(Array.from(tagSet, ([slug, label]) => ({ slug, label })));
        setError(null);
        setLastUpdate(Date.now());
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
        setEvents([]);
        setLastUpdate(Date.now());
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTagChange = (tagSlug: string, selected: boolean) => {
    if (tagSlug === '' && !selected) {
      setSelectedTags([]);
    } else if (selected) {
      setSelectedTags([...selectedTags, tagSlug]);
    } else {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagSlug));
    }
  };

  // Filter events based on selected tags
  const filteredEvents = selectedTags.length === 0 
    ? events 
    : events.filter((event) =>
        event.tags.some((tag) => selectedTags.includes(tag.slug))
      );

  return (
    <div className="space-y-6">
      {/* Event Tag Filter */}
      {allTags.length > 0 && (
        <TagFilter
          availableTags={allTags}
          selectedTags={selectedTags}
          onTagChange={handleTagChange}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Events Count */}
      {!loading && !error && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-blue-900">
                📊 {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </p>
              {selectedTags.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">↳ Filtered from {events.length} total</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Updated {new Date(lastUpdate).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!loading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} {...transformEvent(event)} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEvents.length === 0 && events.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No events match your filter criteria
          </p>
        </div>
      )}

      {/* No Events State */}
      {!loading && events.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No events found. Make sure the backend is running on {API_BASE_URL}
          </p>
        </div>
      )}
    </div>
  );
}
