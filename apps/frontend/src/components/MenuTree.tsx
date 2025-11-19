import {
  ChevronDown,
  ChevronRight,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import type { MenuItem } from '../types';

type MenuTreeProps = {
  data: MenuItem[];
  expandedIds: Set<string>;
  onExpand: (id: string) => void;
  onSelect?: (item: MenuItem) => void;
  onAddChild?: (parent: MenuItem) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
};

export default function MenuTree({
  data,
  // isExpanded,
  expandedIds,
  onExpand,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
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
        />
      ))}
    </div>
  );
}

type TreeNodeProps = {
  item: MenuItem;
  // isExpanded: boolean;
  expandedIds: Set<string>;
  onExpand: (id: string) => void;
  onSelect?: (item: MenuItem) => void;
  onAddChild?: (parent: MenuItem) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
};

function TreeNode({
  item,
  expandedIds,
  onExpand,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
}: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0;

  const isExpanded = expandedIds.has(item.id);

  return (
    <div className="select-none">
      <div className="flex items-center gap-2 group">
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

        <div
          onClick={() => onSelect?.(item)}
          className="cursor-pointer text-gray-800 hover:text-blue-600">
          {item.title}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
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
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
