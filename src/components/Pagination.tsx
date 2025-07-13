import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  totalCount: number;
  currentPageSize: number;
  currentPageStart?: number;
  currentPageEnd?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  totalCount,
  currentPageSize,
  currentPageStart,
  currentPageEnd,
  className = '',
}) => {
  // Calculate display values
  const displayStart = currentPageStart || 1;
  const displayEnd = currentPageEnd || currentPageSize;
  const displayTotal = totalCount || 0;

  return (
    <div className={`${className}`}>
      {/* Mobile Pagination */}
      <div className="flex justify-between items-center sm:hidden">
        <button
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            hasPreviousPage
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>

        <div className="text-sm text-gray-600 font-medium">
          {displayStart}-{displayEnd} of {displayTotal.toLocaleString()}
        </div>

        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            hasNextPage
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Results Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              Showing{' '}
              <span className="text-blue-600 font-semibold">
                {displayStart.toLocaleString()}
              </span>{' '}
              to{' '}
              <span className="text-blue-600 font-semibold">
                {displayEnd.toLocaleString()}
              </span>{' '}
              of{' '}
              <span className="text-gray-900 font-semibold">
                {displayTotal.toLocaleString()}
              </span>{' '}
              results
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviousPage}
            disabled={!hasPreviousPage}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              hasPreviousPage
                ? 'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              hasNextPage
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
