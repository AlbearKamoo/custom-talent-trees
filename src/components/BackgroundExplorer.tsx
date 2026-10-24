import { useEffect, useMemo, useState } from 'react';
import {
  backgroundUrl,
  loadLargeBackgrounds,
  loadSmallBackgrounds,
  type BackgroundOption,
  type BackgroundSize,
} from '../lib/backgrounds';

interface BackgroundExplorerProps {
  value?: string;
  onSelect: (ref: string) => void;
  onClose: () => void;
}

const BackgroundExplorer: React.FC<BackgroundExplorerProps> = ({
  value,
  onSelect,
  onClose,
}) => {
  const [tab, setTab] = useState<BackgroundSize>(
    value?.startsWith('retail/') ? 'large' : 'small',
  );
  const [page, setPage] = useState(0);
  const [small, setSmall] = useState<BackgroundOption[]>([]);
  const [large, setLarge] = useState<BackgroundOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadSmallBackgrounds(), loadLargeBackgrounds()])
      .then(([nextSmall, nextLarge]) => {
        if (cancelled) return;
        setSmall(nextSmall);
        setLarge(nextLarge);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load backgrounds');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = tab === 'small' ? small : large;
  const pageSize = tab === 'small' ? 3 : 1;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = useMemo(
    () => items.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [items, safePage, pageSize],
  );

  useEffect(() => {
    if (!value || items.length === 0) return;
    const index = items.findIndex((item) => item.ref === value);
    if (index >= 0) setPage(Math.floor(index / pageSize));
  }, [tab, items, value, pageSize]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-5xl flex-col rounded-lg bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-bold text-yellow-400">Choose background</h2>
          <button type="button" onClick={onClose} className="text-2xl text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-gray-700 px-4 py-3">
          <div className="flex rounded-lg bg-gray-900 p-1">
            <button
              type="button"
              onClick={() => {
                setTab('small');
                setPage(0);
              }}
              className={`px-3 py-1 rounded text-sm ${
                tab === 'small' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Small
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('large');
                setPage(0);
              }}
              className={`px-3 py-1 rounded text-sm ${
                tab === 'large' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Large
            </button>
          </div>
        </div>

        <div className="p-4">
          {loading && <div className="py-16 text-center text-gray-400">Loading…</div>}
          {error && <div className="py-16 text-center text-red-400">{error}</div>}
          {!loading && !error && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={safePage <= 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="h-12 w-10 shrink-0 rounded bg-gray-700 text-xl text-white disabled:opacity-30"
                aria-label="Previous backgrounds"
              >
                ‹
              </button>

              <div
                className={`grid min-h-[220px] flex-1 gap-3 ${
                  tab === 'small' ? 'grid-cols-3' : 'grid-cols-1'
                }`}
              >
                {visible.map((item) => {
                  const selected = item.ref === value;
                  const src = backgroundUrl(item.ref);
                  return (
                    <button
                      key={item.ref}
                      type="button"
                      onClick={() => onSelect(item.ref)}
                      aria-label={item.label}
                      className={`overflow-hidden rounded-lg border-2 bg-gray-900 ${
                        selected ? 'border-yellow-500' : 'border-gray-600 hover:border-yellow-400'
                      }`}
                    >
                      <div
                        className={tab === 'small' ? 'aspect-[300/331]' : 'aspect-[1614/776]'}
                        style={{
                          backgroundImage: src ? `url(${src})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                className="h-12 w-10 shrink-0 rounded bg-gray-700 text-xl text-white disabled:opacity-30"
                aria-label="Next backgrounds"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3 text-sm text-gray-400">
          <span>
            {items.length ? `${safePage + 1} / ${pageCount}` : 'No backgrounds'}
          </span>
          <button
            type="button"
            onClick={() => onSelect('')}
            className="text-gray-300 hover:text-white"
          >
            Clear background
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundExplorer;
