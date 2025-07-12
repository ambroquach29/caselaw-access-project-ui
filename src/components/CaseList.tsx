'use client';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_CASES } from '@/lib/graphql/queries';
import useDebounce from '@/hooks/useDebounce';
import SelectJurisdiction from './SelectJurisdiction'; // GetCasesByJurisdiction query
import { Case, CaseSearchResult } from '@/types/case';
import { formatDate, truncateText, getCaseStatus } from '@/lib/utils';

type SortField =
  | 'name'
  | 'decision_date'
  | 'court'
  | 'jurisdiction'
  | 'docket_number';
type SortDirection = 'asc' | 'desc';

// Spinner component for loading state
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

  // CASES STATE (for browse by jurisdiction)
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  // SEARCH STATE (global)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultCases, setSearchResultCases] = useState<Case[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [
    runSearch,
    { loading: isSearching, data: searchData, error: searchError },
  ] = useLazyQuery(SEARCH_CASES, {
    onCompleted: (data) => {
      setSearchResultCases(data.SearchCases);
    },
    onError: () => {
      setSearchResultCases([]);
    },
  });

  // SORTING & FILTERING STATE
  const [sortField, setSortField] = useState<SortField>('decision_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jurisdiction: '',
    court: '',
    status: '',
    year: '',
  });

  // Memoize clearFilters to stabilize its identity across renders
  const clearFilters = useCallback(() => {
    setFilters({
      jurisdiction: '',
      court: '',
      status: '',
      year: '',
    });
  }, []); // Empty dependency array means it's created only once

  useEffect(() => {
    // Only run search if the debounced query is not empty.
    if (debouncedSearchQuery && debouncedSearchQuery.length > 1) {
      // Clear jurisdiction state to make search global and independent
      setSelectedJurisdiction('');
      setCases([]);
      clearFilters();

      // Clear previous search results immediately to prevent flashing
      setSearchResultCases([]);

      runSearch({
        variables: {
          searchText: debouncedSearchQuery,
        },
      });
    }
  }, [debouncedSearchQuery, runSearch, clearFilters]);

  const isSearchActive =
    debouncedSearchQuery && debouncedSearchQuery.length > 1;

  const sourceData = isSearchActive ? searchResultCases : cases;

  const processedCases = useMemo<Case[]>(() => {
    if (!sourceData) return [];

    let filtered = sourceData.filter((caseItem: Case) => {
      if (filters.court && caseItem.court?.name !== filters.court) {
        return false;
      }
      if (filters.status) {
        const caseDate = new Date(caseItem.decision_date);
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

        if (filters.status === 'recent' && caseDate < fiveYearsAgo) {
          return false;
        }
        if (filters.status === 'older' && caseDate >= fiveYearsAgo) {
          return false;
        }
      }
      if (filters.year) {
        const caseYear = new Date(caseItem.decision_date).getFullYear();
        if (caseYear !== parseInt(filters.year)) {
          return false;
        }
      }
      return true;
    });

    filtered.sort((a: Case, b: Case) => {
      let aValue, bValue;
      switch (sortField) {
        case 'name':
          aValue = a.name_abbreviation || a.name || '';
          bValue = b.name_abbreviation || b.name || '';
          break;
        case 'decision_date':
          aValue = new Date(a.decision_date);
          bValue = new Date(b.decision_date);
          break;
        case 'court':
          aValue = a.court?.name || '';
          bValue = b.court?.name || '';
          break;
        case 'jurisdiction':
          aValue = a.jurisdiction?.name_long || '';
          bValue = b.jurisdiction?.name_long || '';
          break;
        case 'docket_number':
          aValue = a.docket_number || '';
          bValue = b.docket_number || '';
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [sourceData, filters, sortField, sortDirection]);

  const error: Error | null = searchError || null;

  const courts = useMemo<string[]>(() => {
    if (!processedCases) return [];
    const unique = new Set<string>();
    processedCases.forEach((caseItem: Case) => {
      if (caseItem.court?.name) {
        unique.add(caseItem.court.name);
      }
    });
    return Array.from(unique).sort();
  }, [processedCases]);

  const years = useMemo<number[]>(() => {
    if (!processedCases) return [];
    const unique = new Set<number>();
    processedCases.forEach((caseItem: Case) => {
      if (caseItem.decision_date) {
        const year = new Date(caseItem.decision_date).getFullYear();
        unique.add(year);
      }
    });
    return Array.from(unique).sort((a, b) => b - a);
  }, [processedCases]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleJurisdictionChange = useCallback(
    (jurisdiction: string) => {
      setSearchQuery('');
      setSearchResultCases([]);
      clearFilters();
      setSelectedJurisdiction(jurisdiction);
      setIsLoadingCases(true);
    },
    [clearFilters]
  );

  const handleClearJurisdictionSelect = useCallback(() => {
    setSearchQuery('');
    setSearchResultCases([]);
    clearFilters();
    setSelectedJurisdiction('');
    setCases([]);
    setIsLoadingCases(false);
  }, [clearFilters]);

  const handleCasesLoaded = (loadedCases: Case[]) => {
    setCases(loadedCases);
    setIsLoadingCases(false);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  const handleRowClick = (caseId: string) => {
    router.push(`/case/${caseId}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Case Law Database
              </h1>
              <p className="mt-2 text-gray-600">
                Browse and search through comprehensive case law data
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <BookOpen className="h-4 w-4" />
                <span>{processedCases.length} cases available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jurisdiction Filter */}
      <SelectJurisdiction
        selectedJurisdiction={selectedJurisdiction}
        onJurisdictionChange={handleJurisdictionChange}
        onClearSelect={handleClearJurisdictionSelect}
        onCasesLoaded={handleCasesLoaded}
      />

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search all cases by name, abbreviation, or docket number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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

            {/* Filter Panel */}
            {showFilters && (
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
                        setFilters((prev) => ({
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
                        setFilters((prev) => ({
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
                        setFilters((prev) => ({
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
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Cases Table */}
        {isSearching || isLoadingCases ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <Spinner />
          </div>
        ) : processedCases && processedCases.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Case Name
                        {sortField === 'name' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('decision_date')}
                    >
                      <div className="flex items-center">
                        Decision Date
                        {sortField === 'decision_date' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('court')}
                    >
                      <div className="flex items-center">
                        Court
                        {sortField === 'court' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('jurisdiction')}
                    >
                      <div className="flex items-center">
                        Jurisdiction
                        {sortField === 'jurisdiction' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('docket_number')}
                    >
                      <div className="flex items-center">
                        Docket Number
                        {sortField === 'docket_number' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedCases.map((caseItem: Case | CaseSearchResult) => (
                    <tr
                      key={caseItem.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(caseItem.id)}
                    >
                      <td className="px-6 py-4 whitespace">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {caseItem.name_abbreviation ||
                              truncateText(caseItem.name, 40)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {truncateText(caseItem.name, 60)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-wrap text-sm text-gray-900">
                        {formatDate(caseItem.decision_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-wrap text-sm text-gray-900">
                        {caseItem.court?.name_abbreviation ||
                          caseItem.court?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-wrap text-sm text-gray-900">
                        {caseItem.jurisdiction?.name_long ||
                          caseItem.jurisdiction?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-wrap text-sm text-gray-500">
                        {caseItem.docket_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-left whitespace-wrap">
                        <span
                          className={`inline-flex py-1 text-sm font-semibold rounded-full px-2 ${
                            getCaseStatus(formatDate(caseItem.decision_date))
                              .color
                          }`}
                        >
                          {
                            getCaseStatus(formatDate(caseItem.decision_date))
                              .status
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No cases found
            </h3>
            <p className="text-gray-600">
              {isSearchActive
                ? 'Your search returned no results. Try a different query.'
                : hasActiveFilters
                ? 'No cases match your filter criteria. Try adjusting them.'
                : 'Select a jurisdiction to browse cases or use the search bar for a global search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
