import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { ColumnGroup } from '../types';

interface ColumnGroupHeaderProps {
  group: ColumnGroup;
  isVisible: boolean;
  onToggle: (groupId: string) => void;
}

export const ColumnGroupHeader: React.FC<ColumnGroupHeaderProps> = ({
  group,
  isVisible,
  onToggle,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        px: 1,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {group.headerName}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onToggle(group.groupId)}
        title={isVisible ? 'Nascondi gruppo' : 'Mostra gruppo'}
        sx={{ p: 0.5 }}
      >
        {isVisible ? (
          <VisibilityIcon fontSize="inherit" />
        ) : (
          <VisibilityOffIcon fontSize="inherit" />
        )}
      </IconButton>
    </Box>
  );
};
