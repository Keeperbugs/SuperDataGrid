import { useCallback } from 'react';
import type { SuperGridColDef, SuperGridRowModel, CellSelectionState } from '../types';

export function useClipboard(rows: SuperGridRowModel[], visibleCols: SuperGridColDef[]) {
  const copySelection = useCallback(
    async (selection: CellSelectionState): Promise<void> => {
      let text = '';

      if (selection.start && selection.end) {
        const minR = Math.min(selection.start.rowIndex, selection.end.rowIndex);
        const maxR = Math.max(selection.start.rowIndex, selection.end.rowIndex);
        const minC = Math.min(selection.start.colIndex, selection.end.colIndex);
        const maxC = Math.max(selection.start.colIndex, selection.end.colIndex);
        const lines: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const row = rows[r];
          if (!row) continue;
          const cells: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const col = visibleCols[c];
            if (!col) continue;
            cells.push(String((row as Record<string, unknown>)[col.field] ?? ''));
          }
          lines.push(cells.join('\t'));
        }
        text = lines.join('\n');
      } else if (selection.selectedRows.length > 0) {
        const selected = rows.filter(r =>
          selection.selectedRows.includes(r.id as string | number),
        );
        text = selected
          .map(row =>
            visibleCols
              .map(col => String((row as Record<string, unknown>)[col.field] ?? ''))
              .join('\t'),
          )
          .join('\n');
      } else if (selection.selectedColumns.length > 0) {
        const selectedCols = visibleCols.filter(c =>
          selection.selectedColumns.includes(c.field),
        );
        const header = selectedCols.map(c => c.headerName ?? c.field).join('\t');
        const data = rows
          .filter(r => !r._isGroupHeader)
          .map(row =>
            selectedCols
              .map(col => String((row as Record<string, unknown>)[col.field] ?? ''))
              .join('\t'),
          )
          .join('\n');
        text = `${header}\n${data}`;
      }

      if (text) {
        await navigator.clipboard.writeText(text).catch(() => undefined);
      }
    },
    [rows, visibleCols],
  );

  return { copySelection };
}
