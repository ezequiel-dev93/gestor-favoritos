import { toast } from "sonner";

export const notifySuccess = (message: string) => {
  toast.success(message);
};

export const notifyError = (message: string) => {
  toast.error(message);
};

export const notifyInfo = (message: string) => {
  toast(message);
};

export const notifyConfirm = (
  message: string,
  actionLabel: string,
  onConfirm: () => void
) => {
  toast(message, {
    action: {
      label: actionLabel,
      onClick: onConfirm,
    },
  });
};
