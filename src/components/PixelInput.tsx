interface PixelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export default function PixelInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: PixelInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`pixel-input w-full px-3 py-2 text-sm ${className}`}
    />
  );
}
