interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function PixelCard({
  children,
  className = "",
  hoverable = false,
  onClick,
}: PixelCardProps) {
  return (
    <div
      className={`pixel-card p-5 ${hoverable ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
