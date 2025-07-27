'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import { ChevronDown, ChevronUp, MapPin, X } from 'lucide-react';
import { GET_CASES_BY_JURISDICTION } from '@/lib/graphql/queries';
import { ALL_JURISDICTIONS } from '@/lib/jurisdictions';
import { CaseConnection, PaginationArgs } from '@/types/case';

interface SelectJurisdictionProps {
  selectedJurisdiction: string;
  onJurisdictionChange: (jurisdiction: string) => void;
  onClearSelect: () => void;
  onCasesLoaded: (cases: any[]) => void;
  onPaginationDataLoaded?: (paginationData: CaseConnection) => void;
  paginationArgs?: PaginationArgs;
  year?: string;
  isLoading?: boolean;
}

export default function SelectJurisdiction({
  selectedJurisdiction,
  onJurisdictionChange,
  onClearSelect,
  onCasesLoaded,
  onPaginationDataLoaded,
  paginationArgs,
  year,
  isLoading: externalLoading,
}: SelectJurisdictionProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [getCasesByJurisdiction, { loading }] = useLazyQuery(
    GET_CASES_BY_JURISDICTION,
    {
      onCompleted: (data) => {
        console.log('🔍 Query completed:', {
          jurisdiction: selectedJurisdiction,
          paginationArgs,
          hasData: !!data?.GetCasesByJurisdiction,
          edgesCount: data?.GetCasesByJurisdiction?.edges?.length || 0,
          endCursor: data?.GetCasesByJurisdiction?.pageInfo?.endCursor,
          hasNextPage: data?.GetCasesByJurisdiction?.pageInfo?.hasNextPage,
        });

        if (data?.GetCasesByJurisdiction) {
          const connection = data.GetCasesByJurisdiction;
          // Extract cases from edges for backward compatibility
          const cases = connection.edges.map((edge: any) => edge.node);
          onCasesLoaded(cases);

          // Pass pagination data if callback is provided
          if (onPaginationDataLoaded) {
            onPaginationDataLoaded(connection);
          }
        } else {
          onCasesLoaded([]);
        }
      },
      onError: (error) => {
        console.error('Error fetching cases by jurisdiction:', error);
        // Reset loading state on error
        onCasesLoaded([]);
      },
    }
  );

  // Memoized query function to prevent dependency array issues
  const executeQuery = useCallback(() => {
    if (selectedJurisdiction) {
      console.log(
        '🔍 Fetching cases for jurisdiction:',
        selectedJurisdiction,
        'year:',
        year,
        'parsed year:',
        year && year.trim() ? parseInt(year) : undefined,
        paginationArgs
      );

      getCasesByJurisdiction({
        variables: {
          jurisdiction: selectedJurisdiction,
          year: year && year.trim() ? parseInt(year) : undefined,
          ...paginationArgs,
        },
      });
    }
  }, [selectedJurisdiction, year, paginationArgs, getCasesByJurisdiction]);

  // Handle jurisdiction selection and pagination changes
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  const searchedJurisdictions = ALL_JURISDICTIONS.filter((jurisdiction) =>
    jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJurisdictionClick = async (jurisdiction: string) => {
    if (selectedJurisdiction === jurisdiction) {
      onClearSelect();
    } else {
      onJurisdictionChange(jurisdiction);
    }
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Select Jurisdiction
            </h2>
            {selectedJurisdiction && (
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center">
                {selectedJurisdiction}
                <button
                  onClick={onClearSelect}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(loading || externalLoading) && (
              <span className="text-sm text-gray-500">Loading cases...</span>
            )}
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isMinimized ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </button>
        </div>

        {!isMinimized && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search jurisdictions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>

            {/* Jurisdictions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-52 overflow-y-auto">
              {searchedJurisdictions.map((jurisdiction) => {
                const isSelected = selectedJurisdiction === jurisdiction;

                return (
                  <button
                    key={jurisdiction}
                    onClick={() => handleJurisdictionClick(jurisdiction)}
                    disabled={loading || externalLoading}
                    className={`px-4 py-3 text-sm rounded-lg border transition-colors text-left ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    } ${
                      (loading || externalLoading) && isSelected
                        ? 'opacity-75'
                        : ''
                    }`}
                  >
                    {jurisdiction}
                  </button>
                );
              })}
            </div>

            {searchedJurisdictions.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No jurisdictions found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
