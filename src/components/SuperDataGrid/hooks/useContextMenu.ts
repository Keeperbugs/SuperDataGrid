import { useState, useCallback } from 'react';
import type { ContextMenuState } from '../types';

const initialState: ContextMenuState = {
  position: null,
  target: null,
  context: {},
};

export function useContextMenu() {
  const [menuState, setMenuState] = useState<ContextMenuState>(initialState);

  const openMenu = useCallback(
    (
      x: number,
      y: number,
      target: 'cell' | 'column' | 'row',
      context: ContextMenuState['context'],
    ) => {
      setMenuState({ position: { x, y }, target, context });
    },
    [],
  );

  const closeMenu = useCallback(() => {
    setMenuState(initialState);
  }, []);

  return { menuState, openMenu, closeMenu };
}
