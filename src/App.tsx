import {
  Box,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { SuperDataGrid } from './components/SuperDataGrid';

import type {
  SuperGridColDef,
  SuperGridRowModel,
  ColumnGroup,
} from './components/SuperDataGrid';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const rows: SuperGridRowModel[] = [
  // Group 1 header
  {
    id: 'g1',
    _isGroupHeader: true,
    _groupId: 'dept-eng',
    _groupLabel: 'Engineering Department',
    name: '',
    age: null,
    city: '',
    salary: null,
    department: '',
    role: '',
  },
  { id: 1, name: 'Alice Johnson', age: 32, city: 'Milan', salary: 75000, department: 'Engineering', role: 'Senior Dev', _groupId: 'dept-eng' },
  { id: 2, name: 'Bob Smith', age: 28, city: 'Rome', salary: 65000, department: 'Engineering', role: 'Dev', _groupId: 'dept-eng' },
  { id: 3, name: 'Clara Rossi', age: 35, city: 'Turin', salary: 85000, department: 'Engineering', role: 'Lead', _groupId: 'dept-eng' },
  // Group 2 header
  {
    id: 'g2',
    _isGroupHeader: true,
    _groupId: 'dept-sales',
    _groupLabel: 'Sales Department',
    name: '',
    age: null,
    city: '',
    salary: null,
    department: '',
    role: '',
  },
  { id: 4, name: 'David Chen', age: 41, city: 'Florence', salary: 70000, department: 'Sales', role: 'Manager', _groupId: 'dept-sales' },
  { id: 5, name: 'Emma Bianchi', age: 29, city: 'Naples', salary: 55000, department: 'Sales', role: 'Rep', _groupId: 'dept-sales' },
  // Group 3 header
  {
    id: 'g3',
    _isGroupHeader: true,
    _groupId: 'dept-hr',
    _groupLabel: 'HR Department',
    name: '',
    age: null,
    city: '',
    salary: null,
    department: '',
    role: '',
  },
  { id: 6, name: 'Frank Marino', age: 38, city: 'Bologna', salary: 60000, department: 'HR', role: 'Director', _groupId: 'dept-hr' },
  { id: 7, name: 'Grace Verdi', age: 26, city: 'Venice', salary: 48000, department: 'HR', role: 'Specialist', _groupId: 'dept-hr' },
  // No-group row
  { id: 8, name: 'Henry Ford', age: 55, city: 'Genoa', salary: 120000, department: 'Executive', role: 'CEO' },
];

const columns: SuperGridColDef[] = [
  { field: 'name', headerName: 'Name', width: 180, pinnable: true },
  { field: 'age', headerName: 'Age', width: 80, type: 'number', pinnable: true },
  { field: 'city', headerName: 'City', width: 120 },
  { field: 'salary', headerName: 'Salary (€)', width: 120, type: 'number' },
  { field: 'department', headerName: 'Department', width: 140 },
  { field: 'role', headerName: 'Role', width: 120 },
];

const columnGroups: ColumnGroup[] = [
  {
    groupId: 'personal',
    headerName: 'Personal Info',
    children: [{ field: 'name' }, { field: 'age' }, { field: 'city' }],
  },
  {
    groupId: 'work',
    headerName: 'Work Info',
    children: [{ field: 'salary' }, { field: 'department' }, { field: 'role' }],
  },
];

function App() {
  const handleCellAction = (action: string, context: unknown) => {
    console.log('Cell action:', action, context);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          🗃️ SuperDataGrid
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          MUI X Data Grid Community con feature Pro personalizzate
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Features:</strong>{' '}
            Cell Selection (click + drag, Shift+frecce, Ctrl+A) •{' '}
            Column Selection (click header) •{' '}
            Row Grouping (espandi/comprimi) •{' '}
            Column Groups (nascondi/mostra) •{' '}
            Context Menu (tasto destro su cella, colonna) •{' '}
            Column Pinning (via context menu)
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <SuperDataGrid
            rows={rows}
            columns={columns}
            columnGroups={columnGroups}
            height={520}
            onCellAction={handleCellAction}
          />
        </Paper>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Prova: Tasto destro su una cella per il context menu • Clicca
            sull&apos;header della colonna per selezionarla • Trascina sulle celle per
            selezionare un range • Usa ▶ per espandere/comprimere i gruppi di righe •
            Clicca sull&apos;occhio nell&apos;header del gruppo per nascondere/mostrare colonne
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
