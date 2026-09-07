"use client";

import { Input } from "@/components/ui/input";

export function ContentField({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11"
      />
      {hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function ContentTextArea({
  label,
  value,
  onChange,
  hint,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-y min-h-[96px]"
      />
      {hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
