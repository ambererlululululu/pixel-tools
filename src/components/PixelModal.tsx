"use client";

interface PixelModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function PixelModal({ open, onClose, title, children }: PixelModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="pixel-card relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-accent-red text-lg font-bold w-8 h-8 flex items-center justify-center"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
