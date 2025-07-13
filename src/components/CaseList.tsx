'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { useTextSearch } from '@/hooks/useTextSearch';
import { useCaseProcessing } from '@/hooks/useCaseProcessing';
import SelectJurisdiction from './SelectJurisdiction';
import FilterPanel from './FilterPanel';
import CaseTable from './CaseTable';
import CaseListHeader from './CaseListHeader';
import { Case } from '@/types/case';

function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <svg
        className="animate-spin h-8 w-8 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  );
}

export default function CaseList() {
  const router = useRouter();

  // State for jurisdiction-specific cases
  const [jurisdictionCases, setJurisdictionCases] = useState<Case[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [isLoadingJurisdictionCases, setIsLoadingJurisdictionCases] =
    useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Custom hook for search logic
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchError,
    searchResultCases,
    hasNoResults,
    isSearchActive,
    resetSearch,
  } = useTextSearch();

  // Determine the primary data source
  const sourceData = isSearchActive ? searchResultCases : jurisdictionCases;

  // Custom hook for filtering and sorting logic
  const {
    processedCases,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    sortField,
    sortDirection,
    handleSort,
  } = useCaseProcessing(sourceData);

  // Show loading spinner only when loading jurisdiction cases, not during search
  // Search has its own loading indicator in the input field
  const isLoading = isLoadingJurisdictionCases;

  // Clear other data sources when one becomes active
  useEffect(() => {
    if (isSearchActive) {
      setSelectedJurisdiction('');
      setJurisdictionCases([]);
      clearFilters();
    }
  }, [isSearchActive, clearFilters]);

  const handleJurisdictionChange = useCallback(
    (jurisdiction: string) => {
      resetSearch();
      clearFilters();
      setSelectedJurisdiction(jurisdiction);
      setIsLoadingJurisdictionCases(true);
    },
    [resetSearch, clearFilters]
  );

  const handleClearJurisdictionSelect = useCallback(() => {
    resetSearch();
    clearFilters();
    setSelectedJurisdiction('');
    setJurisdictionCases([]);
    setIsLoadingJurisdictionCases(false);
  }, [resetSearch, clearFilters]);

  const handleCasesLoaded = (loadedCases: Case[]) => {
    setJurisdictionCases(loadedCases);
    setIsLoadingJurisdictionCases(false);
  };

  const handleRowClick = (caseId: string) => {
    router.push(`/case/${caseId}`);
  };

  const courts = useMemo<string[]>(() => {
    if (!processedCases || processedCases.length === 0) return [];
    const unique = new Set<string>();
    processedCases.forEach((caseItem: Case) => {
      if (caseItem.court?.name) {
        unique.add(caseItem.court.name);
      }
    });
    return Array.from(unique).sort();
  }, [processedCases]);

  const years = useMemo<number[]>(() => {
    if (!processedCases || processedCases.length === 0) return [];
    const unique = new Set<number>();
    processedCases.forEach((caseItem: Case) => {
      if (caseItem.decision_date) {
        const year = new Date(caseItem.decision_date).getFullYear();
        unique.add(year);
      }
    });
    return Array.from(unique).sort((a, b) => b - a);
  }, [processedCases]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div>
      {/* Header */}
      <CaseListHeader caseCount={processedCases.length} />

      {/* Jurisdiction Filter */}
      <SelectJurisdiction
        selectedJurisdiction={selectedJurisdiction}
        onJurisdictionChange={handleJurisdictionChange}
        onClearSelect={handleClearJurisdictionSelect}
        onCasesLoaded={handleCasesLoaded}
        isLoading={isLoadingJurisdictionCases}
      />

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search all cases by name, abbreviation, or docket number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isSearching
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    showFilters || hasActiveFilters
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4 inline mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {Object.values(filters).filter((v) => v !== '').length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {showFilters && (
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                updateFilter={updateFilter}
                courts={courts}
                years={years}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </form>
        </div>

        {/* Main Content */}
        {searchError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              Search error: {searchError.message}
            </p>
          </div>
        )}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Spinner />
            <p className="text-gray-600 mt-4">
              Loading cases for {selectedJurisdiction}...
            </p>
          </div>
        ) : processedCases && processedCases.length > 0 ? (
          <CaseTable
            cases={processedCases}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={handleRowClick}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No cases found
            </h3>
            <p className="text-gray-600">
              {isSearchActive && hasNoResults
                ? 'Your search returned no results. Try a different query.'
                : hasActiveFilters
                ? 'No cases match your filter criteria. Try adjusting them.'
                : 'Select a jurisdiction to browse cases or use the search bar for a global search.'}
            </p>
            {searchError && (
              <p className="text-red-600 mt-2 text-sm">
                Search error: {searchError.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
