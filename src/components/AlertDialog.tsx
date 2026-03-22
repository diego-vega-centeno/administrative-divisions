import Dialog from "@mui/material/Dialog";
import Alert, {
  AlertColor,
  AlertPropsColorOverrides,
} from "@mui/material/Alert";
import { Dispatch, SetStateAction } from "react";
import { OverridableStringUnion } from "@mui/types";

interface AlertDialogProps {
  severity: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>;
  message: string | null;
  open: boolean;
  onClose: () => void;
}

export default function AlertDialog({
  severity,
  message,
  open,
  onClose,
}: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      slotProps={{
        paper: {
          sx: {
            position: "fixed",
            top: "10vh",
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: "none",
            backgroundColor: "transparent",
          },
        },
      }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        sx={{
          whiteSpace: "pre-line",
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
      >
        {message}
      </Alert>
    </Dialog>
  );
}
