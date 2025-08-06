'use client';

import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import BrowseCases from './BrowseCases';
import SearchCases from './SearchCases';

type TabType = 'browse' | 'search';

interface TabButtonProps {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}

function TabButton({ id, label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`
        flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2
        ${
          isActive
            ? 'text-blue-600 border-blue-600 bg-blue-50'
            : 'text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState<TabType>('browse');

  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'browse',
      label: 'Browse Cases',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: 'search',
      label: 'Search Cases',
      icon: <Search className="h-4 w-4" />,
    },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                isActive={activeTab === tab.id}
                onClick={handleTabChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'browse' && <BrowseCases />}
        {activeTab === 'search' && <SearchCases />}
      </div>
    </div>
  );
}
