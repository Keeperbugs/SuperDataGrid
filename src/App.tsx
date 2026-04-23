import {
  Box,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Chip,
  Stack,
} from '@mui/material';
import { SuperDataGrid } from './components/SuperDataGrid';
import type { SuperGridColDef, SuperGridRowModel, ColumnGroup } from './components/SuperDataGrid';

const theme = createTheme({ palette: { mode: 'light' } });

// ---- data ------------------------------------------------------------------
const rows: SuperGridRowModel[] = [
  // Engineering
  { id: 'g1', _isGroupHeader: true, _groupId: 'eng', _groupLabel: 'Engineering', name: '', age: null, city: '', salary: null, department: '', role: '', active: null },
  { id: 1,  name: 'Alice Johnson',  age: 32, city: 'Milan',    salary: 75000,  department: 'Engineering', role: 'Senior Dev',  active: true,  _groupId: 'eng' },
  { id: 2,  name: 'Bob Smith',      age: 28, city: 'Rome',     salary: 65000,  department: 'Engineering', role: 'Dev',         active: true,  _groupId: 'eng' },
  { id: 3,  name: 'Clara Rossi',    age: 35, city: 'Turin',    salary: 85000,  department: 'Engineering', role: 'Lead',        active: false, _groupId: 'eng' },
  { id: 9,  name: 'Luigi Verdi',    age: 30, city: 'Milan',    salary: 72000,  department: 'Engineering', role: 'Dev',         active: true,  _groupId: 'eng' },
  { id: 10, name: 'Sara Neri',      age: 27, city: 'Rome',     salary: 61000,  department: 'Engineering', role: 'Junior Dev',  active: true,  _groupId: 'eng' },
  // Sales
  { id: 'g2', _isGroupHeader: true, _groupId: 'sales', _groupLabel: 'Sales', name: '', age: null, city: '', salary: null, department: '', role: '', active: null },
  { id: 4,  name: 'David Chen',     age: 41, city: 'Florence', salary: 70000,  department: 'Sales',       role: 'Manager',     active: true,  _groupId: 'sales' },
  { id: 5,  name: 'Emma Bianchi',   age: 29, city: 'Naples',   salary: 55000,  department: 'Sales',       role: 'Rep',         active: false, _groupId: 'sales' },
  { id: 11, name: 'Marco Bruno',    age: 33, city: 'Palermo',  salary: 58000,  department: 'Sales',       role: 'Rep',         active: true,  _groupId: 'sales' },
  { id: 12, name: 'Giulia Ricci',   age: 36, city: 'Florence', salary: 68000,  department: 'Sales',       role: 'Sr. Rep',     active: true,  _groupId: 'sales' },
  // HR
  { id: 'g3', _isGroupHeader: true, _groupId: 'hr', _groupLabel: 'HR', name: '', age: null, city: '', salary: null, department: '', role: '', active: null },
  { id: 6,  name: 'Frank Marino',   age: 38, city: 'Bologna',  salary: 60000,  department: 'HR',          role: 'Director',    active: true,  _groupId: 'hr' },
  { id: 7,  name: 'Grace Verdi',    age: 26, city: 'Venice',   salary: 48000,  department: 'HR',          role: 'Specialist',  active: true,  _groupId: 'hr' },
  { id: 13, name: 'Luca Ferrari',   age: 31, city: 'Bologna',  salary: 52000,  department: 'HR',          role: 'Analyst',     active: false, _groupId: 'hr' },
  // No group
  { id: 8,  name: 'Henry Ford',     age: 55, city: 'Genoa',    salary: 120000, department: 'Executive',   role: 'CEO',         active: true },
  { id: 14, name: 'Sofia Russo',    age: 44, city: 'Milan',    salary: 95000,  department: 'Executive',   role: 'CFO',         active: true },
  { id: 15, name: 'Paolo Esposito', age: 49, city: 'Rome',     salary: 88000,  department: 'Executive',   role: 'COO',         active: true },
];

const columns: SuperGridColDef[] = [
  { field: 'name',       headerName: 'Name',       width: 180, pinnable: true, editable: true },
  { field: 'age',        headerName: 'Age',        width: 80,  type: 'number', pinnable: true, editable: true },
  { field: 'city',       headerName: 'City',       width: 120, editable: true },
  {
    field: 'salary',
    headerName: 'Salary (€)',
    width: 130,
    type: 'number',
    editable: true,
    // Custom renderCell is now called correctly (bug fix)
    renderCell: params => {
      if (params.value == null || params.value === '') return null;
      const v = Number(params.value);
      return (
        <Box sx={{ fontWeight: 600, color: v >= 80000 ? 'success.main' : 'text.primary' }}>
          {v.toLocaleString('it-IT')} €
        </Box>
      );
    },
  },
  { field: 'department', headerName: 'Department', width: 140 },
  { field: 'role',       headerName: 'Role',       width: 130 },
  {
    field: 'active',
    headerName: 'Active',
    width: 100,
    type: 'boolean',
    renderCell: params => {
      if (params.value == null) return null;
      return (
        <Chip
          label={params.value ? 'Sì' : 'No'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      );
    },
  },
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
    children: [{ field: 'salary' }, { field: 'department' }, { field: 'role' }, { field: 'active' }],
  },
];

// ---- App -------------------------------------------------------------------
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, maxWidth: 1300, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          SuperDataGrid
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          MUI X DataGrid Community · feature Pro/Premium custom
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
          {[
            'Cell Selection (drag · Shift+↑↓←→ · Ctrl+A)',
            'Ctrl+C copy',
            'Filtering + Quick Filter',
            'Multi-sort',
            'Pagination',
            'Row Grouping (espandi/comprimi)',
            'Column Pinning',
            'Column Groups (hide/show)',
            'Context Menu',
            'Cell Editing (doppio click)',
            'Custom renderCell ✅ fix',
            'CSV Export',
          ].map(f => (
            <Chip key={f} label={f} size="small" variant="outlined" />
          ))}
        </Stack>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <SuperDataGrid
            rows={rows}
            columns={columns}
            columnGroups={columnGroups}
            height={600}
            showToolbar
            editMode="cell"
            pageSizeOptions={[5, 10, 25]}
            onCellAction={(action, ctx) => console.log('action:', action, ctx)}
            onRowClick={row => console.log('row click:', row)}
          />
        </Paper>

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            💡 Tasto destro su cella/colonna → context menu · Drag su celle per range ·
            Ctrl+A seleziona tutto · Ctrl+C copia · Doppio click su cella per modificare ·
            Clicca ▶ per espandere/comprimere gruppi · Occhio sull&apos;header gruppo → hide/show colonne
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
