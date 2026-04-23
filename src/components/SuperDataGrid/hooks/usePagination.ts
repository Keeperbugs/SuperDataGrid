import { useState, useMemo } from 'react';
import type { GridPaginationModel } from '@mui/x-data-grid';
import type { SuperGridRowModel } from '../types';

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function usePagination(
  rows: SuperGridRowModel[],
  pageSizeOptions: number[] = DEFAULT_PAGE_SIZE_OPTIONS,
) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const { paginatedRows, rowCount } = useMemo(() => {
    const { page, pageSize } = paginationModel;
    return {
      paginatedRows: rows.slice(page * pageSize, (page + 1) * pageSize),
      rowCount: rows.length,
    };
  }, [rows, paginationModel]);

  return {
    paginationModel,
    paginatedRows,
    rowCount,
    setPaginationModel,
    pageSizeOptions,
  };
}
