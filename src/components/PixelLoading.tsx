export default function PixelLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 text-text-secondary">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-accent-purple animate-pixel-blink" style={{ animationDelay: "0s" }} />
        <span className="w-2 h-2 bg-accent-purple animate-pixel-blink" style={{ animationDelay: "0.2s" }} />
        <span className="w-2 h-2 bg-accent-purple animate-pixel-blink" style={{ animationDelay: "0.4s" }} />
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}
