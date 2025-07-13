import { useState, useCallback } from 'react';
import { PaginationArgs, CaseConnection } from '../types/case';

export interface UsePaginationReturn {
  paginationArgs: PaginationArgs;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  currentPageStart: number;
  currentPageEnd: number;
  loadNextPage: () => void;
  loadPreviousPage: () => void;
  resetPagination: () => void;
  updatePaginationFromResult: (result: CaseConnection) => void;
}

export const usePagination = (pageSize: number = 10): UsePaginationReturn => {
  const [paginationArgs, setPaginationArgs] = useState<PaginationArgs>({
    first: pageSize,
  });

  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    totalCount: 0,
    startCursor: null as string | null,
    endCursor: null as string | null,
  });

  // Track current page range
  const [currentPageStart, setCurrentPageStart] = useState(0);
  const [currentPageEnd, setCurrentPageEnd] = useState(0);

  // Track cursor history for backward navigation
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  // Track current page number (1-based)
  const [currentPage, setCurrentPage] = useState(1);

  const loadNextPage = useCallback(() => {
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      console.log('🔄 Next page - Current cursor:', paginationArgs.after);
      console.log('🔄 Next page - Stack before:', cursorStack);

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

  const loadPreviousPage = useCallback(() => {
    console.log('🔄 Previous page - Stack:', cursorStack);
    console.log('🔄 Previous page - Current after:', paginationArgs.after);

    // Check if we can go back (either have cursors in stack or we're not on first page)
    if (cursorStack.length > 0) {
      // Get the previous cursor from stack
      const previousCursor = cursorStack[cursorStack.length - 1];
      const newStack = cursorStack.slice(0, -1);

      console.log('🔄 Previous page - Using cursor:', previousCursor);
      setCursorStack(newStack);
      setPaginationArgs((prev) => ({
        ...prev,
        after: previousCursor,
      }));

      // Decrement current page
      setCurrentPage((prev) => Math.max(1, prev - 1));
    } else if (paginationArgs.after) {
      // If no cursor in stack but we have an 'after' parameter, go back to first page
      console.log('🔄 Previous page - Going to first page');
      setPaginationArgs({ first: pageSize });
      setCurrentPage(1);
    }
  }, [cursorStack, paginationArgs.after, pageSize]);

  const resetPagination = useCallback(() => {
    setPaginationArgs({ first: pageSize });
    setPageInfo({
      hasNextPage: false,
      hasPreviousPage: false,
      totalCount: 0,
      startCursor: null,
      endCursor: null,
    });
    setCurrentPageStart(0);
    setCurrentPageEnd(0);
    setCursorStack([]);
    setCurrentPage(1);
  }, [pageSize]);

  const updatePaginationFromResult = useCallback(
    (result: CaseConnection) => {
      console.log('📊 Update pagination result:', {
        hasNextPage: result.pageInfo.hasNextPage,
        hasPreviousPage: result.pageInfo.hasPreviousPage,
        startCursor: result.pageInfo.startCursor,
        endCursor: result.pageInfo.endCursor,
        totalCount: result.totalCount,
        edgesCount: result.edges.length,
        currentAfter: paginationArgs.after,
        currentPage,
      });

      setPageInfo({
        hasNextPage: result.pageInfo.hasNextPage,
        hasPreviousPage: result.pageInfo.hasPreviousPage,
        totalCount: result.totalCount,
        startCursor: result.pageInfo.startCursor,
        endCursor: result.pageInfo.endCursor,
      });

      // Calculate current page range based on actual page number
      const currentCount = result.edges.length;
      if (currentCount > 0) {
        const start = (currentPage - 1) * pageSize + 1;
        const end = start + currentCount - 1;
        setCurrentPageStart(start);
        setCurrentPageEnd(end);
      } else {
        // No results
        setCurrentPageStart(0);
        setCurrentPageEnd(0);
      }
    },
    [currentPage, pageSize, paginationArgs.after]
  );

  // Calculate hasPreviousPage based on our stack and current state
  const hasPreviousPage = Boolean(
    cursorStack.length > 0 || paginationArgs.after
  );

  return {
    paginationArgs,
    hasNextPage: pageInfo.hasNextPage,
    hasPreviousPage,
    totalCount: pageInfo.totalCount,
    currentPageStart,
    currentPageEnd,
    loadNextPage,
    loadPreviousPage,
    resetPagination,
    updatePaginationFromResult,
  };
};
