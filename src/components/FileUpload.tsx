"use client";

import { useCallback, useState, useRef } from "react";

interface FileUploadProps {
  accept: string;
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
}

export default function FileUpload({
  accept,
  onFileSelect,
  maxSizeMB = 500,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError("");
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large (max ${maxSizeMB}MB)`);
        return;
      }
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect]
  );

  return (
    <div
      className={`pixel-border p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-accent-purple bg-accent-purple/10"
          : "border-border hover:border-border-light"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="text-3xl mb-3">
        {isDragging ? "[ DROP ]" : "[ + ]"}
      </div>
      <p className="text-text-secondary text-sm">
        Drag & drop or click to select
      </p>
      <p className="text-text-muted text-xs mt-1">
        Max {maxSizeMB}MB
      </p>
      {error && (
        <p className="text-accent-red text-xs mt-2">{error}</p>
      )}
    </div>
  );
}
