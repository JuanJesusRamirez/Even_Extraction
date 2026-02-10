'use client';

import React, { useEffect, useState } from 'react';

interface Tag {
  slug: string;
  count: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/available-tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data = await response.json();
        setTags(data.tags);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Polymarket Tags</h1>
        <p className="text-gray-600 mb-6">Todos los tags disponibles en Polymarket (ordenados por frecuencia)</p>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading tags...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {!loading && tags.length > 0 && (
          <div>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-blue-900 font-semibold">Total de tags únicos: {tags.length}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tags.map((tag) => (
                <div
                  key={tag.slug}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
                >
                  <p className="font-semibold text-gray-900 break-all">{tag.slug}</p>
                  <p className="text-sm text-gray-600 mt-1">📊 {tag.count} events</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && tags.length === 0 && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">No tags found</p>
          </div>
        )}
      </div>
    </div>
  );
}
