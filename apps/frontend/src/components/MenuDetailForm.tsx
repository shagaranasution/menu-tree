import { useMemo } from 'react';
import { buildMenuSelectOption } from '../utils';
import SearchableSelect from './SearchableSelect';

import type { MenuItem } from '../types';

export type OnFormChangeParams = { name: string; value: string };

type MenuDetailFormProps = {
  item: MenuItem;
  allMenus: MenuItem[];
  onFormChange?: (val: OnFormChangeParams) => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  onResetForm?: () => void;
};

export default function MenuDetailForm({
  item,
  allMenus,
  onFormChange,
  onSubmit,
  onDelete,
  onResetForm,
}: MenuDetailFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  const menuSelectOptions = useMemo(
    () => buildMenuSelectOption(allMenus),
    [allMenus]
  );

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
          <label
            htmlFor="parentId"
            className="block text-sm text-gray-600 mb-1">
            Parent
          </label>

          <SearchableSelect
            options={menuSelectOptions}
            value={item.parentId ?? ''}
            onChange={(value) => {
              onFormChange?.({ name: 'parentId', value: value || '' });
            }}
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm text-gray-600 mb-1">
            Name
          </label>
          <input
            name="title"
            value={item.title}
            placeholder="Menu Name"
            className="w-full bg-white px-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
            onChange={(e) =>
              onFormChange?.({ name: e.target.name, value: e.target.value })
            }
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            className="w-auto sm:w-[98px] px-8 py-3 bg-blue-800 text-white rounded-full font-medium">
            {item.id ? 'Save' : 'Add'}
          </button>

          <button
            type="button"
            onClick={onResetForm}
            className="px-8 py-3 bg-white border border-gray-400 rounded-full font-medium">
            Reset
          </button>

          {item.id && (
            <button
              type="button"
              onClick={onDelete}
              className="px-8 py-3 bg-red-600 text-white border rounded-full font-medium">
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
