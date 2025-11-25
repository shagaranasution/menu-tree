import { useEffect, useState } from 'react';
import type { MenuItem } from '../types';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export function useMenus() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchMenus() {
    try {
      const res = await fetch(`${baseUrl}/api/menus`);

      if (!res.ok) throw new Error('Fail to fetch menus data');

      const data = await res.json();

      setMenus(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  const refetch = async () => {
    await fetchMenus();
  };

  const moveMenu = async (
    id: string,
    payload: { parentId: string | null; order?: number | undefined }
  ) => {
    const res = await fetch(`${baseUrl}/api/menus/${id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to move menu: ${text}`);
    }

    await fetchMenus();
  };

  const reorderMenu = async (id: string, order: number) => {
    const res = await fetch(`${baseUrl}/api/menus/${id}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to reorder menu: ${text}`);
    }

    await fetchMenus();
  };

  return { menus, loading, error, refetch, moveMenu, reorderMenu };
}
