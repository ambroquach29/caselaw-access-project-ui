'use client';

import React from 'react';
import { X } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    court: string;
    status: string;
    year: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      court: string;
      status: string;
      year: string;
    }>
  >;
  updateFilter?: (key: 'court' | 'status' | 'year', value: string) => void;
  courts: string[];
  years: number[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterPanel({
  filters,
  setFilters,
  updateFilter,
  courts,
  years,
  onClearFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  return (
    <div className="border-t pt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Court Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Court
          </label>
          <select
            value={filters.court}
            onChange={(e) =>
              updateFilter
                ? updateFilter('court', e.target.value)
                : setFilters((prev) => ({
                    ...prev,
                    court: e.target.value,
                  }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500 bg-white"
          >
            <option value="">All Courts</option>
            {courts.map((court) => (
              <option key={court} value={court}>
                {court}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              updateFilter
                ? updateFilter('status', e.target.value)
                : setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500 bg-white"
          >
            <option value="">All Cases</option>
            <option value="recent">Recent (Last 5 Years)</option>
            <option value="older">Older Cases</option>
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={filters.year}
            onChange={(e) =>
              updateFilter
                ? updateFilter('year', e.target.value)
                : setFilters((prev) => ({
                    ...prev,
                    year: e.target.value,
                  }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500 bg-white"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
