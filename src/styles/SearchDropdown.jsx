const dropdown = {
  backgroundColor: '#F8F9FA',
  height: '2.3rem',
  paddingLeft: '0.8rem',
  '&:hover': {
    backgroundColor: '#D3D4D5'
  },
  '&:active': {
    backgroundColor: '#C6C7C8'
  }
}

const dropdownIcon = (isOpen) => ({
  width: '0.7rem',
  fontSize: '1rem',
  paddingRight: '0.5rem',
  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
  transformOrigin: '25% 50%',
  transition: 'transform ease 0.2s'
});

const searchFieldBox = {
  display: 'flex',
  margin: '0.4rem 1rem',
  height: '2.5rem'
}

const searchField = {
  backgroundColor: 'white',
  flex:'1',
  '& .MuiInputBase-input': {
    padding: '.25rem .5rem',
    fontSize: '.9rem',
    height: '100%'
  },
  '& .MuiInputBase-root': {
    height: '100%'
  }
}

const searchFieldIconBox = {
  border: '1px solid grey',
  borderRadius: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#6C757D',
  }
}

export { dropdown, dropdownIcon, searchFieldBox, searchField, searchFieldIconBox }