import AddFavoriteForm from "@/ui/features/AddFavoriteForm/AddFavoriteForm";
import { Modal } from "@/ui/components/Modal";


interface AddFavoriteModalProps {
  url: string;
  folder?: string | null;
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const AddFavoriteModal: React.FC<AddFavoriteModalProps> = ({ url, folder, open, onClose, onSave }) => {
  return (
    <Modal open={open} onClose={onClose} title="Guardar favorito">
      <AddFavoriteForm
        url={url}
        initialFolder={folder || undefined}
        onSave={() => {
          onSave && onSave();
          onClose();
        }}
      />
    </Modal>
  );
};
