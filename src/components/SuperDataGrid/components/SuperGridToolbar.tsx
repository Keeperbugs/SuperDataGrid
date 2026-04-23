import React from 'react';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { Box } from '@mui/material';

export const SuperGridToolbar: React.FC = () => (
  <GridToolbarContainer sx={{ gap: 0.5, px: 1, py: 0.5, flexWrap: 'wrap' }}>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarDensitySelector />
    <GridToolbarExport />
    <Box sx={{ flex: 1 }} />
    <GridToolbarQuickFilter debounceMs={300} />
  </GridToolbarContainer>
);
