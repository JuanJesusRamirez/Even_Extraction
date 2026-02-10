'use client';

import React from 'react';

interface OutcomePrice {
  outcome: string;
  price: number;
}

interface Market {
  id: string;
  outcomes: string[];
  outcomePrices: OutcomePrice[];
}

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  tags: Array<{ label: string; slug: string }>;
  active: boolean;
  outcomes: string[];
  outcomePrices: OutcomePrice[];
}

export default function EventCard({
  id,
  title,
  description,
  tags,
  active,
  outcomes,
  outcomePrices,
}: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex-1">{title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
          >
            {tag.label}
          </span>
        ))}
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Outcomes and Prices */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-700 mb-3">Outcomes & Prices</h4>
        <div className="space-y-2">
          {outcomePrices && Array.isArray(outcomePrices) && outcomePrices.length > 0 ? (
            outcomePrices.map((item: OutcomePrice, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="text-gray-700 text-sm truncate">
                  {item.outcome || `Outcome ${idx + 1}`}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, (item.price || 0) * 100))}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-blue-600 font-semibold text-sm w-12 text-right">
                    {((item.price || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No price data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
