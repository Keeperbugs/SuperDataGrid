import { useState, useCallback } from 'react';
import type { GridColumnVisibilityModel } from '@mui/x-data-grid';
import type { ColumnGroup, SuperGridColDef } from '../types';

export function useColumnVisibility(
  _columns: SuperGridColDef[],
  columnGroups: ColumnGroup[] = [],
  initialModel: GridColumnVisibilityModel = {},
) {
  const [visibilityModel, setVisibilityModel] =
    useState<GridColumnVisibilityModel>(initialModel);

  const toggleColumn = useCallback((field: string) => {
    setVisibilityModel(prev => ({
      ...prev,
      [field]: prev[field] === false ? true : false,
    }));
  }, []);

  const hideColumn = useCallback((field: string) => {
    setVisibilityModel(prev => ({ ...prev, [field]: false }));
  }, []);

  const showColumn = useCallback((field: string) => {
    setVisibilityModel(prev => ({ ...prev, [field]: true }));
  }, []);

  const hideColumnGroup = useCallback(
    (groupId: string) => {
      const group = columnGroups.find(g => g.groupId === groupId);
      if (!group) return;
      const updates: GridColumnVisibilityModel = {};
      group.children.forEach(({ field }) => {
        updates[field] = false;
      });
      setVisibilityModel(prev => ({ ...prev, ...updates }));
    },
    [columnGroups],
  );

  const showColumnGroup = useCallback(
    (groupId: string) => {
      const group = columnGroups.find(g => g.groupId === groupId);
      if (!group) return;
      const updates: GridColumnVisibilityModel = {};
      group.children.forEach(({ field }) => {
        updates[field] = true;
      });
      setVisibilityModel(prev => ({ ...prev, ...updates }));
    },
    [columnGroups],
  );

  const isGroupVisible = useCallback(
    (groupId: string): boolean => {
      const group = columnGroups.find(g => g.groupId === groupId);
      if (!group) return true;
      return group.children.some(({ field }) => visibilityModel[field] !== false);
    },
    [columnGroups, visibilityModel],
  );

  const isColumnVisible = useCallback(
    (field: string): boolean => visibilityModel[field] !== false,
    [visibilityModel],
  );

  return {
    visibilityModel,
    setVisibilityModel,
    toggleColumn,
    hideColumn,
    showColumn,
    hideColumnGroup,
    showColumnGroup,
    isGroupVisible,
    isColumnVisible,
  };
}
