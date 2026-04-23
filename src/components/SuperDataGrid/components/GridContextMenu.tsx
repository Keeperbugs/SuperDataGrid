import React from 'react';
import {
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { ContextMenuState } from '../types';

interface GridContextMenuProps {
  menuState: ContextMenuState;
  onClose: () => void;
  onAction: (action: string, context: ContextMenuState['context']) => void;
}

type MenuItem_ =
  | { action: string; icon: React.ReactNode; label: string }
  | null;

export const GridContextMenu: React.FC<GridContextMenuProps> = ({
  menuState,
  onClose,
  onAction,
}) => {
  const { position, target, context } = menuState;

  const handleAction = (action: string) => {
    onAction(action, context);
    onClose();
  };

  const cellMenuItems: MenuItem_[] = [
    { action: 'copy-cell', icon: <ContentCopyIcon fontSize="small" />, label: 'Copia cella' },
    { action: 'copy-row', icon: <ContentCopyIcon fontSize="small" />, label: 'Copia riga' },
    { action: 'copy-range', icon: <ContentCopyIcon fontSize="small" />, label: 'Copia range selezionato' },
    { action: 'filter-value', icon: <FilterListIcon fontSize="small" />, label: 'Filtra per questo valore' },
  ];

  const columnMenuItems: MenuItem_[] = [
    { action: 'pin-left', icon: <PushPinIcon fontSize="small" />, label: 'Pinna a sinistra' },
    { action: 'pin-right', icon: <PushPinIcon fontSize="small" />, label: 'Pinna a destra' },
    { action: 'unpin', icon: <PushPinIcon fontSize="small" />, label: 'Rimuovi pin' },
    null,
    { action: 'hide-column', icon: <VisibilityOffIcon fontSize="small" />, label: 'Nascondi colonna' },
    { action: 'hide-group', icon: <VisibilityOffIcon fontSize="small" />, label: 'Nascondi gruppo' },
    null,
    { action: 'sort-asc', icon: <ArrowUpwardIcon fontSize="small" />, label: 'Ordina crescente' },
    { action: 'sort-desc', icon: <ArrowDownwardIcon fontSize="small" />, label: 'Ordina decrescente' },
    { action: 'filter-column', icon: <FilterListIcon fontSize="small" />, label: 'Filtra colonna' },
  ];

  const rowMenuItems: MenuItem_[] = [
    { action: 'select-row', icon: <ExpandMoreIcon fontSize="small" />, label: 'Seleziona riga' },
    { action: 'copy-row', icon: <ContentCopyIcon fontSize="small" />, label: 'Copia riga' },
    { action: 'toggle-group', icon: <ChevronRightIcon fontSize="small" />, label: 'Espandi/Comprimi gruppo' },
  ];

  const items: MenuItem_[] =
    target === 'cell'
      ? cellMenuItems
      : target === 'column'
        ? columnMenuItems
        : target === 'row'
          ? rowMenuItems
          : [];

  const headerLabel =
    target === 'cell'
      ? `Cella: ${String(context.field)} (Riga ${String(context.rowIndex ?? '')})`
      : target === 'column'
        ? `Colonna: ${String(context.field)}`
        : `Riga: ${String(context.rowId)}`;

  return (
    <Menu
      open={position !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={position ? { top: position.y, left: position.x } : undefined}
      slotProps={{ paper: { sx: { minWidth: 200 } } }}
    >
      {target && (
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {headerLabel}
          </Typography>
        </MenuItem>
      )}
      <Divider />
      {items.map((item, i) =>
        item === null ? (
          <Divider key={`div-${i}`} />
        ) : (
          <MenuItem key={item.action} onClick={() => handleAction(item.action)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ),
      )}
    </Menu>
  );
};
