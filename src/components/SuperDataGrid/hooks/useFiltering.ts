import { useState, useCallback, useMemo } from 'react';
import type { GridFilterModel, GridFilterItem } from '@mui/x-data-grid';
import type { SuperGridColDef, SuperGridRowModel } from '../types';

function matchesFilterItem(value: unknown, item: GridFilterItem): boolean {
  const { operator, value: fv } = item;
  const isEmpty = (v: unknown) => v === null || v === undefined || String(v).trim() === '';

  if (operator === 'isEmpty') return isEmpty(value);
  if (operator === 'isNotEmpty') return !isEmpty(value);
  if (isEmpty(fv)) return true;

  const strVal = String(value ?? '').toLowerCase();
  const strFilter = String(fv ?? '').toLowerCase();
  const numVal = Number(value);
  const numFilter = Number(fv);

  switch (operator) {
    case 'contains': return strVal.includes(strFilter);
    case 'doesNotContain': return !strVal.includes(strFilter);
    case 'equals':
    case '=': return !isNaN(numVal) && !isNaN(numFilter) ? numVal === numFilter : strVal === strFilter;
    case 'doesNotEqual':
    case '!=': return !isNaN(numVal) && !isNaN(numFilter) ? numVal !== numFilter : strVal !== strFilter;
    case 'startsWith': return strVal.startsWith(strFilter);
    case 'endsWith': return strVal.endsWith(strFilter);
    case '>': return numVal > numFilter;
    case '>=': return numVal >= numFilter;
    case '<': return numVal < numFilter;
    case '<=': return numVal <= numFilter;
    case 'is': return strVal === strFilter;
    case 'not': return strVal !== strFilter;
    case 'isAnyOf': {
      const arr = Array.isArray(fv) ? fv.map(String).map(s => s.toLowerCase()) : [];
      return arr.includes(strVal);
    }
    case 'after': return new Date(value as string) > new Date(fv as string);
    case 'onOrAfter': return new Date(value as string) >= new Date(fv as string);
    case 'before': return new Date(value as string) < new Date(fv as string);
    case 'onOrBefore': return new Date(value as string) <= new Date(fv as string);
    default: return true;
  }
}

export function useFiltering(rows: SuperGridRowModel[], columns: SuperGridColDef[]) {
  const [filterModel, setFilterModelState] = useState<GridFilterModel>({ items: [] });

  const setFilterModel = useCallback((model: GridFilterModel) => {
    setFilterModelState(model);
  }, []);

  const filteredRows = useMemo(() => {
    const { items = [], logicOperator = 'and', quickFilterValues = [] } = filterModel;

    const activeItems = items.filter(item => {
      if (['isEmpty', 'isNotEmpty'].includes(item.operator)) return true;
      const v = item.value;
      return v !== undefined && v !== null && v !== '';
    });

    const quickText = quickFilterValues.filter(Boolean).join(' ').toLowerCase();

    // Separate data rows from group header rows
    const dataRows = rows.filter(r => !r._isGroupHeader);

    // Apply column filters
    let filtered = dataRows;
    if (activeItems.length > 0) {
      filtered = dataRows.filter(row => {
        const results = activeItems.map(item => {
          if (!columns.find(c => c.field === item.field)) return true;
          return matchesFilterItem((row as Record<string, unknown>)[item.field], item);
        });
        return logicOperator === 'or' ? results.some(Boolean) : results.every(Boolean);
      });
    }

    // Apply quick filter across all columns
    if (quickText) {
      filtered = filtered.filter(row =>
        columns.some(col =>
          String((row as Record<string, unknown>)[col.field] ?? '').toLowerCase().includes(quickText),
        ),
      );
    }

    // No group headers in data — return filtered data directly
    if (!rows.some(r => r._isGroupHeader)) return filtered;

    // Rebuild rows preserving group structure: keep group header only if it has ≥1 visible child
    const filteredIds = new Set(filtered.map(r => r.id));
    const visibleGroupIds = new Set(
      filtered.map(r => r._groupId).filter((id): id is string => Boolean(id)),
    );

    const result: SuperGridRowModel[] = [];
    for (const row of rows) {
      if (row._isGroupHeader) {
        if (visibleGroupIds.has(row._groupId ?? '')) result.push(row);
      } else if (filteredIds.has(row.id)) {
        result.push(row);
      }
    }
    return result;
  }, [rows, columns, filterModel]);

  return { filterModel, filteredRows, setFilterModel };
}
