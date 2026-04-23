import { useState, useCallback } from 'react';
import type { PinnedColumns } from '../types';

export function useColumnPinning(initialPinned: PinnedColumns = {}) {
  const [pinnedColumns, setPinnedColumns] = useState<PinnedColumns>({
    left: initialPinned.left ?? [],
    right: initialPinned.right ?? [],
  });

  const pinColumn = useCallback((field: string, side: 'left' | 'right') => {
    setPinnedColumns(prev => {
      const newLeft = (prev.left ?? []).filter(f => f !== field);
      const newRight = (prev.right ?? []).filter(f => f !== field);
      if (side === 'left') {
        return { left: [...newLeft, field], right: newRight };
      } else {
        return { left: newLeft, right: [...newRight, field] };
      }
    });
  }, []);

  const unpinColumn = useCallback((field: string) => {
    setPinnedColumns(prev => ({
      left: (prev.left ?? []).filter(f => f !== field),
      right: (prev.right ?? []).filter(f => f !== field),
    }));
  }, []);

  const isPinned = useCallback(
    (field: string): 'left' | 'right' | false => {
      if (pinnedColumns.left?.includes(field)) return 'left';
      if (pinnedColumns.right?.includes(field)) return 'right';
      return false;
    },
    [pinnedColumns],
  );

  return { pinnedColumns, pinColumn, unpinColumn, isPinned };
}
