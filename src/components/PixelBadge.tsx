const colorMap: Record<string, string> = {
  red: "border-accent-red text-accent-red",
  green: "border-accent-green text-accent-green",
  yellow: "border-accent-yellow text-accent-yellow",
  blue: "border-accent-blue text-accent-blue",
  purple: "border-accent-purple text-accent-purple",
  pink: "border-accent-pink text-accent-pink",
  orange: "border-accent-orange text-accent-orange",
};

interface PixelBadgeProps {
  label: string;
  color?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export default function PixelBadge({
  label,
  color = "purple",
  onClick,
  removable,
  onRemove,
}: PixelBadgeProps) {
  return (
    <span
      className={`pixel-badge ${colorMap[color] || colorMap.purple} ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={onClick}
    >
      {label}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 hover:text-accent-red"
        >
          x
        </button>
      )}
    </span>
  );
}
