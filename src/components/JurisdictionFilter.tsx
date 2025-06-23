'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, X } from 'lucide-react';

const ALL_JURISDICTIONS = [
  'Alabama',
  'Alaska',
  'American Samoa',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Dakota Territory',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Guam',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Navajo Nation',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Northern Mariana Islands',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Puerto Rico',
  'Regional',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Tribal Jurisdictions',
  'United States',
  'Utah',
  'Vermont',
  'Virgin Islands',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

interface JurisdictionFilterProps {
  selectedJurisdiction: string;
  onJurisdictionChange: (jurisdiction: string) => void;
  onClearFilter: () => void;
  availableJurisdictions: string[];
  jurisdictionCaseCounts: Record<string, number>;
}

export default function JurisdictionFilter({
  selectedJurisdiction,
  onJurisdictionChange,
  onClearFilter,
  availableJurisdictions,
  jurisdictionCaseCounts,
}: JurisdictionFilterProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJurisdictions = ALL_JURISDICTIONS.filter((jurisdiction) =>
    jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJurisdictionClick = (jurisdiction: string) => {
    if (selectedJurisdiction === jurisdiction) {
      onClearFilter();
    } else {
      onJurisdictionChange(jurisdiction);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Jurisdiction Filter
            </h2>
            {selectedJurisdiction && (
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center">
                {selectedJurisdiction}
                <button
                  onClick={onClearFilter}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Jurisdictions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {filteredJurisdictions.map((jurisdiction) => {
                const hasCases = availableJurisdictions.includes(jurisdiction);
                const caseCount = jurisdictionCaseCounts[jurisdiction] || 0;
                return (
                  <button
                    key={jurisdiction}
                    onClick={() => handleJurisdictionClick(jurisdiction)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                      selectedJurisdiction === jurisdiction
                        ? 'bg-blue-600 text-white border-blue-600'
                        : hasCases
                        ? 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    disabled={!hasCases}
                    title={
                      !hasCases
                        ? `No cases available for ${jurisdiction}`
                        : `${caseCount} cases available for ${jurisdiction}`
                    }
                  >
                    {jurisdiction}
                    {hasCases ? (
                      <span className="block text-xs opacity-75">
                        ({caseCount} {caseCount === 1 ? 'case' : 'cases'})
                      </span>
                    ) : (
                      <span className="block text-xs opacity-75">
                        (No cases)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredJurisdictions.length === 0 && (
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
