import React, { useCallback, useRef, useEffect } from 'react';
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
import { GridContextMenu } from './components/GridContextMenu';
import { ColumnGroupHeader } from './components/ColumnGroupHeader';
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseSelecting = useRef(false);

  // --- Hooks ---
  const { pinnedColumns: _pinnedColumns, pinColumn, unpinColumn, isPinned } = useColumnPinning();
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

  const visibleColumns = columns.filter(c => isColumnVisible(c.field));

  const {
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
  } = useCellSelection(visibleRows.length, visibleColumns.length);

  // --- Context menu action handler ---
  const handleContextMenuAction = useCallback(
    (action: string, ctx: ContextMenuState['context']) => {
      switch (action) {
        case 'pin-left':
          if (ctx.field) pinColumn(ctx.field, 'left');
          break;
        case 'pin-right':
          if (ctx.field) pinColumn(ctx.field, 'right');
          break;
        case 'unpin':
          if (ctx.field) unpinColumn(ctx.field);
          break;
        case 'hide-column':
          if (ctx.field) hideColumn(ctx.field);
          break;
        case 'hide-group': {
          if (ctx.field) {
            const group = columnGroups.find(g =>
              g.children.some(c => c.field === ctx.field),
            );
            if (group) hideColumnGroup(group.groupId);
          }
          break;
        }
        case 'toggle-group':
          if (ctx.rowId !== undefined) {
            const row = visibleRows.find(
              r => (r as SuperGridRowModel).id === ctx.rowId,
            ) as SuperGridRowModel | undefined;
            if (row?._isGroupHeader) toggleRowGroup(row._groupId);
          }
          break;
        case 'select-row':
          if (ctx.rowId !== undefined) selectRow(ctx.rowId);
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
      visibleRows,
      selectRow,
      onCellAction,
    ],
  );

  // --- Keyboard handler ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        selectAll();
        return;
      }
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }
      if (e.shiftKey) {
        if (e.key === 'ArrowUp') { e.preventDefault(); expandSelection('up'); }
        if (e.key === 'ArrowDown') { e.preventDefault(); expandSelection('down'); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); expandSelection('left'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); expandSelection('right'); }
      }
    },
    [selectAll, clearSelection, expandSelection],
  );

  // --- Stop mouse selection on mouseup anywhere ---
  useEffect(() => {
    const handleMouseUp = () => {
      if (isMouseSelecting.current) {
        isMouseSelecting.current = false;
        endSelection();
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [endSelection]);

  // --- Build column grouping model for DataGrid ---
  const columnGroupingModel: GridColumnGroupingModel = columnGroups
    .filter(g => isGroupVisible(g.groupId))
    .map(g => ({
      groupId: g.groupId,
      headerName: g.headerName,
      children: g.children
        .filter(c => isColumnVisible(c.field))
        .map(c => ({ field: c.field })),
      renderHeaderGroup: () => (
        <ColumnGroupHeader
          group={g}
          isVisible={isGroupVisible(g.groupId)}
          onToggle={(gid) =>
            isGroupVisible(gid) ? hideColumnGroup(gid) : showColumnGroup(gid)
          }
        />
      ),
    }));

  // --- Build augmented columns ---
  const augmentedColumns: GridColDef[] = visibleColumns.map((col, colIndex) => {
    const { pinnable: _pinnable, groupId: _groupId, ...colDef } = col;
    const pinSide = isPinned(colDef.field);
    const colSelected = isColumnSelected(colDef.field);

    return {
      ...colDef,
      renderHeader: (params: GridColumnHeaderParams) => {
        // suppress unused warning
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
            onContextMenu={(e) => {
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
        const rowIndex = visibleRows.findIndex(
          r => (r as SuperGridRowModel).id === params.row.id,
        );
        const cellSelected = isCellSelected(rowIndex, colIndex);
        const rowSelected = isRowSelected(params.row.id as string | number);
        const colHighlighted = colSelected;

        // Group header row — only render expand/collapse on the first visible column
        if ((params.row as SuperGridRowModel)._isGroupHeader && colIndex === 0) {
          const row = params.row as SuperGridRowModel;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRowGroup(row._groupId);
                }}
                sx={{ p: 0 }}
              >
                {row._isGroupCollapsed ? (
                  <ChevronRightIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
              <Typography variant="body2" fontWeight={600}>
                {row._groupLabel ?? row._groupId}
              </Typography>
            </Box>
          );
        }

        const highlighted = cellSelected || rowSelected || colHighlighted;
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: highlighted ? 'rgba(25, 118, 210, 0.15)' : 'inherit',
              outline: cellSelected ? '1px solid #1976d2' : 'none',
              px: 0.5,
            }}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              isMouseSelecting.current = true;
              startSelection({ rowIndex, colIndex });
            }}
            onMouseEnter={() => {
              if (isMouseSelecting.current) {
                updateSelection({ rowIndex, colIndex });
              }
            }}
            onContextMenu={(e) => {
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
            {colDef.renderCell ? null : String(params.value ?? '')}
          </Box>
        );
      },
    };
  });

  // Sort columns: left-pinned first, then normal, then right-pinned
  const sortedColumns = [
    ...augmentedColumns.filter(c => isPinned(c.field as string) === 'left'),
    ...augmentedColumns.filter(c => !isPinned(c.field as string)),
    ...augmentedColumns.filter(c => isPinned(c.field as string) === 'right'),
  ];

  return (
    <Box
      ref={containerRef}
      sx={{ width, userSelect: 'none' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      <DataGrid
        rows={visibleRows}
        columns={sortedColumns}
        columnGroupingModel={columnGroupingModel.length > 0 ? columnGroupingModel : undefined}
        columnVisibilityModel={visibilityModel}
        onColumnVisibilityModelChange={setVisibilityModel}
        disableRowSelectionOnClick
        sx={{
          height,
          width: '100%',
          '& .MuiDataGrid-cell': { p: 0 },
          '& .MuiDataGrid-columnHeader': { p: 0 },
        }}
        getRowClassName={(params) => {
          const row = params.row as SuperGridRowModel;
          if (row._isGroupHeader) return 'row-group-header';
          if (isRowSelected(params.row.id as string | number)) return 'row-selected';
          return '';
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
