interface Props {
  open: boolean;
  itemTitle: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteMenuConfirmModal({
  open,
  itemTitle,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Delete Menu</h2>

        <p className="mb-4">
          Are you sure you want to delete <strong>{itemTitle}</strong>? This
          action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded bg-red-600 text-white"
            onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
