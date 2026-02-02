import Dialog from '@mui/material/Dialog';
import Alert from '@mui/material/Alert';

export default function AlertDialog({ severity, message, open, onClose }) {
  return (
    <Dialog
      open={open}
      slotProps={{
        paper: {
          sx: {
            position: 'fixed',
            top: '10vh',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: 'none',
            backgroundColor: 'transparent',
          }
        }
      }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        sx={{
          whiteSpace: 'pre-line',
          backgroundColor: 'var(--color-primary)',
          color: 'white'
        }}
      >{message}</Alert>
    </Dialog >
  )
}