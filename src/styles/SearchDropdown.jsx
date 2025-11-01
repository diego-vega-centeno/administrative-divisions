const dropdown = {
  backgroundColor: 'var(--color-secondary)',
  color: 'var(--color-text)',
  height: '2.3rem',
  paddingLeft: '0.8rem',
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--color-secondary) 90%, white);'
  },
  border: '0.5px solid black',
  '&:active': {
    backgroundColor: 'color-mix(in srgb, var(--color-secondary) 70%, white);'
  },
  '& .MuiTypography-root': {
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: '-0.03em',
    fontWeight: '500',
    textShadow: '0 0 0.3px currentColor'
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
  height: '2.2rem'
}

const searchField = {
  backgroundColor: 'var(--color-secondary)',
  flex: '1',
  '& .MuiInputBase-input': {
    color: 'white',
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

const progressIcon = {
  display: 'flex',
  justifyContent: 'center',
  padding: '0.7rem 0',
  '& .MuiCircularProgress-root': {
    color: 'green',
  }
}

export {
  dropdown, dropdownIcon, searchFieldBox, searchField,
  searchFieldIconBox, progressIcon
}