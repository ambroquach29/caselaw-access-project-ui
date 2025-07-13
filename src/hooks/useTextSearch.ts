import { useState, useEffect, useCallback, useRef } from 'react';
import { useLazyQuery, ApolloError } from '@apollo/client';
import useDebounce from '@/hooks/useDebounce';
import { SEARCH_CASES } from '@/lib/graphql/queries';
import { Case } from '@/types/case';

// 1. Add explicit types for better type safety
interface SearchData {
  SearchCases: Case[];
}

interface SearchVariables {
  searchText: string;
}

export function useTextSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const currentSearchRef = useRef<string>('');

  const [
    runSearch,
    { loading: isSearching, error: searchError, data: searchData, called },
  ] = useLazyQuery<SearchData, SearchVariables>(SEARCH_CASES, {
    fetchPolicy: 'cache-and-network',
  });

  // Track if we should consider the search as "called" for the current query
  const [currentSearchCalled, setCurrentSearchCalled] = useState(false);

  useEffect(() => {
    // Effect's single responsibility is to trigger the search
    if (debouncedSearchQuery && debouncedSearchQuery.length > 1) {
      currentSearchRef.current = debouncedSearchQuery;
      setCurrentSearchCalled(true);
      runSearch({
        variables: { searchText: debouncedSearchQuery },
      });
    } else {
      // Clear the current search when query is too short
      currentSearchRef.current = '';
      setCurrentSearchCalled(false);
    }
  }, [debouncedSearchQuery, runSearch]);

  const isSearchLongEnough = debouncedSearchQuery.length > 1;

  // 2. Only show results if they match the current search query
  const searchResultCases =
    isSearchLongEnough &&
    searchData?.SearchCases &&
    currentSearchRef.current === debouncedSearchQuery
      ? searchData.SearchCases
      : [];

  // 3. Add a more specific state to know if a search was tried but had no results
  const hasNoResults =
    currentSearchCalled &&
    !isSearching &&
    isSearchLongEnough &&
    searchResultCases.length === 0;

  // 4. (Optional) Add a dedicated reset function for a cleaner API
  const resetSearch = useCallback(() => {
    setSearchQuery('');
    currentSearchRef.current = '';
    setCurrentSearchCalled(false);
    // Note: No need to manually clear `searchData`. The derived `searchResultCases`
    // will become an empty array automatically when `searchQuery` is cleared.
  }, []);

  return {
    // State & Setter
    searchQuery,
    setSearchQuery,

    // Query Status
    isSearching,
    searchError,

    // Results & Derived State
    searchResultCases,
    hasNoResults, // True only when a search is complete and returned nothing
    isSearchActive: isSearchLongEnough, // Simplified active flag

    // Utilities
    resetSearch,
  };
}
