interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export default function PixelButton({
  children,
  onClick,
  variant = "default",
  disabled = false,
  type = "button",
  className = "",
}: PixelButtonProps) {
  const variantClass =
    variant === "primary"
      ? "pixel-btn-primary"
      : variant === "danger"
        ? "pixel-btn-danger"
        : "bg-bg-card text-text-primary";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pixel-btn px-4 py-2 text-sm font-medium tracking-wide ${variantClass} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
