'use client';

import React, { useState, useEffect } from 'react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

interface AvailableTag {
  slug: string;
  count: number;
}

export default function TagInput({ tags, onTagsChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<AvailableTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/available-tags');
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags);
        }
      } catch (error) {
        console.error('Failed to fetch available tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      const newTags = [...tags, cleanTag];
      onTagsChange(newTags);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    onTagsChange(newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const filteredSuggestions = availableTags.filter(
    (tag) =>
      tag.slug.includes(inputValue.toLowerCase()) &&
      !tags.includes(tag.slug) &&
      inputValue.trim().length > 0
  );

  return (
    <div>
      <div className="flex gap-2 mb-4 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder || "Search tags..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && inputValue.trim().length > 0 && !loading && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.slice(0, 10).map((tag) => (
                  <button
                    key={tag.slug}
                    onClick={() => handleAddTag(tag.slug)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-100 transition-colors border-b last:border-b-0 flex justify-between items-center"
                  >
                    <span className="font-medium text-gray-900">{tag.slug}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {tag.count}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">No matching tags found</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => handleAddTag(inputValue)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <div
            key={tag}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
          >
            <span>{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-blue-600 hover:text-blue-900 font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-gray-500 text-sm italic">No tags selected. Default tags will be used (geopolitics, politics, world)</p>
      )}

      {/* Quick access popular tags */}
      {!loading && availableTags.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">
              📌 Popular tags ({availableTags.length} available)
            </p>
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAllTags ? 'Show less' : 'Show all'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(showAllTags ? availableTags : availableTags.slice(0, 15)).map((tag) => (
              <button
                key={tag.slug}
                onClick={() => handleAddTag(tag.slug)}
                disabled={tags.includes(tag.slug)}
                title={`${tag.count} events`}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  tags.includes(tag.slug)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed line-through'
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-700 hover:from-blue-200 hover:to-indigo-200 border border-blue-200 hover:border-blue-400'
                }`}
              >
                {tag.slug}
                <span className="ml-1 text-gray-500">({tag.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
