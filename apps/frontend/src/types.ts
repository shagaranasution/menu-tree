export type MenuItem = {
  id: string;
  title: string;
  description?: string | null;
  parentId?: string | null;
  order?: number | null;
  depth?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  children?: MenuItem[];
};

export type MenuNode = {
  id: string;
  name: string;
  children?: MenuNode[];
};

export type MenuForm = {
  id?: string | null;
  title: string;
  description?: string | null;
  parentId?: string | null;
  depth?: number | null;
};
