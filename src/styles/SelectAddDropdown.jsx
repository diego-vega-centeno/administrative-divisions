const addPanel = {
  position: 'sticky',
  top: 0,
  zIndex: 100
}

const addTools = {
  paddingTop: '.2rem',
  paddingBottom: '.3rem',
  paddingLeft: '1rem',
  backgroundColor: 'var(--color-primary)',
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

const infoAddBox = {
  backgroundColor: 'var(--color-primary)',
  zIndex: '100',
  color: 'white',
  padding: '.5rem 1rem',
  borderBottom: '1px solid black',
}

export { addToolsButton, addTools, treeContainer, infoAddBox, addPanel }