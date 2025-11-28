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

export function collectAllIds(menuTree: MenuItem[]) {
  const result: string[] = [];

  const walk = (list: MenuItem[]) => {
    for (const item of list) {
      result.push(item.id);
      if (item.children?.length) walk(item.children);
    }
  };

  walk(menuTree);

  return result;
}

export function findNodeAndParent(
  tree: MenuItem[],
  id: string
): { node?: MenuItem; parent?: MenuItem | null } {
  let found: MenuItem | undefined;
  let parent: MenuItem | null = null;

  const walk = (list: MenuItem[], p: MenuItem | null) => {
    for (const menu of list) {
      if (menu.id === id) {
        found = menu;
        parent = p;

        return true;
      }
      if (menu.children && menu.children.length) {
        if (walk(menu.children, menu)) return true;
      }
    }

    return false;
  };

  walk(tree, null);

  return { node: found, parent };
}

export function computeInsertIndex(
  siblings: MenuItem[],
  targetId: string,
  position: 'before' | 'after'
) {
  const idx = siblings.findIndex((s) => s.id === targetId);
  if (idx === -1) return siblings.length;
  return position === 'before' ? idx : idx + 1;
}
