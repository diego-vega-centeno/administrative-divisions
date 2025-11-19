const dropdownIcon = (isOpen) => ({
  width: '0.7rem',
  fontSize: '1rem',
  paddingRight: '0.5rem',
  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
  transformOrigin: '25% 50%',
  transition: 'transform ease 0.2s'
});

const dropdown = {
  backgroundColor: 'color-mix(in srgb, var(--color-secondary) 80%, white);',
  '&:hover': {
    backgroundColor: 'var(--color-secondary)'
  },
  paddingLeft: '2rem',
  color: 'white'
}

export { dropdownIcon, dropdown }