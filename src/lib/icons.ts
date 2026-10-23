const DEFAULT_CDN = 'https://icons.customtalenttrees.com';

export const ICON_CDN = (import.meta.env.VITE_ICON_CDN || DEFAULT_CDN).replace(/\/$/, '');

export type CatalogCategory = { name: string; count: number };

export type CatalogIndex = {
  version: number;
  generatedAt: string;
  iconCount: number;
  categories: CatalogCategory[];
};

export type CatalogIcon = {
  category: string;
  id: string;
  tags: string[];
};

export function isCatalogIcon(icon: string): boolean {
  return icon.includes('/');
}

export function iconUrl(icon: string): string | null {
  if (!isCatalogIcon(icon)) return null;
  return `${ICON_CDN}/icons/${icon}.png`;
}

export function iconRef(category: string, id: string): string {
  return `${category}/${id}`;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${ICON_CDN}${path}`);
  if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
  return response.json() as Promise<T>;
}

let indexPromise: Promise<CatalogIndex> | null = null;
let idsPromise: Promise<string[]> | null = null;
const shardCache = new Map<string, Promise<CatalogIcon[]>>();

export function loadCatalogIndex(): Promise<CatalogIndex> {
  if (!indexPromise) indexPromise = getJson<CatalogIndex>('/catalog/index.json');
  return indexPromise;
}

export function loadCatalogIds(): Promise<string[]> {
  if (!idsPromise) idsPromise = getJson<string[]>('/catalog/ids.json');
  return idsPromise;
}

export function loadCategoryIcons(category: string): Promise<CatalogIcon[]> {
  const cached = shardCache.get(category);
  if (cached) return cached;
  const request = getJson<{ category: string; icons: { id: string; tags: string[] }[] }>(
    `/catalog/categories/${encodeURIComponent(category)}.json`,
  ).then((shard) =>
    shard.icons.map((icon) => ({ category: shard.category, id: icon.id, tags: icon.tags })),
  );
  shardCache.set(category, request);
  return request;
}
