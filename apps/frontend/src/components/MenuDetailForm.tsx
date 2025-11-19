import type { MenuItem } from '../types';

interface MenuDetailFormProps {
  item: MenuItem;
  allMenus: MenuItem[];
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  onResetForm?: () => void;
}

export default function MenuDetailForm({
  item,
  allMenus,
  onChange,
  onSubmit,
  onDelete,
  onResetForm,
}: MenuDetailFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  const depth = item?.depth ?? 0;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id" className="block text-sm text-gray-600 mb-1">
            Menu ID
          </label>
          <input
            readOnly
            name="id"
            value={item.id ?? ''}
            className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-xl cursor-not-allowed"
            placeholder="Generated automatically"
          />
        </div>

        <div>
          <label htmlFor="depth" className="block text-sm text-gray-600 mb-1">
            Depth
          </label>
          <input
            readOnly
            name="depth"
            value={depth}
            className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-xl cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="parentId"
            className="block text-sm text-gray-600 mb-1">
            Parent
          </label>
          <select
            name="parentId"
            value={item.parentId ?? ''}
            className="w-full border border-gray-400 p-2 rounded bg-white"
            onChange={onChange}>
            <option value="">No Parent (Root)</option>
            {allMenus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm text-gray-600 mb-1">
            Name
          </label>
          <input
            name="title"
            value={item.title}
            placeholder="Menu Name"
            className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-xl"
            onChange={onChange}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="w-full lg:w-auto px-8 py-3 bg-blue-800 text-white rounded-full font-medium">
            {item.id ? 'Save' : 'Add'}
          </button>

          <button
            type="button"
            onClick={onResetForm}
            className="w-full lg:w-auto px-8 py-3 bg-white border border-gray-400 rounded-full font-medium">
            Reset
          </button>

          {item.id && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full lg:w-auto px-8 py-3 bg-red-600 text-white border rounded-full font-medium">
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
