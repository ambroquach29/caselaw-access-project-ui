import { Search, BookOpen, Building2, MapPin } from 'lucide-react';

export type QueryType =
  | 'jurisdiction'
  | 'court'
  | 'text-search'
  | 'semantic-search';

interface QuerySelectorProps {
  activeQuery: QueryType;
  onQueryChange: (queryType: QueryType) => void;
}

export default function QuerySelector({
  activeQuery,
  onQueryChange,
}: QuerySelectorProps) {
  const tabs = [
    {
      id: 'jurisdiction' as QueryType,
      label: 'By Jurisdiction',
      icon: MapPin,
      description: 'Browse cases by legal jurisdiction',
    },
    {
      id: 'court' as QueryType,
      label: 'By Court',
      icon: Building2,
      description: 'Browse cases by specific court',
    },
    {
      id: 'text-search' as QueryType,
      label: 'Text Search',
      icon: Search,
      description: 'Search cases by name, abbreviation, or docket number',
    },
    {
      id: 'semantic-search' as QueryType,
      label: 'Semantic Search',
      icon: BookOpen,
      description: 'Search cases using natural language (AI-powered)',
    },
  ];

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Query tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeQuery === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onQueryChange(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                    mr-2 h-4 w-4
                    ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active tab description */}
        <div className="py-4">
          <p className="text-sm text-gray-600">
            {tabs.find((tab) => tab.id === activeQuery)?.description}
          </p>
        </div>
      </div>
    </div>
  );
}
