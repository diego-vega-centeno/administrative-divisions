const basicMenu = {
  backgroundColor: '#F8F9FA',
  width: 'clamp(500px, 45vw, 45vw)',
  maxHeight: '80vh',
  padding: '.8rem 1rem',
  borderRadius: '5px',
  boxShadow: '3px 3px 3px 3px rgba(0, 0, 0, 0.5)',
  fontSize: '.9rem',
  '& > .MuiTypography-root, & > .MuiTextField-root, & > .MuiBox-root, & > .MuiTableContainer-root': {
    marginBottom: '.5rem',
    fontFamily: 'Oswald, sans-serif'
  },
  display: 'flex',
  flexDirection: 'column',
  '@media (max-width:600px)': {
    width: '100vw',
    minWidth: '350px',
    borderRadius: 0,
    padding: '1rem',
  },
}

const menuHeader = {
  padding: '.2rem 1rem',
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  borderRadius: '5px'
}

const textField = {
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    padding: '0.5rem',
  },
}

const tableCell = {
  padding: '.1rem .5rem',
  backgroundColor: 'white'
}

const headerCell = {
  padding: '.1rem .7rem',
  backgroundColor: '#212529',
  color: 'white',
}

const compareTableSortLabel = {
  '&:hover': {
    color: 'grey',
  },
  '&:hover .MuiTableSortLabel-icon': {
    color: '#0bff0b',
  },
  '&.Mui-active': {
    color: 'white',
  },
  '&.Mui-active .MuiTableSortLabel-icon': {
    color: '#0bff0b',
  },
}

const subHeaderCell = {
  padding: 0,
  backgroundColor: '#4a4f55',
  color: 'white',
  fontSize: '.75rem'
}

const headerCellContent = {
  minHeight: '2rem',
  position: 'relative',
  padding: '.1rem 0',
}

const headerCellToolsContainer = {
  display: 'flex',
  position: 'absolute',
  top: 0,
  right: 0,
  opacity: 0,
  visibility: "hidden",
}

const headerCellConfirmContainer = {
  display: 'flex',
  position: 'absolute',
  top: 0,
  right: 0,
}

const headerCellToolsButton = {
  width: '1.5rem',
  minWidth: 0,
  fontSize: '.9rem',
  color: 'white',
  '&:hover': {
    backgroundColor: 'grey'
  },
  borderRadius: '5px'
}

const favoritesMenuCheckbox = {
  width: '3rem',
  minWidth: 0,
  fontSize: '1rem',
  borderRadius: '5px',
}

const favoritesMenuCheckboxCell = {
  width: 0,
  padding: 0
}

const tableContainer = {
  overflowY: 'auto',
  flex: 1
}

const table = {
  overflow: 'hidden',
  border: '1px solid black',
  borderRadius: '5px',
  marginBottom: '1rem',

  borderCollapse: 'separate',
  borderSpacing: 0,
}

const modalCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const saveMenuEditText = {
  width: '100%',
  margin: '.8rem 0',
  backgroundColor: 'white',
  '& .MuiInputBase-input': {
    fontSize: '1rem',
    padding: '.2rem 0.5rem',
  },
  borderRadius: '5px',
}

const compareTableContainer = {
  overflowY: 'auto',
  flex: 1,
  width: '90%',
  marginX: 'auto',
  marginY: '2rem'
}

const tableContainerHeader = {
  backgroundColor: 'var(--color-secondary)',
  marginTop: '1rem',
  paddingLeft: '2rem',
  color: 'white'
}

export {
  basicMenu, menuHeader, textField, table, tableCell, headerCell,
  subHeaderCell, tableContainer, modalCenter,
  headerCellContent, headerCellToolsContainer, headerCellToolsButton,
  headerCellConfirmContainer, favoritesMenuCheckbox, favoritesMenuCheckboxCell,
  saveMenuEditText, compareTableContainer,compareTableSortLabel, tableContainerHeader
}