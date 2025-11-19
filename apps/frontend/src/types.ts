export type MenuItem = {
  id: string;
  title: string;
  description?: string | null;
  parentId?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  children?: MenuItem[];
};

export type MenuNode = {
  id: string;
  name: string;
  children?: MenuNode[];
};
