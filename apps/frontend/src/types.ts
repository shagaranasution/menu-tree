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
