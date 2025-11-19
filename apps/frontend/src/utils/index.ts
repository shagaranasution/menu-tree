import type { MenuItem } from '../types';
import type { Option } from '../components/SearchableSelect';

export * from './tree';

export const buildMenuSelectOption = (items: MenuItem[]): Option[] => {
  return items.map((item) => ({ value: item.id, label: item.title }));
};
