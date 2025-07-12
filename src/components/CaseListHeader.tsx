import { BookOpen } from 'lucide-react';

interface CaseListHeaderProps {
  caseCount: number;
}

export default function CaseListHeader({ caseCount }: CaseListHeaderProps) {
  return (
    <div className="bg-white shadow-sm">
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
              <span>{caseCount} cases available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
