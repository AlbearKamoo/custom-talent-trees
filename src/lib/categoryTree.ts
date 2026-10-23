import type { CatalogCategory } from './icons';

export interface TreeNode {
  key: string;
  label: string;
  category?: string;
  own: number;
  count: number;
  children: TreeNode[];
}

export function buildCategoryTree(categories: CatalogCategory[]): TreeNode[] {
  const root: TreeNode = { key: '', label: '', own: 0, count: 0, children: [] };

  for (const category of categories) {
    const parts = category.name.split('_').filter(Boolean);
    let node = root;
    let key = '';
    for (const part of parts) {
      key = key ? `${key}/${part}` : part;
      let child = node.children.find((entry) => entry.label === part);
      if (!child) {
        child = { key, label: part, own: 0, count: 0, children: [] };
        node.children.push(child);
      }
      node = child;
    }
    node.category = category.name;
    node.own = category.count;
  }

  const rollup = (node: TreeNode): number => {
    const childTotal = node.children.reduce((sum, child) => sum + rollup(child), 0);
    node.count = node.own + childTotal;
    node.children.sort((a, b) => a.label.localeCompare(b.label));
    return node.count;
  };
  rollup(root);
  return root.children;
}

export function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return nodes;
  const visit = (node: TreeNode): TreeNode | null => {
    const children = node.children.map(visit).filter((child): child is TreeNode => child !== null);
    const selfMatch =
      node.label.toLowerCase().includes(needle) ||
      (node.category?.toLowerCase().includes(needle) ?? false);
    if (!selfMatch && children.length === 0) return null;
    return { ...node, children };
  };
  return nodes.map(visit).filter((node): node is TreeNode => node !== null);
}
