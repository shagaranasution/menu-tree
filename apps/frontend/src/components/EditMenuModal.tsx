import { useEffect, useState } from 'react';
import type { MenuItem } from '../types';

interface Props {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string | null }) => void;
}

export default function EditMenuModal({
  open,
  item,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (item) {
      const id = setTimeout(() => {
        setTitle(item.title);
        setDescription(item.description || '');
      }, 0);
      return () => clearTimeout(id);
    }
  }, [item]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Edit Menu</h2>

        <div className="space-y-4">
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Menu Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}></textarea>

          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>
              Cancel
            </button>

            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={() =>
                onSubmit({
                  title,
                  description: description || null,
                })
              }>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
