'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { useTextSearch } from '@/hooks/useTextSearch';
import { useCaseProcessing } from '@/hooks/useCaseProcessing';
import { usePagination } from '@/hooks/usePagination';
import SelectJurisdiction from './SelectJurisdiction';
import FilterPanel from './FilterPanel';
import CaseTable from './CaseTable';
import CaseListHeader from './CaseListHeader';
import { Pagination } from './Pagination';
import { Case, CaseConnection } from '@/types/case';

export default function CaseList() {
  const router = useRouter();

  // State for jurisdiction-specific cases
  const [jurisdictionCases, setJurisdictionCases] = useState<Case[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [isLoadingJurisdictionCases, setIsLoadingJurisdictionCases] =
    useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination hook for jurisdiction cases
  const {
    paginationArgs,
    hasNextPage,
    hasPreviousPage,
    totalCount,
    currentPageStart,
    currentPageEnd,
    loadNextPage,
    loadPreviousPage,
    resetPagination,
    updatePaginationFromResult,
  } = usePagination(50);

  // Custom hook for search logic
  const {
    searchQuery,
    setSearchQuery,
    isActuallySearching,
    searchError,
    searchResultCases,
    hasNoResults,
    isSearchActive,
    resetSearch,
    searchHasNextPage,
    searchHasPreviousPage,
    searchTotalCount,
    searchCurrentPageStart,
    searchCurrentPageEnd,
    loadNextSearchPage,
    loadPreviousSearchPage,
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

  // Consolidated loading state
  const isLoading =
    isLoadingJurisdictionCases || (isSearchActive && isActuallySearching);

  // Clear other data sources when one becomes active
  useEffect(() => {
    if (isSearchActive) {
      setSelectedJurisdiction('');
      setJurisdictionCases([]);
      clearFilters();
      resetPagination();
    }
  }, [isSearchActive, clearFilters, resetPagination]);

  const handleJurisdictionChange = useCallback(
    (jurisdiction: string) => {
      resetSearch();
      clearFilters();
      resetPagination();
      setSelectedJurisdiction(jurisdiction);
      setIsLoadingJurisdictionCases(true);
    },
    [resetSearch, clearFilters, resetPagination]
  );

  const handleClearJurisdictionSelect = useCallback(() => {
    resetSearch();
    clearFilters();
    resetPagination();
    setSelectedJurisdiction('');
    setJurisdictionCases([]);
    setIsLoadingJurisdictionCases(false);
  }, [resetSearch, clearFilters, resetPagination]);

  const handleCasesLoaded = (loadedCases: Case[]) => {
    setJurisdictionCases(loadedCases);
    setIsLoadingJurisdictionCases(false);
  };

  const handlePaginationDataLoaded = (paginationData: CaseConnection) => {
    updatePaginationFromResult(paginationData);
  };

  const handleRowClick = (caseId: string) => {
    router.push(`/case/${caseId}`);
  };

  // Memoized filter options to prevent unnecessary recalculations
  const { courts, years } = useMemo(() => {
    if (!sourceData || sourceData.length === 0) {
      return { courts: [], years: [] };
    }

    const courtSet = new Set<string>();
    const yearSet = new Set<number>();

    sourceData.forEach((caseItem: Case) => {
      if (caseItem.court?.name) {
        courtSet.add(caseItem.court.name);
      }
      if (caseItem.decision_date) {
        const year = new Date(caseItem.decision_date).getFullYear();
        yearSet.add(year);
      }
    });

    return {
      courts: Array.from(courtSet).sort(),
      years: Array.from(yearSet).sort((a, b) => b - a),
    };
  }, [sourceData]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');
  const shouldShowPagination =
    ((selectedJurisdiction && !isSearchActive) || isSearchActive) &&
    !hasActiveFilters;

  return (
    <div>
      {/* Header */}
      <CaseListHeader
        caseCount={processedCases.length}
        totalCount={isSearchActive ? searchTotalCount : totalCount}
        isSearchActive={isSearchActive}
        selectedJurisdiction={selectedJurisdiction}
      />

      {/* Jurisdiction Filter */}
      <SelectJurisdiction
        selectedJurisdiction={selectedJurisdiction}
        onJurisdictionChange={handleJurisdictionChange}
        onClearSelect={handleClearJurisdictionSelect}
        onCasesLoaded={handleCasesLoaded}
        onPaginationDataLoaded={handlePaginationDataLoaded}
        paginationArgs={paginationArgs}
        isLoading={isLoadingJurisdictionCases}
      />

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search all cases by name, abbreviation, or docket number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      isActuallySearching
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {isActuallySearching && (
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

            {/* Filter Panel - Always rendered to prevent layout shifts */}
            <div
              className={`transition-all duration-200 overflow-hidden ${
                showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                updateFilter={updateFilter}
                courts={courts}
                years={years}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {searchError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              Search error: {searchError.message}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Pagination or Filter Message - Only render when needed */}
          {(hasActiveFilters || shouldShowPagination) && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              {hasActiveFilters ? (
                <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <div className="flex items-center justify-between">
                    <span>
                      📊 Showing filtered results. Pagination is disabled while
                      filters are active.
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              ) : (
                <Pagination
                  hasNextPage={isSearchActive ? searchHasNextPage : hasNextPage}
                  hasPreviousPage={
                    isSearchActive ? searchHasPreviousPage : hasPreviousPage
                  }
                  onNextPage={
                    isSearchActive ? loadNextSearchPage : loadNextPage
                  }
                  onPreviousPage={
                    isSearchActive ? loadPreviousSearchPage : loadPreviousPage
                  }
                  totalCount={isSearchActive ? searchTotalCount : totalCount}
                  currentPageSize={processedCases.length}
                  currentPageStart={
                    isSearchActive ? searchCurrentPageStart : currentPageStart
                  }
                  currentPageEnd={
                    isSearchActive ? searchCurrentPageEnd : currentPageEnd
                  }
                />
              )}
            </div>
          )}

          {/* Main Content Container */}
          <div className="bg-white rounded-lg shadow-sm border transition-all duration-200">
            {isLoading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center">
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
                <p className="text-gray-600 mt-4">
                  {isSearchActive && isActuallySearching
                    ? 'Searching for cases...'
                    : `Loading cases for ${selectedJurisdiction}...`}
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
              <div className="min-h-[400px] flex flex-col items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No cases found
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  {isSearchActive && hasNoResults
                    ? 'Your search returned no results. Try a different query.'
                    : hasActiveFilters
                    ? 'No cases match your filter criteria. Try adjusting them.'
                    : 'Select a jurisdiction to browse cases or use the search bar for a global search.'}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Spacer */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
}
