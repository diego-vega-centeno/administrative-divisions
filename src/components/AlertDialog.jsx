import { Dialog, Alert } from '@mui/material';

export default function AlertDialog({ severity, message, open, onClose }) {
  return (
    <Dialog open={open}>
      <Alert
        severity={severity}
        onClose={onClose}
        sx={{ whiteSpace: 'pre-line' }}
      >{message}</Alert>
    </Dialog>
  )
}