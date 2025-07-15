import { MenuCategory, MenuItem } from '../types';

export const isMenuCategory = (obj: unknown): obj is MenuCategory =>
  typeof obj === 'object' &&
  obj != undefined &&
  'name' in obj &&
  'items' in obj &&
  Array.isArray(obj.items);

export const isMenuItem = (obj: unknown): obj is MenuItem => {
  if (typeof obj !== 'object' || obj == undefined) return false;
  const item = obj as Record<string, unknown>;
  return (
    typeof item.name === 'string' &&
    (item.description === undefined || typeof item.description === 'string') &&
    (item.price === undefined || typeof item.price === 'number') &&
    (item.dietary_tags === undefined ||
      (Array.isArray(item.dietary_tags) &&
        item.dietary_tags.every((tag) => typeof tag === 'string')))
  );
};
