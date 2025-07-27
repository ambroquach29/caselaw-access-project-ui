'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import SelectJurisdiction from './SelectJurisdiction';
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

  const handleJurisdictionChange = useCallback(
    (jurisdiction: string) => {
      resetPagination();
      setSelectedJurisdiction(jurisdiction);
      setIsLoadingJurisdictionCases(true);
    },
    [resetPagination]
  );

  const handleClearJurisdictionSelect = useCallback(() => {
    resetPagination();
    setSelectedJurisdiction('');
    setJurisdictionCases([]);
    setIsLoadingJurisdictionCases(false);
  }, [resetPagination]);

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

  return (
    <div>
      {/* Header */}
      <CaseListHeader
        caseCount={jurisdictionCases.length}
        totalCount={totalCount}
        isSearchActive={false}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {/* Pagination - Only show when jurisdiction is selected */}
          {selectedJurisdiction && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <Pagination
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onNextPage={loadNextPage}
                onPreviousPage={loadPreviousPage}
                totalCount={totalCount}
                currentPageSize={jurisdictionCases.length}
                currentPageStart={currentPageStart}
                currentPageEnd={currentPageEnd}
              />
            </div>
          )}

          {/* Main Content Container */}
          <div className="bg-white rounded-lg shadow-sm border transition-all duration-200">
            {isLoadingJurisdictionCases ? (
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
                  Loading cases for {selectedJurisdiction}...
                </p>
              </div>
            ) : jurisdictionCases && jurisdictionCases.length > 0 ? (
              <CaseTable
                cases={jurisdictionCases}
                sortField="decision_date"
                sortDirection="desc"
                onSort={() => {}} // Disable sorting for now
                onRowClick={handleRowClick}
              />
            ) : (
              <div className="min-h-[400px] flex flex-col items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No cases found
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  {selectedJurisdiction
                    ? 'No cases found for the selected jurisdiction.'
                    : 'Select a jurisdiction to browse cases.'}
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
