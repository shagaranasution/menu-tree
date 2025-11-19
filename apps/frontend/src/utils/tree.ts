import type { MenuItem } from '../types';

export function buildTree(flat: MenuItem[]): MenuItem[] {
  const map = new Map<string, MenuItem>();
  const roots: MenuItem[] = [];

  for (const item of flat) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of flat) {
    const node = map.get(item.id);

    if (!node) continue;

    if (!item.parentId) {
      roots.push(node);
    } else {
      const parent = map.get(item.parentId);
      if (parent) parent.children?.push(node);
    }
  }

  // sort by "order"
  const sortTree = (nodes: MenuItem[]) => {
    nodes.sort((a, b) => {
      const orderA = flat.find((f) => f.id === a.id)?.order ?? 0;
      const orderB = flat.find((f) => f.id === b.id)?.order ?? 0;

      return orderA - orderB;
    });

    for (const node of nodes) {
      if (node.children) sortTree(node.children);
    }
  };

  sortTree(roots);

  return roots;
}
