'use client';

import {
  MAX_YAML_OUTPUT_INDENT,
  MIN_YAML_OUTPUT_INDENT,
} from '@/lib/builders/core';

export function OutputIndentControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number | string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-fd-muted-foreground">
      <span>Indent</span>
      <input
        aria-label="Generated YAML indent"
        type="number"
        min={MIN_YAML_OUTPUT_INDENT}
        max={MAX_YAML_OUTPUT_INDENT}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-20 rounded-lg border bg-fd-background px-2 text-sm text-fd-foreground outline-none transition focus:border-fd-primary"
      />
    </label>
  );
}
