// src/menu/menu.types.ts
export type MenuTree = {
  id: string;
  title: string;
  description?: string | null;
  parentId?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  children?: MenuTree[];
};
