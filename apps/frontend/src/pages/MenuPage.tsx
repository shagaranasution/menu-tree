import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import MenuTree from '../components/MenuTree';
import MenuTreeSkeleton from '../components/MenuTreeSkeleton';
import { useMenus } from '../hooks/useMenus';
import AddMenuModal from '../components/AddMenuModal';
import type { MenuItem } from '../types';
import EditMenuModal from '../components/EditMenuModal';
import DeleteMenuConfirmModal from '../components/DeleteMenuConfirmModal';

type MenuForm = {
  title: string;
  description: string | null;
};

export default function MenuPage() {
  const { menus, loading, error, refetch: refreshMenus } = useMenus();

  const [parentMenu, setParentMenu] = useState<MenuItem | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleAddChild = (item: MenuItem) => {
    setParentMenu(item);
    setAddModalOpen(true);
  };

  const handleSubmit = async (data: MenuForm) => {
    await fetch('http://localhost:3001/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        parentId: parentMenu?.id,
        order: 0,
      }),
    });

    setAddModalOpen(false);
    refreshMenus();
  };

  const handleEdit = (item: MenuItem) => {
    console.log('handle edit:', item);
    setEditItem(item);
    setEditModalOpen(true);
  };

  const submitEdit = async (data: MenuForm) => {
    if (!editItem) return;

    await fetch(`http://localhost:3001/api/menus/${editItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setEditModalOpen(false);
    refreshMenus();
  };

  const handleDelete = (item: MenuItem) => {
    setDeleteItem(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    await fetch(`http://localhost:3001/api/menus/${deleteItem.id}`, {
      method: 'DELETE',
    });

    setDeleteModalOpen(false);
    refreshMenus();
  };

  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-10">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
        <span>/</span>
        <span>Menus</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-semibold mb-8">Menus</h1>

      {/* Menu Selector */}
      <div className="mb-6 max-w-xs">
        <label className="block text-sm font-medium mb-1">Menu</label>
        <button className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-gray-700">
          <span>system management</span>
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left: Tree Section */}
        <div className="lg:w-1/2">
          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-4">
            <button className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm">
              Expand All
            </button>

            <button className="px-4 py-2 rounded-full bg-white border text-gray-700 text-sm">
              Collapse All
            </button>
          </div>

          {loading && <MenuTreeSkeleton />}
          {error && <div className="text-red-600">Failed to load menus.</div>}
          {menus.length > 0 && (
            <MenuTree
              data={menus}
              onSelect={(item) => console.log('selected', item)}
              onAddChild={handleAddChild}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Right: Form Section */}
        <div className="lg:w-1/2">
          <div className="space-y-6">
            {/* Menu ID */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Menu ID
              </label>
              <input
                readOnly
                className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-xl"
                placeholder="Generated automatically"
              />
            </div>

            {/* Depth */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Depth</label>
              <input
                readOnly
                className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-xl"
                placeholder="—"
              />
            </div>

            {/* Parent Data */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Parent Data
              </label>
              <input
                className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl"
                placeholder="—"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl"
                placeholder="—"
              />
            </div>

            {/* Save Button */}
            <button className="w-full lg:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-medium">
              Save
            </button>
          </div>
        </div>
      </div>

      <AddMenuModal
        open={addModalOpen}
        parentMenu={parentMenu}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <EditMenuModal
        open={editModalOpen}
        item={editItem}
        onClose={() => setEditModalOpen(false)}
        onSubmit={submitEdit}
      />

      <DeleteMenuConfirmModal
        open={deleteModalOpen}
        itemTitle={deleteItem?.title ?? ''}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
