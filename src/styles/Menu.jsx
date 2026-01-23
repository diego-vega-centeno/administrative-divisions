const backdrop = {
  position: 'fixed',
  inset: '0',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000
}

const basicMenu = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#F8F9FA',
  minWidth: '300px',
  zIndex: '1001',
  padding: '.8rem 1rem',
  borderRadius: '5px',
  boxShadow: '3px 3px 3px 3px rgba(0, 0, 0, 0.5)',
  fontSize: '.9rem',
  '& .MuiTypography-root, & .MuiTextField-root, & .MuiBox-root, & .MuiTableContainer-root': {
    marginBottom: '.5rem',
    fontFamily: 'Oswald, sans-serif'
  }
}

const textField = {
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    padding: '0.5rem',
  },
}

const tableCell = {
  padding: '.1rem 0rem'
}

const headerCell = {
  padding: '.1rem 0rem',
  backgroundColor: '#212529',
  color: 'white'
}

const tableContainer = {
  border: '1px solid black',
  borderRadius: '5px',
  overflow: 'hidden',
}

export { backdrop, basicMenu, textField, tableCell, headerCell, tableContainer }