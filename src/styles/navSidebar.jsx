const navSideBox = {
  backgroundColor: 'var(--color-secondary)',
  height: '100%',
  width: '20rem'
}

const navSideBarIcon = {
  fontSize: '1.5rem',
  padding: 2,
  '&:hover': {
    backgroundColor: 'red',
  },
  color: 'white'
}

const navSideBarButton = {
  padding: '.4rem',
  '&:hover': { backgroundColor: '#6C757D' }
}

const navSideItem = {
  color: 'white',
  '&:hover':{backgroundColor: '#6C757D'}
}

export { navSideBox, navSideBarIcon, navSideItem, navSideBarButton }