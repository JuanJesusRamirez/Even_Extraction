'use client';

import React from 'react';

interface OutcomePrice {
  outcome: string;
  price: number;
}

interface Scenario {
  question: string;
  endDate: string;
  volume: number;
  groupItemTitle: string;
  outcomes: Array<{
    name: string;
    price: number;
  }>;
}

interface EventCardProps {
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatNumber(num: number | string | undefined | null): string {
  const n = Number(num);
  if (!Number.isFinite(n)) return '0';
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K';
  }
  return n.toFixed(2);
}

export default function EventCard({
  id,
  title,
  description,
  tags,
  active,
  outcomes,
  outcomePrices,
  startDate,
  endDate,
  volume,
  liquidity,
  commentCount,
  image,
  scenarios,
}: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {image && (
        <div className="relative h-40 bg-gray-200 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">{title}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {active ? 'Activo' : 'Inactivo'}
          </span>
        </div>

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

        {description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-gray-600 text-xs font-semibold">Lanzamiento</p>
            <p className="text-gray-900 font-medium">{formatDate(startDate)}</p>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <p className="text-gray-600 text-xs font-semibold">Cierre</p>
            <p className="text-gray-900 font-medium">{formatDate(endDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div className="bg-gray-50 p-2 rounded text-center">
            <p className="text-gray-600 text-xs">Volumen</p>
            <p className="font-semibold text-gray-900">${formatNumber(volume)}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded text-center">
            <p className="text-gray-600 text-xs">Liquidez</p>
            <p className="font-semibold text-gray-900">${formatNumber(liquidity)}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded text-center">
            <p className="text-gray-600 text-xs">Comentarios</p>
            <p className="font-semibold text-gray-900">{commentCount}</p>
          </div>
        </div>

        {scenarios && scenarios.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-gray-700 mb-3">Escenarios ({scenarios.length})</h4>
            <div className="space-y-3">
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{scenario.question}</p>
                  <h5 className="text-gray-900 font-semibold text-sm mb-3">{scenario.groupItemTitle}</h5>
                  <div className="space-y-2">
                    {scenario.outcomes.map((outcome, outIdx) => {
                      const pct = Math.max(0, Math.min(100, (outcome.price || 0) * 100));
                      const barColor = pct >= 60 ? 'bg-green-500' : pct >= 30 ? 'bg-yellow-500' : 'bg-red-400';
                      return (
                        <div key={outIdx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-700 text-sm">{outcome.name}</span>
                            <span className={`font-bold text-sm ${
                              pct >= 60 ? 'text-green-600' : pct >= 30 ? 'text-yellow-600' : 'text-red-500'
                            }`}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${barColor} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                    <p>Cierre: {formatDate(scenario.endDate)}</p>
                    <p>Vol: ${formatNumber(scenario.volume)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!scenarios || scenarios.length === 0) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-gray-700 mb-3">Probabilidades</h4>
            <div className="space-y-2">
              {outcomePrices && Array.isArray(outcomePrices) && outcomePrices.length > 0 ? (
                outcomePrices.map((item: OutcomePrice, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-gray-700 text-sm truncate">{item.outcome || `Outcome ${idx + 1}`}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, (item.price || 0) * 100))}%` }}></div>
                      </div>
                      <span className="text-blue-600 font-semibold text-sm w-12 text-right">{((item.price || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay datos disponibles</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
