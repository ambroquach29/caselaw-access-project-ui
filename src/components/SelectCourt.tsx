'use client';

import { useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { ChevronDown, ChevronUp, Building2, X } from 'lucide-react';
import { GET_CASES_BY_COURT, GET_ALL_COURTS } from '@/lib/graphql/queries';

interface SelectCourtProps {
  selectedCourt: string;
  onCourtChange: (court: string) => void;
  onClearSelect: () => void;
  onCasesLoaded: (cases: any[]) => void;
}

export default function SelectCourt({
  selectedCourt,
  onCourtChange,
  onClearSelect,
  onCasesLoaded,
}: SelectCourtProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all courts
  const {
    data: courtsData,
    loading: loadingCourts,
    error: courtsError,
  } = useQuery(GET_ALL_COURTS);

  const [getCasesByCourt, { loading }] = useLazyQuery(GET_CASES_BY_COURT, {
    onCompleted: (data) => {
      if (data?.GetCasesByCourt) {
        onCasesLoaded(data.GetCasesByCourt);
      } else {
        onCasesLoaded([]);
      }
    },
    onError: (error) => {
      console.error('Error fetching cases by court:', error);
    },
  });

  // Filter courts based on search term
  const searchedCourts =
    courtsData?.GetAllCourts?.filter((court: any) =>
      court.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleCourtClick = async (court: any) => {
    const courtName = court.name;
    if (selectedCourt === courtName) {
      onClearSelect();
    } else {
      onCourtChange(courtName);
      await getCasesByCourt({
        variables: { court: courtName },
      });
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Select Court
            </h2>
            {selectedCourt && (
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center">
                {selectedCourt}
                <button
                  onClick={onClearSelect}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {loading && (
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
                placeholder="Search courts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>

            {/* Courts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {loadingCourts ? (
                <div className="col-span-full text-center py-4 text-gray-500">
                  Loading courts...
                </div>
              ) : courtsError ? (
                <div className="col-span-full text-center py-4 text-red-500">
                  Error loading courts. Please try again.
                </div>
              ) : (
                searchedCourts.map((court: any) => {
                  const courtName = court.name;
                  const isSelected = selectedCourt === courtName;

                  return (
                    <button
                      key={court.id}
                      onClick={() => handleCourtClick(court)}
                      disabled={loading}
                      className={`px-4 py-3 text-sm rounded-lg border transition-colors text-left ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      } ${loading && isSelected ? 'opacity-75' : ''}`}
                    >
                      <div className="font-medium">{court.name}</div>
                    </button>
                  );
                })
              )}
            </div>

            {!loadingCourts && !courtsError && searchedCourts.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No courts found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
