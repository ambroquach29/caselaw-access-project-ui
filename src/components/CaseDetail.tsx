'use client';

import { useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  BookOpen,
  FileText,
  Users,
  Scale,
  BarChart3,
  Hash,
  ExternalLink,
  Type,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GET_CASE_BY_ID } from '@/lib/graphql/queries';
import { Case } from '@/types/case';
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  getCitationDisplay,
  getCaseStatus,
} from '@/lib/utils';
import Link from 'next/link';

export default function CaseDetail() {
  const params = useParams();
  const caseId = params.id as string;
  const [readingMode, setReadingMode] = useState<
    'normal' | 'large' | 'extraLarge'
  >('normal');

  const { data, loading, error } = useQuery(GET_CASE_BY_ID, {
    variables: { id: caseId },
  });

  const caseData: Case = data?.GetCaseById;

  // Reading mode styles
  const readingStyles = {
    normal: { fontSize: '16px', lineHeight: '1.8' },
    large: { fontSize: '18px', lineHeight: '2.0' },
    extraLarge: { fontSize: '20px', lineHeight: '2.2' },
  };

  const currentStyle = readingStyles[readingMode];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm border p-6"
                  >
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm border p-6"
                  >
                    <div className="h-5 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Case
            </h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Case Not Found
            </h2>
            <p className="text-yellow-600">
              The requested case could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {caseData.name_abbreviation || 'Case Details'}
              </h1>
              <p className="text-gray-600 mb-4 line-clamp-2">{caseData.name}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(caseData.decision_date)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{caseData.court?.name}</span>
                </div>
                <div className="flex items-center">
                  <Scale className="h-4 w-4 mr-1" />
                  <span>{caseData.jurisdiction?.name_long}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    getCaseStatus(caseData.decision_date).color
                  }`}
                >
                  {getCaseStatus(caseData.decision_date).status}
                </span>
              </div>
            </div>

            <div className="mt-4 lg:mt-0 lg:ml-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <Hash className="h-4 w-4 mr-2" />
                    <span>ID: {caseData.id}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>
                      Pages: {caseData.first_page}-{caseData.last_page}
                    </span>
                  </div>
                </div>

                {/* Reading Mode Controls */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      {/* <Type className="h-4 w-4 mr-1" /> */}
                      Text Size:
                    </span>
                    <div className="ml-1 flex items-center space-x-1">
                      <button
                        onClick={() => setReadingMode('normal')}
                        className={`p-1 rounded ${
                          readingMode === 'normal'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Normal size"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setReadingMode('large')}
                        className={`p-1 rounded ${
                          readingMode === 'large'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Large size"
                      >
                        <Type className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setReadingMode('extraLarge')}
                        className={`p-1 rounded ${
                          readingMode === 'extraLarge'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Extra large size"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Citations */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Citations
              </h2>
              <div className="space-y-3">
                {caseData.citations?.map((citation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-500">
                        {citation.cite}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({citation.type})
                      </span>
                    </div>
                  </div>
                ))}
                {(!caseData.citations || caseData.citations.length === 0) && (
                  <p className="text-gray-500">No citations available</p>
                )}
              </div>
            </div>

            {/* Opinions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Opinions
              </h2>
              <div className="space-y-8">
                {caseData.casebody?.opinions?.map((opinion, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-6 py-2"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 capitalize text-lg">
                        {opinion.type} Opinion
                      </h3>
                      {opinion.author && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          by {opinion.author}
                        </span>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div
                        className="text-gray-700 leading-relaxed"
                        style={{
                          whiteSpace: 'pre-wrap',
                          // fontFamily: 'Quincy',
                          lineHeight: currentStyle.lineHeight,
                          textAlign: 'justify',
                          fontSize: currentStyle.fontSize,
                        }}
                      >
                        {opinion.text.split('\n\n').map((paragraph, pIndex) => (
                          <p key={pIndex} className="mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {(!caseData.casebody?.opinions ||
                  caseData.casebody.opinions.length === 0) && (
                  <p className="text-gray-500">No opinions available</p>
                )}
              </div>
            </div>

            {/* Parties */}
            {caseData.casebody?.parties &&
              caseData.casebody.parties.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Parties
                  </h2>
                  <div className="space-y-2">
                    {caseData.casebody.parties.map((party, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{party}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Attorneys */}
            {caseData.casebody?.attorneys &&
              caseData.casebody.attorneys.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Attorneys
                  </h2>
                  <div className="space-y-2">
                    {caseData.casebody.attorneys.map((attorney, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{attorney}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Case Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Docket Number:
                  </span>
                  <p className="text-gray-600">
                    {caseData.docket_number || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Decision Date:
                  </span>
                  <p className="text-gray-600">
                    {formatDate(caseData.decision_date)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Court:</span>
                  <p className="text-gray-600">{caseData.court?.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Jurisdiction:
                  </span>
                  <p className="text-gray-600">
                    {caseData.jurisdiction?.name_long}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Last Updated:
                  </span>
                  <p className="text-gray-600">
                    {formatDateTime(caseData.last_updated)}
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analysis
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Word Count:</span>
                  <span className="text-gray-600">
                    {caseData.analysis?.word_count ? formatNumber(caseData.analysis.word_count) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Character Count:</span>
                  <span className="text-gray-600">
                    {caseData.analysis?.char_count ? formatNumber(caseData.analysis.char_count) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">OCR Confidence:</span>
                  <span className="text-gray-600">
                    {caseData.analysis?.ocr_confidence ? formatPercentage(caseData.analysis.ocr_confidence) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Page Rank:</span>
                  <span className="text-gray-600">
                    {caseData.analysis?.pagerank?.percentile ? formatPercentage(caseData.analysis.pagerank.percentile) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Cardinality:</span>
                  <span className="text-gray-600">
                    {caseData.analysis?.cardinality ? formatNumber(caseData.analysis.cardinality) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Provenance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Provenance
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Source:</span>
                  <p className="text-gray-600">{caseData.provenance?.source || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date Added:</span>
                  <p className="text-gray-600">
                    {caseData.provenance?.date_added ? formatDate(caseData.provenance.date_added) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Batch:</span>
                  <p className="text-gray-600">{caseData.provenance?.batch || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Citations To */}
            {caseData.cites_to && caseData.cites_to.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cases Cited (by this case)
                </h3>
                <div className="space-y-2">
                  {caseData.cites_to.slice(0, 10).map((cite, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium text-gray-700">
                        {cite.cite}
                      </div>
                      <div className="text-gray-600">{cite.reporter}</div>
                    </div>
                  ))}
                  {caseData.cites_to.length > 5 && (
                    <p className="text-sm text-gray-500">
                      +{caseData.cites_to.length - 10} more citations
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
