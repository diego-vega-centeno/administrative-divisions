const listItem = {
  backgroundColor: 'var(--color-primary)',
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--color-secondary) 90%, white)'
  },
  color: 'white',
  border: '0.5px solid black',
  padding: '0.2rem 0.7rem'
}

const listBox = {
  padding: '0.5rem 0'
}

export {listItem, listBox}