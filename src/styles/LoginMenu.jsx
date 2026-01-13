const selectionIcon = {
  fontSize: '1.5rem',
  color: '#4285F4',
  marginRight: '0.5rem'
}

const selection = {
  '&:hover': {
    backgroundColor: '#f0f0f0',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75rem 1rem',
  borderRadius: '5px',
  border: '1px solid #e0e0e0',
  backgroundColor: '#F8F9FA',
  cursor: 'pointer',
  marginBottom: '0.5rem'
}

const menu = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem'
}

const menuContainer = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#F8F9FA',
  minWidth: '350px',
  maxWidth: '400px',
  zIndex: '1001',
  padding: '1rem',
  borderRadius: '5px',
  boxShadow: '3px 3px 3px 3px rgba(0, 0, 0, 0.5)',
  fontSize: '0.8rem',
  border: '1px solid #e0e0e0'
}

const menuHeader = {
  margin: '0 0 1rem 0',
  textAlign: 'center',
  fontSize: '1.1rem'
}

const menuDescription = {
  textAlign: 'center',
  marginBottom: '1rem',
  fontSize: '0.9rem',
  color: '#666'
}

export { selection, selectionIcon, menu, menuContainer, menuHeader, menuDescription }