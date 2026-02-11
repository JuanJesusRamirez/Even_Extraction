'use client';

import { useState, useEffect } from 'react';
import { fetchAvailableTags } from '@/lib/api';

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAvailableTags();
        setTags(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching tags');
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    getTags();
  }, []);

  return { tags, loading, error };
}
