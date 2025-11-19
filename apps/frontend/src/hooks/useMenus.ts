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

  return { menus, loading, error, refetch };
}
