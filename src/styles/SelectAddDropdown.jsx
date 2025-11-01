const addTools = {
  paddingTop: '.2rem',
  paddingBottom: '.5rem',
  paddingLeft: '1rem',
  borderBottom: '1px solid black'
}

const addToolsButton = {
  backgroundColor: 'var(--color-secondary)',
  minWidth: '45px',
  fontSize: '.7rem',
  color: 'var(--color-text)',
  textTransform: 'none',
  padding: '.5rem .5rem',
  lineHeight: 1.2,
  margin: '.2rem',
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--color-secondary) 70%, white);'
  },
}

const treeContainer = {
  padding: '.5rem'
}

export { addToolsButton, addTools, treeContainer }