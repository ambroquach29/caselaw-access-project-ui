'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import {
  Search,
  Calendar,
  Filter,
  BookOpen,
  MapPin,
  ChevronUp,
  ChevronDown,
  Eye,
  Copy,
  X,
} from 'lucide-react';
import { GET_ALL_CASES, SEARCH_CASES } from '@/lib/graphql/queries';
import { Case, CaseSearchResult } from '@/types/case';
import { formatDate, truncateText, getCaseStatus } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import JurisdictionFilter from './JurisdictionFilter';

type SortField =
  | 'name'
  | 'decision_date'
  | 'court'
  | 'jurisdiction'
  | 'docket_number';
type SortDirection = 'asc' | 'desc';

export default function CaseList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortField, setSortField] = useState<SortField>('decision_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [filters, setFilters] = useState({
    jurisdiction: '',
    court: '',
    status: '',
    year: '',
  });

  const {
    data: allCasesData,
    loading: allCasesLoading,
    error: allCasesError,
  } = useQuery(GET_ALL_CASES);
  const {
    data: searchData,
    loading: searchLoading,
    error: searchError,
  } = useQuery(SEARCH_CASES, {
    variables: { id: searchQuery },
    skip: !searchQuery || searchQuery.length < 2,
  });

  const cases = searchQuery
    ? searchData?.SearchCases
    : allCasesData?.GetAllCases;
  const loading = searchQuery ? searchLoading : allCasesLoading;
  const error = searchQuery ? searchError : allCasesError;

  // Get unique jurisdictions and courts for filter dropdowns
  const jurisdictions = useMemo(() => {
    if (!cases) return [];
    const unique = new Set<string>();
    cases.forEach((caseItem: any) => {
      if (caseItem.jurisdiction?.name_long) {
        unique.add(caseItem.jurisdiction.name_long);
      }
    });
    return Array.from(unique).sort();
  }, [cases]);

  // Calculate case counts for each jurisdiction
  const jurisdictionCaseCounts = useMemo(() => {
    if (!cases) return {};
    const counts: Record<string, number> = {};
    cases.forEach((caseItem: any) => {
      if (caseItem.jurisdiction?.name_long) {
        const jurisdiction = caseItem.jurisdiction.name_long;
        counts[jurisdiction] = (counts[jurisdiction] || 0) + 1;
      }
    });
    return counts;
  }, [cases]);

  const courts = useMemo(() => {
    if (!cases) return [];
    const unique = new Set<string>();
    cases.forEach((caseItem: any) => {
      if (caseItem.court?.name) {
        unique.add(caseItem.court.name);
      }
    });
    return Array.from(unique).sort();
  }, [cases]);

  // Get unique years for filter dropdown
  const years = useMemo(() => {
    if (!cases) return [];
    const unique = new Set<number>();
    cases.forEach((caseItem: any) => {
      if (caseItem.decision_date) {
        const year = new Date(caseItem.decision_date).getFullYear();
        unique.add(year);
      }
    });
    return Array.from(unique).sort((a, b) => b - a); // Sort descending (newest first)
  }, [cases]);

  // Sort and filter cases
  const processedCases = useMemo(() => {
    if (!cases) return [];

    let filtered = cases.filter((caseItem: any) => {
      // Jurisdiction filter
      if (filters.jurisdiction) {
        if (caseItem.jurisdiction?.name_long !== filters.jurisdiction) {
          return false;
        }
      }

      // Court filter
      if (filters.court && caseItem.court?.name !== filters.court) {
        return false;
      }

      // Status filter
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

      // Year filter
      if (filters.year) {
        const caseYear = new Date(caseItem.decision_date).getFullYear();
        if (caseYear !== parseInt(filters.year)) {
          return false;
        }
      }

      return true;
    });

    // Sort cases
    filtered.sort((a: any, b: any) => {
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
  }, [cases, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setFilters({
      jurisdiction: '',
      court: '',
      status: '',
      year: '',
    });
  };

  const handleJurisdictionChange = (jurisdiction: string) => {
    setSelectedJurisdiction(jurisdiction);
    setFilters((prev) => ({
      ...prev,
      jurisdiction: jurisdiction,
    }));
  };

  const handleClearJurisdictionFilter = () => {
    setSelectedJurisdiction('');
    setFilters((prev) => ({
      ...prev,
      jurisdiction: '',
    }));
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
  };

  const handleRowClick = (caseId: string) => {
    router.push(`/case/${caseId}`);
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Cases
            </h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

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
      <JurisdictionFilter
        selectedJurisdiction={selectedJurisdiction}
        onJurisdictionChange={handleJurisdictionChange}
        onClearFilter={handleClearJurisdictionFilter}
        availableJurisdictions={jurisdictions}
        jurisdictionCaseCounts={jurisdictionCaseCounts}
      />

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cases by name, abbreviation, or docket number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Search
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-100"></div>
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-white border-t border-gray-100"
                ></div>
              ))}
            </div>
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              {searchQuery || hasActiveFilters
                ? 'No cases match your search criteria. Try adjusting your filters.'
                : 'No cases are currently available in the database.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
