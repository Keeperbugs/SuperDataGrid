import { useState, useCallback, useMemo } from 'react';
import type { SuperGridRowModel } from '../types';

export function useRowGrouping(rows: SuperGridRowModel[]) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const toggleRowGroup = useCallback((groupId: string | undefined) => {
    if (!groupId) return;
    setCollapsedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId],
    );
  }, []);

  const isGroupCollapsed = useCallback(
    (groupId: string): boolean => collapsedGroups.includes(groupId),
    [collapsedGroups],
  );

  const visibleRows = useMemo(() => {
    return rows
      .map(row => ({
        ...row,
        _isGroupCollapsed: row._isGroupHeader
          ? collapsedGroups.includes(row._groupId ?? '')
          : undefined,
      }))
      .filter(row => {
        if (!row._groupId) return true;
        if (row._isGroupHeader) return true;
        return !collapsedGroups.includes(row._groupId);
      });
  }, [rows, collapsedGroups]);

  return { visibleRows, collapsedGroups, toggleRowGroup, isGroupCollapsed };
}
