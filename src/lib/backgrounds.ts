import { ICON_CDN } from './icons';
import type { CSSProperties } from 'react';

export type BackgroundSize = 'small' | 'large';

export type SmallBackground = {
  size: 'small';
  id: string;
  label: string;
  ref: string;
  width: number;
  height: number;
};

export type LargeBackground = {
  size: 'large';
  id: string;
  label: string;
  className: string;
  spec: string;
  ref: string;
  width: number;
  height: number;
};

export type BackgroundOption = SmallBackground | LargeBackground;

type WrathIndex = {
  ids: { id: number; width: number; height: number }[];
};

type RetailIndex = {
  backgrounds: {
    id: string;
    class: string;
    spec: string;
    width: number;
    height: number;
  }[];
};

function titleCase(value: string): string {
  return value
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function isBackgroundRef(value: string): boolean {
  return value.startsWith('wrath/') || value.startsWith('retail/');
}

export function isLargeBackground(value: string | undefined): boolean {
  return !!value && (value.startsWith('retail/') || value.includes('/talentbg-'));
}

export function backgroundUrl(value: string | undefined): string | null {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (isBackgroundRef(value)) return `${ICON_CDN}/backgrounds/${value}.png`;
  return value;
}

export function treeBackgroundStyle(
  value: string | undefined,
  compact: boolean,
): CSSProperties {
  const url = backgroundUrl(value);
  if (!url) {
    return {};
  }
  const cropRight = compact && isLargeBackground(value);
  return {
    backgroundImage: `linear-gradient(to bottom, rgba(17, 24, 39, 0.35), rgba(17, 24, 39, 0.55)), url(${url})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: cropRight ? 'auto 100%' : 'cover',
    backgroundPosition: cropRight ? 'right center' : 'center',
  };
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${ICON_CDN}${path}`);
  if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
  return response.json() as Promise<T>;
}

let smallPromise: Promise<SmallBackground[]> | null = null;
let largePromise: Promise<LargeBackground[]> | null = null;

export function loadSmallBackgrounds(): Promise<SmallBackground[]> {
  if (!smallPromise) {
    smallPromise = getJson<WrathIndex>('/backgrounds/wrath/index.json').then((index) =>
      [...index.ids]
        .sort((a, b) => {
          if (a.id === 384) return 1;
          if (b.id === 384) return -1;
          return a.id - b.id;
        })
        .map((item) => ({
          size: 'small' as const,
          id: String(item.id),
          label: `Background ${item.id}`,
          ref: `wrath/${item.id}`,
          width: item.width,
          height: item.height,
        })),
    );
  }
  return smallPromise;
}

export function loadLargeBackgrounds(): Promise<LargeBackground[]> {
  if (!largePromise) {
    largePromise = getJson<RetailIndex>('/backgrounds/retail/index.json').then((index) =>
      index.backgrounds.map((item) => ({
        size: 'large' as const,
        id: item.id,
        label: `${titleCase(item.class)} ${titleCase(item.spec)}`,
        className: item.class,
        spec: item.spec,
        ref: `retail/${item.id}`,
        width: item.width,
        height: item.height,
      })),
    );
  }
  return largePromise;
}
