'use client';

import { useRouter } from 'next/navigation';
import { Search, BookOpen } from 'lucide-react';
import { useTextSearch } from '@/hooks/useTextSearch';
import CaseTable from './CaseTable';
import CaseListHeader from './CaseListHeader';
import { Pagination } from './Pagination';

export default function CaseSearchList() {
  const router = useRouter();

  const {
    searchQuery,
    setSearchQuery,
    isActuallySearching,
    searchError,
    searchResultCases,
    hasNoResults,
    isSearchActive,
    searchHasNextPage,
    searchHasPreviousPage,
    searchTotalCount,
    searchCurrentPageStart,
    searchCurrentPageEnd,
    loadNextSearchPage,
    loadPreviousSearchPage,
    resetSearch,
  } = useTextSearch();

  const handleRowClick = (caseId: string) => {
    router.push(`/case/${caseId}`);
  };

  const handleClearSearch = () => {
    resetSearch();
  };

  return (
    <div>
      {/* Header */}
      <CaseListHeader
        caseCount={searchResultCases.length}
        totalCount={searchTotalCount}
        isSearchActive={isSearchActive}
        selectedJurisdiction=""
      />

      {/* Search Input */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases by text content..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
            {isSearchActive && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                Search error: {searchError.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {/* Pagination - Only show when search is active and has results */}
          {isSearchActive && searchResultCases.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <Pagination
                hasNextPage={searchHasNextPage}
                hasPreviousPage={searchHasPreviousPage}
                onNextPage={loadNextSearchPage}
                onPreviousPage={loadPreviousSearchPage}
                totalCount={searchTotalCount}
                currentPageSize={searchResultCases.length}
                currentPageStart={searchCurrentPageStart}
                currentPageEnd={searchCurrentPageEnd}
              />
            </div>
          )}

          {/* Main Content Container */}
          <div className="bg-white rounded-lg shadow-sm border transition-all duration-200">
            {isActuallySearching ? (
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
                  Searching cases for "{searchQuery}"...
                </p>
              </div>
            ) : hasNoResults ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center">
                <Search className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  No cases found matching "{searchQuery}". Try adjusting your
                  search terms.
                </p>
              </div>
            ) : searchResultCases.length > 0 ? (
              <CaseTable
                cases={searchResultCases}
                sortField="decision_date"
                sortDirection="desc"
                onSort={() => {}} // Disable sorting for search results
                onRowClick={handleRowClick}
              />
            ) : (
              <div className="min-h-[400px] flex flex-col items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Search for cases
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  Enter a search term above to find cases by their text content.
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
