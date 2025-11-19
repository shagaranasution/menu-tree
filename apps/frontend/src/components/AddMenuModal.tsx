import { useState } from 'react';
import type { MenuItem } from '../types';

type AddMenuModalProps = {
  open: boolean;
  parentMenu: MenuItem | null;
  onClose: () => void;
  onSubmit: (data: { title: string }) => void;
};

export default function AddMenuModal({
  open,
  parentMenu,
  onClose,
  onSubmit,
}: AddMenuModalProps) {
  const [title, setTitle] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 mx-4 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          Add Child Menu {parentMenu ? `(Parent: ${parentMenu.title})` : ''}
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Menu Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={() => {
                setTitle('');
                onClose();
              }}>
              Cancel
            </button>

            <button
              className="px-4 py-2 rounded bg-blue-800 text-white"
              onClick={() => {
                setTitle('');
                onSubmit({
                  title,
                });
              }}>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
