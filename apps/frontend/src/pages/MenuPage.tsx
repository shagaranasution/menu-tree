import { useMemo, useState } from 'react';
import MenuTree from '../components/MenuTree';
import MenuTreeSkeleton from '../components/MenuTreeSkeleton';
import { useMenus } from '../hooks/useMenus';
import AddMenuModal from '../components/AddMenuModal';
import EditMenuModal from '../components/EditMenuModal';
import SearchableSelect from '../components/SearchableSelect';
import DeleteMenuConfirmModal from '../components/DeleteMenuConfirmModal';
import {
  buildMenuSelectOption,
  buildTree,
  collectAllIds,
  computeInsertIndex,
  findNodeAndParent,
} from '../utils';

import type { MenuItem } from '../types';
import MenuDetailForm, {
  type OnFormChangeParams,
} from '../components/MenuDetailForm';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const initialFormValue: MenuItem = {
  id: '',
  parentId: '',
  title: '',
};

export default function MenuPage() {
  const {
    menus,
    loading,
    error,
    refetch: refreshMenus,
    moveMenu,
    reorderMenu,
  } = useMenus();
  const menuTree = useMemo(() => buildTree(menus), [menus]);

  const [formValue, setFormValue] = useState<MenuItem>(initialFormValue);

  const [parentMenu, setParentMenu] = useState<MenuItem | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedMenuOption, setSelectedMenuOption] = useState<string | null>(
    null
  );

  const menuSelectOptions = useMemo(
    () => buildMenuSelectOption(menus),
    [menus]
  );

  const handleAddChild = (item: MenuItem) => {
    setParentMenu(item);
    setAddModalOpen(true);
  };

  const handleSubmitCreation = async (data: Omit<MenuItem, 'id'>) => {
    await fetch(`${baseUrl}/api/menus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        parentId: data.parentId || parentMenu?.id,
      }),
    });

    setAddModalOpen(false);
    refreshMenus();
  };

  const handleMenuSelect = (item: MenuItem) => {
    setEditItem(null);
    setFormValue(item);
  };

  const handleEdit = (item: MenuItem) => {
    setFormValue(initialFormValue);
    setEditItem(item);
    setEditModalOpen(true);
  };

  const submitEdit = async (data: Omit<MenuItem, 'id'>) => {
    const id = editItem?.id || formValue.id;

    if (!id) return;

    await fetch(`${baseUrl}/api/menus/${id}`, {
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

    await fetch(`${baseUrl}/api/menus/${deleteItem.id}`, {
      method: 'DELETE',
    });

    setDeleteModalOpen(false);
    setFormValue(initialFormValue);
    refreshMenus();
  };

  const handleFormChange = ({ name, value }: OnFormChangeParams) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = () => {
    setFormValue(initialFormValue);
    // Do update as selected item is provided, if not do post instead
    if (formValue.id !== '') {
      submitEdit(formValue);
    } else {
      handleSubmitCreation(formValue);
    }
  };

  const handleMenuSelectChange = async (value: string | null) => {
    setSelectedMenuOption(value);
    if (value) {
      try {
        const menu = await fethMenuById(value);

        setFormValue(menu);
      } catch (err) {
        console.error((err as Error).message);
      }
    }
  };

  const fethMenuById = async (id: string): Promise<MenuItem> => {
    const res = await fetch(`${baseUrl}/api/menus/${id}`);

    if (!res.ok) throw new Error('Fail to fetch menu data');

    const data = (await res.json()) as MenuItem;

    return data;
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleExpandable = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = (allMenuIds: string[]) => {
    setExpandedIds(new Set(allMenuIds));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleDrop = async ({
    draggedId,
    targetId,
    position,
  }: {
    draggedId: string;
    targetId: string;
    position: 'inside' | 'before' | 'after';
  }) => {
    try {
      if (draggedId === targetId) return;

      // find dragged node and its parent
      const { node: draggedNode, parent: draggedParent } = findNodeAndParent(
        menuTree,
        draggedId
      );

      const { node: targetNode, parent: targetParent } = findNodeAndParent(
        menuTree,
        targetId
      );

      if (!draggedNode || !targetNode) {
        console.warn('Dragged or target node not found');
        return;
      }

      // Prevent moving into own descendant (frontend guard)
      // find all descendants of draggedNode
      const collectDescendants = (parent: MenuItem): string[] => {
        const out: string[] = [];

        (function walk(menu: MenuItem) {
          if (!menu.children) return;

          for (const child of menu.children) {
            out.push(child.id);

            walk(child);
          }
        })(parent);

        return out;
      };

      const draggedDescendants = collectDescendants(draggedNode);
      if (draggedDescendants.includes(targetId)) {
        alert('Cannot move an item into one of its own descendants.');
        return;
      }

      // CASE A: dropped inside -> move as last child of target (or explicit order if you want)
      if (position === 'inside') {
        // move to target as parent, without specifying order (backend will append last)
        await moveMenu(draggedId, { parentId: targetId, order: undefined });
        return;
      }

      // CASE B: dropped before/after -> insert among target's siblings
      // siblings are array of children from targetParent (parent of targetNode)
      const siblings = targetParent ? targetParent.children ?? [] : menuTree;

      const newIndex = computeInsertIndex(
        siblings,
        targetId,
        position === 'before' ? 'before' : 'after'
      );

      // If moving within the same parent and original index < newIndex, newIndex should be decremented after removal of dragged node
      let adjustedIndex = newIndex;

      if ((draggedParent?.id ?? null) === (targetParent?.id ?? null)) {
        // find index of dragged in siblings
        const originalIndex = siblings.findIndex((s) => s.id === draggedId);
        if (originalIndex === -1) {
          // fallback: use reorder API directly
          await reorderMenu(draggedId, newIndex);
          return;
        }
        // If dragged originates before the insertion point and we remove it first, the insertion index shifts left by 1
        if (originalIndex < newIndex) adjustedIndex = Math.max(0, newIndex - 1);
      }

      // If dropping into a different parent, call move with specified order so backend will insert at index and shift siblings
      if ((draggedParent?.id ?? null) !== (targetParent?.id ?? null)) {
        await moveMenu(draggedId, {
          parentId: targetParent?.id ?? null,
          order: adjustedIndex,
        });
        return;
      }

      // Same parent -> reorder
      await reorderMenu(draggedId, adjustedIndex);
    } catch (err) {
      console.error('Drop error', err);
      alert('Failed to perform move/reorder: ' + (err as Error).message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white p-6 md:p-10">
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
        <SearchableSelect
          options={menuSelectOptions}
          value={selectedMenuOption}
          onChange={handleMenuSelectChange}
        />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left: Tree Section */}
        <div className="md:w-1/2">
          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-4">
            <button
              className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm"
              onClick={() => expandAll(collectAllIds(menuTree))}>
              Expand All
            </button>

            <button
              className="px-4 py-2 rounded-full bg-white border text-gray-700 text-sm"
              onClick={collapseAll}>
              Collapse All
            </button>
          </div>

          {loading && <MenuTreeSkeleton />}
          {error && (
            <div className="text-red-600">Failed to load menu data.</div>
          )}
          {!loading && menus.length === 0 && (
            <p>There is no created menu yet. You can create one using form.</p>
          )}
          {!loading && menus.length > 0 && (
            <MenuTree
              data={menuTree}
              expandedIds={expandedIds}
              onExpand={handleExpandable}
              onSelect={handleMenuSelect}
              onAddChild={handleAddChild}
              onEdit={handleEdit}
              onDrop={handleDrop}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Right: Form Section */}
        <div className="md:w-1/2">
          <MenuDetailForm
            item={formValue}
            allMenus={menus}
            onFormChange={handleFormChange}
            onSubmit={handleFormSubmit}
            onDelete={() => {
              handleDelete(formValue);
            }}
            onResetForm={() => {
              setFormValue(initialFormValue);
            }}
          />
        </div>
      </div>

      <AddMenuModal
        open={addModalOpen}
        parentMenu={parentMenu}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleSubmitCreation}
      />

      <EditMenuModal
        open={editModalOpen}
        item={editItem}
        onClose={() => setEditModalOpen(false)}
        onSubmit={(item) => {
          if (editItem) {
            submitEdit(item);
          }
        }}
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
