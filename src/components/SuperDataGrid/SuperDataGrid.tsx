import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridColumnHeaderParams,
  type GridColumnGroupingModel,
} from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PushPinIcon from '@mui/icons-material/PushPin';

import { useColumnPinning } from './hooks/useColumnPinning';
import { useCellSelection } from './hooks/useCellSelection';
import { useColumnVisibility } from './hooks/useColumnVisibility';
import { useRowGrouping } from './hooks/useRowGrouping';
import { useContextMenu } from './hooks/useContextMenu';
import { useFiltering } from './hooks/useFiltering';
import { useSorting } from './hooks/useSorting';
import { usePagination } from './hooks/usePagination';
import { useClipboard } from './hooks/useClipboard';
import { GridContextMenu } from './components/GridContextMenu';
import { ColumnGroupHeader } from './components/ColumnGroupHeader';
import { SuperGridToolbar } from './components/SuperGridToolbar';
import type {
  SuperDataGridProps,
  SuperGridRowModel,
  ContextMenuState,
} from './types';

import './SuperDataGrid.css';

export const SuperDataGrid: React.FC<SuperDataGridProps> = ({
  rows,
  columns,
  columnGroups = [],
  height = 500,
  width = '100%',
  onCellAction,
  pageSizeOptions = [10, 25, 50, 100],
  rowCount: externalRowCount,
  loading,
  checkboxSelection,
  editMode,
  processRowUpdate,
  onProcessRowUpdateError,
  onRowClick,
  onCellClick,
  showToolbar = true,
  pinnedColumns: externalPinnedColumns,
  onPinnedColumnsChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseSelecting = useRef(false);

  // --- Core hooks ---
  const { pinColumn, unpinColumn, isPinned, pinnedColumns } = useColumnPinning();
  const { visibleRows, toggleRowGroup } = useRowGrouping(rows);
  const {
    visibilityModel,
    setVisibilityModel,
    hideColumn,
    hideColumnGroup,
    showColumnGroup,
    isGroupVisible,
    isColumnVisible,
  } = useColumnVisibility(columns, columnGroups);
  const { menuState, openMenu, closeMenu } = useContextMenu();

  const effectivePinnedColumns = externalPinnedColumns ?? pinnedColumns;

  // Columns after visibility filter
  const visibleColumnList = useMemo(
    () => columns.filter(c => isColumnVisible(c.field)),
    [columns, isColumnVisible],
  );

  // --- Data pipeline: group collapse → filter → sort → paginate ---
  const { filterModel, filteredRows, setFilterModel } = useFiltering(visibleRows, visibleColumnList);
  const { sortModel, sortedRows, setSortModel } = useSorting(filteredRows);
  const {
    paginationModel,
    paginatedRows,
    rowCount: internalRowCount,
    setPaginationModel,
  } = usePagination(sortedRows, pageSizeOptions);

  const effectiveRowCount = externalRowCount ?? internalRowCount;

  // Reset to first page whenever filter changes
  const handleFilterModelChange = useCallback(
    (model: typeof filterModel) => {
      setFilterModel(model);
      setPaginationModel(prev => ({ ...prev, page: 0 }));
    },
    [setFilterModel, setPaginationModel],
  );

  // --- Cell selection (scoped to the current page) ---
  const {
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
  } = useCellSelection(paginatedRows.length, visibleColumnList.length);

  // --- Clipboard ---
  const { copySelection } = useClipboard(paginatedRows, visibleColumnList);

  // --- Context menu action handler ---
  const handleContextMenuAction = useCallback(
    (action: string, ctx: ContextMenuState['context']) => {
      const pinLeft = (field: string) => {
        pinColumn(field, 'left');
        onPinnedColumnsChange?.({
          left: [...(effectivePinnedColumns.left ?? []).filter(f => f !== field), field],
          right: (effectivePinnedColumns.right ?? []).filter(f => f !== field),
        });
      };
      const pinRight = (field: string) => {
        pinColumn(field, 'right');
        onPinnedColumnsChange?.({
          left: (effectivePinnedColumns.left ?? []).filter(f => f !== field),
          right: [...(effectivePinnedColumns.right ?? []).filter(f => f !== field), field],
        });
      };
      const unpin = (field: string) => {
        unpinColumn(field);
        onPinnedColumnsChange?.({
          left: (effectivePinnedColumns.left ?? []).filter(f => f !== field),
          right: (effectivePinnedColumns.right ?? []).filter(f => f !== field),
        });
      };

      switch (action) {
        case 'pin-left':
          if (ctx.field) pinLeft(ctx.field);
          break;
        case 'pin-right':
          if (ctx.field) pinRight(ctx.field);
          break;
        case 'unpin':
          if (ctx.field) unpin(ctx.field);
          break;
        case 'hide-column':
          if (ctx.field) hideColumn(ctx.field);
          break;
        case 'hide-group': {
          if (ctx.field) {
            const group = columnGroups.find(g => g.children.some(c => c.field === ctx.field));
            if (group) hideColumnGroup(group.groupId);
          }
          break;
        }
        case 'toggle-group': {
          if (ctx.rowId !== undefined) {
            const row = paginatedRows.find(r => r.id === ctx.rowId) as SuperGridRowModel | undefined;
            if (row?._isGroupHeader) toggleRowGroup(row._groupId);
          }
          break;
        }
        case 'select-row':
          if (ctx.rowId !== undefined) selectRow(ctx.rowId);
          break;
        case 'copy-cell':
        case 'copy-row':
        case 'copy-range':
          void copySelection(selection);
          break;
        default:
          onCellAction?.(action, ctx);
      }
    },
    [
      pinColumn,
      unpinColumn,
      hideColumn,
      hideColumnGroup,
      columnGroups,
      toggleRowGroup,
      paginatedRows,
      selectRow,
      onCellAction,
      effectivePinnedColumns,
      onPinnedColumnsChange,
      copySelection,
      selection,
    ],
  );

  // --- Keyboard shortcuts ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'a') { e.preventDefault(); selectAll(); return; }
      if (ctrl && e.key === 'c') { e.preventDefault(); void copySelection(selection); return; }
      if (e.key === 'Escape') { clearSelection(); return; }
      if (e.shiftKey) {
        if (e.key === 'ArrowUp')    { e.preventDefault(); expandSelection('up'); }
        if (e.key === 'ArrowDown')  { e.preventDefault(); expandSelection('down'); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); expandSelection('left'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); expandSelection('right'); }
      }
    },
    [selectAll, clearSelection, expandSelection, copySelection, selection],
  );

  // End mouse selection on global mouseup
  useEffect(() => {
    const up = () => {
      if (isMouseSelecting.current) {
        isMouseSelecting.current = false;
        endSelection();
      }
    };
    document.addEventListener('mouseup', up);
    return () => document.removeEventListener('mouseup', up);
  }, [endSelection]);

  // --- Column grouping model ---
  const columnGroupingModel: GridColumnGroupingModel = useMemo(
    () =>
      columnGroups
        .filter(g => isGroupVisible(g.groupId))
        .map(g => ({
          groupId: g.groupId,
          headerName: g.headerName,
          children: g.children.filter(c => isColumnVisible(c.field)).map(c => ({ field: c.field })),
          renderHeaderGroup: () => (
            <ColumnGroupHeader
              group={g}
              isVisible={isGroupVisible(g.groupId)}
              onToggle={gid => (isGroupVisible(gid) ? hideColumnGroup(gid) : showColumnGroup(gid))}
            />
          ),
        })),
    [columnGroups, isGroupVisible, isColumnVisible, hideColumnGroup, showColumnGroup],
  );

  // --- Augmented column definitions ---
  const augmentedColumns: GridColDef[] = useMemo(
    () =>
      visibleColumnList.map((col, colIndex) => {
        const { pinnable: _p, groupId: _g, ...colDef } = col;
        const pinSide = isPinned(colDef.field);
        const colSelected = isColumnSelected(colDef.field);

        return {
          ...colDef,
          renderHeader: (params: GridColumnHeaderParams) => {
            void params;
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  width: '100%',
                  backgroundColor: colSelected ? 'rgba(25, 118, 210, 0.12)' : 'inherit',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => selectColumn(colDef.field)}
                onContextMenu={e => {
                  e.preventDefault();
                  openMenu(e.clientX, e.clientY, 'column', { field: colDef.field });
                }}
              >
                {pinSide && (
                  <Tooltip title={`Pinnato a ${pinSide}`}>
                    <PushPinIcon
                      sx={{
                        fontSize: 12,
                        transform: pinSide === 'right' ? 'scaleX(-1)' : 'none',
                        color: 'primary.main',
                      }}
                    />
                  </Tooltip>
                )}
                <Typography variant="inherit" noWrap>
                  {colDef.headerName ?? colDef.field}
                </Typography>
              </Box>
            );
          },

          renderCell: (params: GridRenderCellParams) => {
            const rowIndex = paginatedRows.findIndex(r => r.id === params.row.id);
            const cellSelected = isCellSelected(rowIndex, colIndex);
            const rowSelected = isRowSelected(params.row.id as string | number);

            // Group header: render expand/collapse chevron in first column only
            if ((params.row as SuperGridRowModel)._isGroupHeader && colIndex === 0) {
              const row = params.row as SuperGridRowModel;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={e => { e.stopPropagation(); toggleRowGroup(row._groupId); }}
                    sx={{ p: 0 }}
                  >
                    {row._isGroupCollapsed
                      ? <ChevronRightIcon fontSize="small" />
                      : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                  <Typography variant="body2" fontWeight={600}>
                    {row._groupLabel ?? row._groupId}
                  </Typography>
                </Box>
              );
            }

            const highlighted = cellSelected || rowSelected || colSelected;
            return (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: highlighted ? 'rgba(25, 118, 210, 0.15)' : 'inherit',
                  outline: cellSelected ? '1px solid #1976d2' : 'none',
                  outlineOffset: '-1px',
                  px: 0.5,
                  cursor: 'default',
                  boxSizing: 'border-box',
                }}
                onMouseDown={e => {
                  if (e.button !== 0) return;
                  isMouseSelecting.current = true;
                  startSelection({ rowIndex, colIndex });
                }}
                onMouseEnter={() => {
                  if (isMouseSelecting.current) updateSelection({ rowIndex, colIndex });
                }}
                onContextMenu={e => {
                  e.preventDefault();
                  openMenu(e.clientX, e.clientY, 'cell', {
                    field: colDef.field,
                    rowId: params.row.id as string | number,
                    value: params.value,
                    rowIndex,
                    colIndex,
                  });
                }}
              >
                {/* FIX: call original renderCell if defined, otherwise render value */}
                {colDef.renderCell
                  ? colDef.renderCell(params)
                  : String(params.value ?? '')}
              </Box>
            );
          },
        };
      }),
    // paginatedRows, isCellSelected, isRowSelected, isColumnSelected change on selection/page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      visibleColumnList,
      isPinned,
      isColumnSelected,
      selectColumn,
      openMenu,
      paginatedRows,
      isCellSelected,
      isRowSelected,
      toggleRowGroup,
      startSelection,
      updateSelection,
    ],
  );

  // Left-pinned → normal → right-pinned
  const sortedColumns = useMemo(
    () => [
      ...augmentedColumns.filter(c => isPinned(c.field as string) === 'left'),
      ...augmentedColumns.filter(c => !isPinned(c.field as string)),
      ...augmentedColumns.filter(c => isPinned(c.field as string) === 'right'),
    ],
    [augmentedColumns, isPinned],
  );

  const handleProcessRowUpdate = useCallback(
    async (newRow: SuperGridRowModel, oldRow: SuperGridRowModel): Promise<SuperGridRowModel> =>
      processRowUpdate ? processRowUpdate(newRow, oldRow) : newRow,
    [processRowUpdate],
  );

  return (
    <Box
      ref={containerRef}
      sx={{ width, userSelect: 'none' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onContextMenu={e => e.preventDefault()}
    >
      <DataGrid
        rows={paginatedRows}
        columns={sortedColumns}
        columnGroupingModel={columnGroupingModel.length > 0 ? columnGroupingModel : undefined}
        columnVisibilityModel={visibilityModel}
        onColumnVisibilityModelChange={setVisibilityModel}
        // Server-mode: we handle filter/sort/paginate ourselves to support grouped rows
        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={effectiveRowCount}
        pageSizeOptions={pageSizeOptions}
        slots={showToolbar ? { toolbar: SuperGridToolbar } : undefined}
        disableRowSelectionOnClick
        checkboxSelection={checkboxSelection}
        loading={loading}
        editMode={editMode}
        processRowUpdate={editMode ? handleProcessRowUpdate : undefined}
        onProcessRowUpdateError={onProcessRowUpdateError}
        onRowClick={onRowClick ? params => onRowClick(params.row as SuperGridRowModel) : undefined}
        onCellClick={
          onCellClick
            ? params => onCellClick(params.row as SuperGridRowModel, params.field, params.value)
            : undefined
        }
        isCellEditable={params => {
          if ((params.row as SuperGridRowModel)._isGroupHeader) return false;
          return params.colDef.editable ?? false;
        }}
        getRowClassName={params => {
          const row = params.row as SuperGridRowModel;
          if (row._isGroupHeader) return 'row-group-header';
          if (isRowSelected(params.row.id as string | number)) return 'row-selected';
          return '';
        }}
        sx={{
          height,
          width: '100%',
          '& .MuiDataGrid-cell': { p: 0 },
          '& .MuiDataGrid-columnHeader': { p: 0 },
          // Pinned column visual separator
          '& .col-pinned-left': { borderRight: '2px solid #1976d2' },
          '& .col-pinned-right': { borderLeft: '2px solid #1976d2' },
        }}
      />
      <GridContextMenu
        menuState={menuState}
        onClose={closeMenu}
        onAction={handleContextMenuAction}
      />
    </Box>
  );
};

export default SuperDataGrid;
