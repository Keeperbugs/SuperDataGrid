import { useState, useCallback } from 'react';
import type { CellSelectionState, CellCoord, GridRowId } from '../types';

const initialState: CellSelectionState = {
  start: null,
  end: null,
  selectedColumns: [],
  selectedRows: [],
  isSelecting: false,
};

export function useCellSelection(rowCount: number, colCount: number) {
  const [selection, setSelection] = useState<CellSelectionState>(initialState);

  const startSelection = useCallback((coord: CellCoord) => {
    setSelection({
      start: coord,
      end: coord,
      selectedColumns: [],
      selectedRows: [],
      isSelecting: true,
    });
  }, []);

  const updateSelection = useCallback((coord: CellCoord) => {
    setSelection(prev => {
      if (!prev.isSelecting) return prev;
      return { ...prev, end: coord };
    });
  }, []);

  const endSelection = useCallback(() => {
    setSelection(prev => ({ ...prev, isSelecting: false }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(initialState);
  }, []);

  const expandSelection = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      setSelection(prev => {
        if (!prev.end) return prev;
        const { rowIndex, colIndex } = prev.end;
        let newRow = rowIndex;
        let newCol = colIndex;
        if (direction === 'up') newRow = Math.max(0, rowIndex - 1);
        if (direction === 'down') newRow = Math.min(rowCount - 1, rowIndex + 1);
        if (direction === 'left') newCol = Math.max(0, colIndex - 1);
        if (direction === 'right') newCol = Math.min(colCount - 1, colIndex + 1);
        return { ...prev, end: { rowIndex: newRow, colIndex: newCol } };
      });
    },
    [rowCount, colCount],
  );

  const selectAll = useCallback(() => {
    setSelection({
      start: { rowIndex: 0, colIndex: 0 },
      end: { rowIndex: rowCount - 1, colIndex: colCount - 1 },
      selectedColumns: [],
      selectedRows: [],
      isSelecting: false,
    });
  }, [rowCount, colCount]);

  const selectColumn = useCallback((field: string) => {
    setSelection(prev => {
      const alreadySelected = prev.selectedColumns.includes(field);
      return {
        ...initialState,
        selectedColumns: alreadySelected
          ? prev.selectedColumns.filter(f => f !== field)
          : [...prev.selectedColumns, field],
      };
    });
  }, []);

  const selectRow = useCallback((rowId: GridRowId) => {
    setSelection(prev => {
      const alreadySelected = prev.selectedRows.includes(rowId);
      return {
        ...initialState,
        selectedRows: alreadySelected
          ? prev.selectedRows.filter(id => id !== rowId)
          : [...prev.selectedRows, rowId],
      };
    });
  }, []);

  const isCellSelected = useCallback(
    (rowIndex: number, colIndex: number): boolean => {
      if (!selection.start || !selection.end) return false;
      const minRow = Math.min(selection.start.rowIndex, selection.end.rowIndex);
      const maxRow = Math.max(selection.start.rowIndex, selection.end.rowIndex);
      const minCol = Math.min(selection.start.colIndex, selection.end.colIndex);
      const maxCol = Math.max(selection.start.colIndex, selection.end.colIndex);
      return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
    },
    [selection],
  );

  const isColumnSelected = useCallback(
    (field: string): boolean => selection.selectedColumns.includes(field),
    [selection],
  );

  const isRowSelected = useCallback(
    (rowId: GridRowId): boolean => selection.selectedRows.includes(rowId),
    [selection],
  );

  return {
    selection,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    expandSelection,
    selectAll,
    selectColumn,
    selectRow,
    isCellSelected,
    isColumnSelected,
    isRowSelected,
  };
}
