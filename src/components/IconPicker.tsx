import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildCategoryTree, filterTree, type TreeNode } from '../lib/categoryTree';
import {
  iconRef,
  iconUrl,
  loadCatalogIds,
  loadCatalogIndex,
  loadCategoryIcons,
  type CatalogIcon,
} from '../lib/icons';

export default function IconPicker({
  value,
  onSelect,
  onClose,
}: {
  value: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}) {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [icons, setIcons] = useState<CatalogIcon[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const visibleTree = useMemo(() => filterTree(tree, categoryFilter), [tree, categoryFilter]);
  const searching = query.trim().length > 0;

  useEffect(() => {
    let cancelled = false;
    loadCatalogIndex()
      .then((index) => {
        if (cancelled) return;
        setCategories(index.categories);
        setCategory(index.categories[0]?.name ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load catalog');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (searching || !category) return;
    let cancelled = false;
    setLoading(true);
    loadCategoryIcons(category)
      .then((list) => {
        if (!cancelled) setIcons(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load icons');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, searching]);

  useEffect(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return;
    let cancelled = false;
    setLoading(true);
    loadCatalogIds()
      .then((ids) => {
        if (cancelled) return;
        const matches: CatalogIcon[] = [];
        for (const id of ids) {
          if (!id.toLowerCase().includes(needle)) continue;
          const slash = id.indexOf('/');
          if (slash === -1) continue;
          matches.push({
            category: id.slice(0, slash),
            id: id.slice(slash + 1),
            tags: [],
          });
          if (matches.length >= 400) break;
        }
        setIcons(matches);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Search failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col rounded-lg bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-bold text-yellow-400">Choose icon</h2>
          <button type="button" onClick={onClose} className="text-2xl text-gray-400 hover:text-white">
            ×
          </button>
        </div>
        <div className="flex min-h-0 flex-1">
          <aside className="flex w-64 shrink-0 flex-col border-r border-gray-700">
            <div className="border-b border-gray-700 p-2">
              <input
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                placeholder="Filter categories"
                className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-2">
              {visibleTree.map((node) => (
                <TreeBranch
                  key={node.key}
                  node={node}
                  depth={0}
                  selected={category}
                  forceOpen={categoryFilter.trim().length > 0}
                  onSelect={(name) => {
                    setQuery('');
                    setCategory(name);
                  }}
                />
              ))}
            </div>
          </aside>
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-gray-700 p-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search icons by id"
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            {error && <p className="p-4 text-sm text-red-300">{error}</p>}
            {loading && !error && <p className="p-4 text-sm text-gray-400">Loading…</p>}
            {!loading && !error && (
              <IconGrid
                icons={icons}
                selected={value}
                onSelect={(icon) => onSelect(iconRef(icon.category, icon.id))}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function TreeBranch({
  node,
  depth,
  selected,
  forceOpen,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selected: string | null;
  forceOpen: boolean;
  onSelect: (category: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const expanded = forceOpen || open;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className="flex items-center" style={{ paddingLeft: depth * 10 }}>
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setOpen((value) => !value)}
            className="w-4 shrink-0 text-center text-stone-400 hover:text-yellow-300"
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {node.category ? (
          <button
            type="button"
            onClick={() => {
              if (node.category) onSelect(node.category);
            }}
            className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded px-1.5 py-1 text-left text-sm ${
              selected === node.category
                ? 'bg-yellow-500/20 text-yellow-200'
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <span className="truncate">{node.label}</span>
            <span className="shrink-0 text-xs text-gray-500">{node.own}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded px-1.5 py-1 text-left text-sm text-gray-300 hover:bg-white/5"
          >
            <span className="truncate">{node.label}</span>
            <span className="shrink-0 text-xs text-gray-500">{node.count}</span>
          </button>
        )}
      </div>
      {expanded &&
        node.children.map((child) => (
          <TreeBranch
            key={child.key}
            node={child}
            depth={depth + 1}
            selected={selected}
            forceOpen={forceOpen}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

function IconGrid({
  icons,
  selected,
  onSelect,
}: {
  icons: CatalogIcon[];
  selected: string;
  onSelect: (icon: CatalogIcon) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  const minCell = 96;
  const columns = Math.max(1, Math.floor(Math.max(minCell, width - 16) / minCell));
  const cellWidth = Math.max(minCell, width - 16) / columns;
  const rowCount = Math.ceil(icons.length / columns);
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96,
    overscan: 6,
  });

  if (icons.length === 0) {
    return <p className="p-4 text-sm text-gray-400">No icons match.</p>;
  }

  return (
    <div ref={parentRef} className="min-h-0 flex-1 overflow-auto px-2 py-2">
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => {
          const start = row.index * columns;
          const slice = icons.slice(start, start + columns);
          return (
            <div
              key={row.key}
              className="absolute left-0 top-0 flex w-full"
              style={{ height: row.size, transform: `translateY(${row.start}px)` }}
            >
              {slice.map((icon) => {
                const ref = iconRef(icon.category, icon.id);
                const src = iconUrl(ref);
                return (
                  <button
                    key={ref}
                    type="button"
                    title={icon.id}
                    onClick={() => onSelect(icon)}
                    style={{ width: cellWidth }}
                    className={`flex shrink-0 flex-col items-center gap-1 rounded p-2 hover:bg-white/5 ${
                      selected === ref ? 'bg-yellow-500/20 ring-1 ring-yellow-400' : ''
                    }`}
                  >
                    {src && (
                      <img
                        src={src}
                        alt={icon.id}
                        width={64}
                        height={64}
                        loading="lazy"
                        className="h-16 w-16 object-contain [image-rendering:pixelated]"
                      />
                    )}
                    <span className="w-full truncate text-center text-[11px] text-gray-400">
                      {icon.id}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
