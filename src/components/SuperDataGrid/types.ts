import type { GridColDef, GridRowModel, GridColumnVisibilityModel } from '@mui/x-data-grid';

export type GridRowId = string | number;

export interface PinnedColumns {
  left?: string[];
  right?: string[];
}

export interface CellCoord {
  rowIndex: number;
  colIndex: number;
}

export interface CellSelectionState {
  start: CellCoord | null;
  end: CellCoord | null;
  selectedColumns: string[];
  selectedRows: GridRowId[];
  isSelecting: boolean;
}

export interface RowGroup {
  groupId: string;
  label: string;
  collapsed: boolean;
}

export type SuperGridColDef = GridColDef & {
  pinnable?: boolean;
  groupId?: string;
};

export interface SuperGridRowModel extends GridRowModel {
  _groupId?: string;
  _groupLabel?: string;
  _isGroupHeader?: boolean;
  _isGroupCollapsed?: boolean;
}

export interface ContextMenuState {
  position: { x: number; y: number } | null;
  target: 'cell' | 'column' | 'row' | null;
  context: {
    field?: string;
    rowId?: GridRowId;
    value?: unknown;
    rowIndex?: number;
    colIndex?: number;
  };
}

export interface ColumnGroup {
  groupId: string;
  headerName: string;
  children: { field: string }[];
}

export interface SuperDataGridProps {
  rows: SuperGridRowModel[];
  columns: SuperGridColDef[];
  columnGroups?: ColumnGroup[];
  height?: number | string;
  width?: number | string;
  onCellAction?: (action: string, context: unknown) => void;
}

// Re-export to satisfy unused import lint
export type { GridColumnVisibilityModel };
