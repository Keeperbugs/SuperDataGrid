import { useState, useCallback, useMemo } from 'react';
import type { GridSortModel, GridSortItem } from '@mui/x-data-grid';
import type { SuperGridRowModel } from '../types';

function cmpValues(a: unknown, b: unknown, sort: GridSortItem): number {
  if (a === null || a === undefined) return sort.sort === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return sort.sort === 'asc' ? -1 : 1;
  let cmp = 0;
  if (typeof a === 'number' && typeof b === 'number') {
    cmp = a - b;
  } else {
    cmp = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  }
  return sort.sort === 'desc' ? -cmp : cmp;
}

function sortBlock(block: SuperGridRowModel[], sortModel: GridSortModel): SuperGridRowModel[] {
  return [...block].sort((a, b) => {
    for (const sort of sortModel) {
      const cmp = cmpValues(
        (a as Record<string, unknown>)[sort.field],
        (b as Record<string, unknown>)[sort.field],
        sort,
      );
      if (cmp !== 0) return cmp;
    }
    return 0;
  });
}

export function useSorting(rows: SuperGridRowModel[]) {
  const [sortModel, setSortModelState] = useState<GridSortModel>([]);

  const setSortModel = useCallback((model: GridSortModel) => {
    setSortModelState(model);
  }, []);

  const sortedRows = useMemo(() => {
    if (sortModel.length === 0) return rows;

    const hasGroups = rows.some(r => r._isGroupHeader);
    if (!hasGroups) return sortBlock(rows, sortModel);

    // Sort within each group independently, preserving group header positions
    const result: SuperGridRowModel[] = [];
    let i = 0;
    while (i < rows.length) {
      const row = rows[i];
      if (row._isGroupHeader) {
        const groupId = row._groupId;
        const children: SuperGridRowModel[] = [];
        let j = i + 1;
        while (j < rows.length && !rows[j]._isGroupHeader) {
          if (rows[j]._groupId === groupId) children.push(rows[j]);
          j++;
        }
        result.push(row, ...sortBlock(children, sortModel));
        i = j;
      } else {
        // Row without group — treat as its own block
        const ungrouped: SuperGridRowModel[] = [];
        let j = i;
        while (j < rows.length && !rows[j]._isGroupHeader && !rows[j]._groupId) {
          ungrouped.push(rows[j]);
          j++;
        }
        result.push(...sortBlock(ungrouped, sortModel));
        i = j;
      }
    }
    return result;
  }, [rows, sortModel]);

  return { sortModel, sortedRows, setSortModel };
}
