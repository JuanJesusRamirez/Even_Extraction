'use client';

import React, { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import TagFilter from '@/components/TagFilter';
import TagInput from '@/components/TagInput';

interface OutcomePrice {
  outcome: string;
  price: number;
}

interface Scenario {
  question: string;
  endDate: string;
  volume: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  tags: Array<{ label: string; slug: string }>;
  active: boolean;
  outcomes: string[];
  outcomePrices: OutcomePrice[];
  startDate: string;
  endDate: string;
  volume: number;
  liquidity: number;
  commentCount: number;
  image?: string;
  scenarios: Scenario[];
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Array<{ label: string; slug: string }>>([]);
  const [queryTags, setQueryTags] = useState<string[]>(['geopolitics', 'politics', 'world']);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setSelectedTags([]); // Reset filter tags when search tags change
        const tagsQuery = queryTags.length > 0 ? `?tags=${queryTags.join(',')}` : '';
        console.log('Fetching with tags:', queryTags, 'URL:', `/api/geopolitical-events${tagsQuery}`);
        const response = await fetch(`/api/geopolitical-events${tagsQuery}`);

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        console.log('Received events:', data.length, data);
        
        // Add a small delay to ensure loading state is visible
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setEvents(data);
        
        // Extract all unique tags from events
        const tagSet = new Map<string, string>();
        data.forEach((event: Event) => {
          event.tags?.forEach((tag) => {
            tagSet.set(tag.slug, tag.label);
          });
        });
        setAllTags(Array.from(tagSet, ([slug, label]) => ({ slug, label })));
        setError(null);
        setLastUpdate(Date.now()); // Update timestamp
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
  }, [queryTags]);

  const handleTagChange = (tagSlug: string, selected: boolean) => {
    if (tagSlug === '' && !selected) {
      // Clear all filters
      setSelectedTags([]);
    } else if (selected) {
      setSelectedTags([...selectedTags, tagSlug]);
    } else {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagSlug));
    }
  };

  // Filter events based on selected tags from the filter dropdown
  const filteredEvents = selectedTags.length === 0 
    ? events 
    : events.filter((event) =>
        event.tags.some((tag) => selectedTags.includes(tag.slug))
      );

  return (
    <div className="space-y-6">
      {/* Custom Tag Input for Polymarket Queries */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Search Tags</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter custom tags to search Polymarket for specific events
        </p>
        <TagInput
          tags={queryTags}
          onTagsChange={setQueryTags}
          placeholder="Enter tags to search (e.g., election, inflation, crypto)"
        />
      </div>

      {/* Event Tag Filter */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Filter Results by Tags</h2>
          <TagFilter
            availableTags={allTags}
            selectedTags={selectedTags}
            onTagChange={handleTagChange}
          />
        </div>
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
      {!loading && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-blue-900">
                📊 {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </p>
              {selectedTags.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">↳ Filtered from {events.length} total</p>
              )}
              {queryTags.length === 0 && (
                <p className="text-xs text-gray-600 mt-1">Using default tags: geopolitics, politics, world</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Search tags: <span className="font-semibold">{queryTags.length > 0 ? queryTags.join(', ') : 'none'}</span></p>
              <p className="text-xs text-gray-400 mt-1">Updated {new Date(lastUpdate).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!loading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} {...event} />
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
            No geopolitical events found for the selected tags
          </p>
        </div>
      )}
    </div>
  );
}
