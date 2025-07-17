import { useState, useEffect, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import useDebounce from '@/hooks/useDebounce';
import { SEARCH_CASES } from '@/lib/graphql/queries';
import { Case, CaseConnection, PaginationArgs } from '@/types/case';

interface SearchData {
  SearchCases: CaseConnection;
}

interface SearchVariables {
  searchText: string;
  first?: number;
  after?: string;
}

export function useTextSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Simplified pagination state
  const [paginationArgs, setPaginationArgs] = useState<PaginationArgs>({
    first: 50,
  });

  const [
    runSearch,
    {
      loading: isSearching,
      error: searchError,
      data: searchData,
      networkStatus,
    },
  ] = useLazyQuery<SearchData, SearchVariables>(SEARCH_CASES, {
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  // Simplified state - only track if search is active and has results
  const isSearchActive = debouncedSearchQuery.length > 1;
  const isActuallySearching = isSearching && networkStatus !== 1; // Exclude cache hits

  // Extract cases from search results
  const searchResultCases =
    searchData?.SearchCases?.edges?.map((edge) => edge.node) || [];

  // Simplified pagination info
  const pageInfo = searchData?.SearchCases?.pageInfo || {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  };

  const totalCount = searchData?.SearchCases?.totalCount || 0;

  // Track cursor stack for backward navigation
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  // Track current page number (1-based)
  const [currentPage, setCurrentPage] = useState(1);

  // Effect to trigger search when query changes
  useEffect(() => {
    if (isSearchActive) {
      setPaginationArgs({ first: 50 });
      setCursorStack([]);
      setCurrentPage(1);

      runSearch({
        variables: {
          searchText: debouncedSearchQuery,
          first: 50,
        },
      });
    }
  }, [debouncedSearchQuery, isSearchActive, runSearch]);

  // Effect to handle pagination changes
  useEffect(() => {
    if (isSearchActive && paginationArgs.after !== undefined) {
      runSearch({
        variables: {
          searchText: debouncedSearchQuery,
          ...paginationArgs,
        },
      });
    }
  }, [paginationArgs, isSearchActive, debouncedSearchQuery, runSearch]);

  // Pagination functions
  const loadNextSearchPage = useCallback(() => {
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      console.log(
        '🔄 Next search page - Current cursor:',
        paginationArgs.after
      );
      console.log('🔄 Next search page - Stack before:', cursorStack);

      // Add current cursor to stack for backward navigation
      if (paginationArgs.after) {
        setCursorStack((prev) => [...prev, paginationArgs.after!]);
      }

      setPaginationArgs((prev) => ({
        ...prev,
        after: pageInfo.endCursor as string,
      }));

      // Increment current page
      setCurrentPage((prev) => prev + 1);
    }
  }, [
    pageInfo.hasNextPage,
    pageInfo.endCursor,
    paginationArgs.after,
    cursorStack,
  ]);

  const loadPreviousSearchPage = useCallback(() => {
    console.log('🔄 Previous search page - Stack:', cursorStack);
    console.log(
      '🔄 Previous search page - Current after:',
      paginationArgs.after
    );

    if (cursorStack.length > 0) {
      // Get the previous cursor from stack
      const previousCursor = cursorStack[cursorStack.length - 1];
      const newStack = cursorStack.slice(0, -1);

      console.log('🔄 Previous search page - Using cursor:', previousCursor);
      setCursorStack(newStack);
      setPaginationArgs((prev) => ({
        ...prev,
        after: previousCursor,
      }));

      // Decrement current page
      setCurrentPage((prev) => Math.max(1, prev - 1));
    } else if (paginationArgs.after) {
      // Go back to first page
      console.log('🔄 Previous search page - Going to first page');
      setPaginationArgs({ first: 50 });
      setCurrentPage(1);
    }
  }, [cursorStack, paginationArgs.after]);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setPaginationArgs({ first: 50 });
    setCursorStack([]);
    setCurrentPage(1);
  }, []);

  // Calculate page range based on actual page number
  const currentPageStart = currentPage === 1 ? 1 : (currentPage - 1) * 50 + 1;
  const currentPageEnd = currentPageStart + searchResultCases.length - 1;

  const hasNoResults =
    isSearchActive && !isActuallySearching && searchResultCases.length === 0;

  return {
    // State
    searchQuery,
    setSearchQuery,

    // Loading states
    isActuallySearching,
    searchError,

    // Results
    searchResultCases,
    hasNoResults,
    isSearchActive,

    // Pagination
    searchHasNextPage: pageInfo.hasNextPage,
    searchHasPreviousPage:
      cursorStack.length > 0 || Boolean(paginationArgs.after),
    searchTotalCount: totalCount,
    searchCurrentPageStart: currentPageStart,
    searchCurrentPageEnd: currentPageEnd,
    loadNextSearchPage,
    loadPreviousSearchPage,

    // Utilities
    resetSearch,
  };
}
