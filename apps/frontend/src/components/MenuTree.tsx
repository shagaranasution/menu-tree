import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';

import type { MenuItem } from '../types';

type DropPosition = 'inside' | 'before' | 'after';

type MenuTreeProps = {
  data: MenuItem[];
  expandedIds: Set<string>;
  onExpand: (id: string) => void;
  onSelect?: (item: MenuItem) => void;
  onAddChild?: (parent: MenuItem) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
  onDrop?: (payload: {
    draggedId: string;
    targetId: string;
    position: DropPosition;
  }) => void;
};

export default function MenuTree({
  data,
  expandedIds,
  onExpand,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
  onDrop,
}: MenuTreeProps) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          expandedIds={expandedIds}
          onExpand={onExpand}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

type TreeNodeProps = {
  item: MenuItem;
  expandedIds: Set<string>;
  onExpand: (id: string) => void;
  onSelect?: (item: MenuItem) => void;
  onAddChild?: (parent: MenuItem) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
  onDrop?: (payload: {
    draggedId: string;
    targetId: string;
    position: DropPosition;
  }) => void;
};

function TreeNode({
  item,
  expandedIds,
  onExpand,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
  onDrop,
}: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedIds.has(item.id);

  const [dropHint, setDropHint] = useState<DropPosition | null>(null);

  // Drag start: set dragged id
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drag over: compute position (before/inside/after) depending on mouse Y
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;

    // thresholds: top 25% => before, middle 50% => inside, bottom 25% => after
    const topThresh = height * 0.25;
    const bottomThresh = height * 0.75;

    let position: DropPosition = 'inside';

    if (offsetY < topThresh) position = 'before';
    else if (offsetY > bottomThresh) position = 'after';
    else position = 'inside';

    setDropHint(position);
  };

  const handleDragLeave = () => {
    setDropHint(null);
  };

  // Drop: read dragged id and emit to parent
  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    setDropHint(null);

    if (!draggedId) return;
    if (draggedId === id) return; // ignore drop onto itself

    // compute position similar to dragOver: if no dropHint, default to 'inside'
    const position = dropHint ?? 'inside';

    onDrop?.({ draggedId, targetId: id, position: position });
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 group"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, item.id)}>
        {hasChildren ? (
          <button
            onClick={() => onExpand(item.id)}
            className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        ) : (
          <div className="w-4"></div>
        )}

        {/* Title (draggable) */}
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onClick={() => onSelect?.(item)}
          className="cursor-pointer text-gray-800 hover:text-blue-800 flex-1 p-1">
          <div className="relative">
            <span>{item.title}</span>

            {/* visual hint: show small indicator depending on dropHint */}
            {dropHint === 'before' && (
              <div className="absolute -top-2 left-0 right-0 h-0.5 bg-blue-500" />
            )}
            {dropHint === 'after' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500" />
            )}
            {dropHint === 'inside' && (
              <div className="absolute inset-y-0 right-2 w-1.5 rounded bg-blue-200 opacity-30" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opcaity-100 md:opacity-0 group-hover:opacity-100 transition">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild?.(item);
            }}>
            <PlusCircle size={16} className="text-blue-600" />
          </button>

          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(item);
            }}>
            <Pencil size={14} />
          </button>

          <button
            className="p-1 rounded hover:bg-red-100 text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(item);
            }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-6 border-l border-gray-300 pl-4 mt-1">
          {item.children?.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              expandedIds={expandedIds}
              onExpand={onExpand}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDrop={onDrop}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
