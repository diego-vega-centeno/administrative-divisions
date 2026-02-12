const progressMapIcon = {
  display: 'flex',
  justifyContent: 'center',
  padding: '0.7rem 0',
  '& .MuiCircularProgress-root': {
    color: '#3F7251',
    strokeLinecap: 'round'
  },
  position: 'absolute',
  zIndex: '1000'
}

const progressIcon = {
  display: 'flex',
  justifyContent: 'center',
  padding: '0.7rem 0',
  '& .MuiCircularProgress-root': {
    color: '#3F7251',
    strokeLinecap: 'round'
  }
}

const saveActionSection = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  '& .MuiCircularProgress-root': {
    color: '#3F7251',
  },
  '& > .MuiTypography-root': {
    color: '#3F7251',
    fontWeight: '600'
  }
}

export { progressMapIcon, saveActionSection, progressIcon }