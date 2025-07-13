import { useState, useMemo, useCallback } from 'react';
import { Case } from '@/types/case';

type SortField =
  | 'name'
  | 'decision_date'
  | 'court'
  | 'jurisdiction'
  | 'docket_number';
type SortDirection = 'asc' | 'desc';

interface Filters {
  court: string;
  status: string;
  year: string;
}

export function useCaseProcessing(sourceData: Case[]) {
  // SORTING & FILTERING STATE
  const [sortField, setSortField] = useState<SortField>('decision_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Filters>({
    court: '',
    status: '',
    year: '',
  });

  // More ergonomic filter setter
  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ court: '', status: '', year: '' });
  }, []);

  const processedCases = useMemo<Case[]>(() => {
    if (!sourceData?.length) return [];

    // Pre-calculate values before the filter loop
    const filterYear = filters.year ? parseInt(filters.year, 10) : null;
    const fiveYearsAgo = filters.status ? new Date() : null;
    if (fiveYearsAgo) {
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    }

    let filteredData = sourceData.filter((caseItem: Case) => {
      // Court filter
      if (filters.court && caseItem.court?.name !== filters.court) {
        return false;
      }
      // Status filter
      if (filters.status && fiveYearsAgo) {
        const caseDate = new Date(caseItem.decision_date);
        if (filters.status === 'recent' && caseDate < fiveYearsAgo)
          return false;
        if (filters.status === 'older' && caseDate >= fiveYearsAgo)
          return false;
      }
      // Year filter
      if (filterYear) {
        const caseYear = new Date(caseItem.decision_date).getFullYear();
        if (caseYear !== filterYear) return false;
      }
      return true;
    });

    // Use a value extractor map for cleaner, more robust sorting
    const valueExtractors: Record<SortField, (c: Case) => any> = {
      name: (c) => c.name_abbreviation || c.name || '',
      court: (c) => c.court?.name || '',
      jurisdiction: (c) => c.jurisdiction?.name_long || '',
      docket_number: (c) => c.docket_number || '',
      decision_date: (c) => (c.decision_date ? new Date(c.decision_date) : 0), // Handle null dates
    };

    const sortedData = [...filteredData].sort((a: Case, b: Case) => {
      const aValue = valueExtractors[sortField](a);
      const bValue = valueExtractors[sortField](b);

      // Push null/empty/invalid values to the bottom regardless of sort direction
      if (!aValue) return 1;
      if (!bValue) return -1;

      const direction = sortDirection === 'asc' ? 1 : -1;
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });

    return sortedData;
  }, [sourceData, filters, sortField, sortDirection]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc'); // Default to ascending on new column
      }
    },
    [sortField, sortDirection]
  );

  return {
    processedCases,
    filters,
    setFilters, // Keep original setter for complex updates
    updateFilter, // Add helper for simple updates
    clearFilters,
    sortField,
    sortDirection,
    handleSort,
  };
}
