'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Case, CaseSearchResult } from '@/types/case';
import { formatDate, truncateText, getCaseStatus } from '@/lib/utils';

type SortField =
  | 'name'
  | 'decision_date'
  | 'court'
  | 'jurisdiction'
  | 'docket_number';

type SortDirection = 'asc' | 'desc';

interface CaseTableProps {
  cases: (Case | CaseSearchResult)[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRowClick: (caseId: string) => void;
}

export default function CaseTable({
  cases,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
}: CaseTableProps) {
  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center">
                  Case Name
                  {renderSortArrow('name')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('decision_date')}
              >
                <div className="flex items-center">
                  Decision Date
                  {renderSortArrow('decision_date')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('court')}
              >
                <div className="flex items-center">
                  Court
                  {renderSortArrow('court')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('jurisdiction')}
              >
                <div className="flex items-center">
                  Jurisdiction
                  {renderSortArrow('jurisdiction')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('docket_number')}
              >
                <div className="flex items-center">
                  Docket Number
                  {renderSortArrow('docket_number')}
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
            {cases.map((caseItem) => (
              <tr
                key={caseItem.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(caseItem.id)}
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
                  {caseItem.court?.name_abbreviation || caseItem.court?.name}
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
                      getCaseStatus(formatDate(caseItem.decision_date)).color
                    }`}
                  >
                    {getCaseStatus(formatDate(caseItem.decision_date)).status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
