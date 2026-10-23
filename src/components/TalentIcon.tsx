import { iconUrl } from '../lib/icons';

export default function TalentIcon({
  icon,
  name,
  size = 32,
}: {
  icon: string;
  name: string;
  size?: number;
}) {
  const src = iconUrl(icon);
  if (!src) {
    return (
      <div
        className="flex items-center justify-center rounded bg-gray-600 text-xs font-bold"
        style={{ width: size, height: size }}
      >
        {icon || name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      className="rounded object-contain [image-rendering:pixelated]"
      style={{ width: size, height: size }}
    />
  );
}
