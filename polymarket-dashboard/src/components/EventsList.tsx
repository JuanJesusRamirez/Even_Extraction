'use client';

import React, { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import TagFilter from '@/components/TagFilter';

interface OutcomePrice {
  outcome: string;
  price: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  tags: Array<{ label: string; slug: string }>;
  active: boolean;
  outcomes: string[];
  outcomePrices: OutcomePrice[];
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Array<{ label: string; slug: string }>>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/geopolitical-events');

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
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
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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

  // Filter events based on selected tags
  const filteredEvents = selectedTags.length === 0 
    ? events 
    : events.filter((event) =>
        event.tags.some((tag) => selectedTags.includes(tag.slug))
      );

  return (
    <div className="w-full">
      {!loading && (
        <TagFilter
          availableTags={allTags}
          selectedTags={selectedTags}
          onTagChange={handleTagChange}
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600">Loading geopolitical events...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error loading events</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && filteredEvents.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <p>No events found matching the selected tags</p>
        </div>
      )}

      {!loading && filteredEvents.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            {selectedTags.length > 0 && ` matching the selected tags`}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
