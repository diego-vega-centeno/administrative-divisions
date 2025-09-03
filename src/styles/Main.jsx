const progressMapIcon = {
  display: 'flex',
  justifyContent: 'center',
  padding: '0.7rem 0',
  '& .MuiCircularProgress-root': {
    color: '#3F7251',
  },
  position: 'absolute',
  zIndex: '1000'
}

const progressDownloadIcon = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  '& .MuiCircularProgress-root': {
    color: '#3F7251',
  }
}

export { progressMapIcon, progressDownloadIcon }