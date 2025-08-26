const dropdownIcon = (isOpen) => ({
  width: '0.7rem',
  fontSize: '1rem',
  paddingRight: '0.5rem',
  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
  transformOrigin: '25% 50%',
  transition: 'transform ease 0.2s'
});

export { dropdownIcon }