'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { fetchEvents } from '@/lib/api';

export function useEvents(tag?: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEvents(tag);
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
    const interval = setInterval(getEvents, 30000);
    return () => clearInterval(interval);
  }, [tag]);

  return { events, loading, error };
}
