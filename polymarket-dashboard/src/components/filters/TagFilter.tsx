'use client';

import React from 'react';

interface TagFilterProps {
  availableTags: Array<{ label: string; slug: string }>;
  selectedTags: string[];
  onTagChange: (tagSlug: string, selected: boolean) => void;
}

export default function TagFilter({
  availableTags,
  selectedTags,
  onTagChange,
}: TagFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Filter by Tags</h2>
      <div className="flex flex-wrap gap-3">
        {availableTags.map((tag) => (
          <button
            key={tag.slug}
            onClick={() =>
              onTagChange(tag.slug, !selectedTags.includes(tag.slug))
            }
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedTags.includes(tag.slug)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <button
          onClick={() => onTagChange('', false)}
          className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
