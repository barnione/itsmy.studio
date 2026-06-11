export type ParsedRecord = Record<string, unknown>;

export function asRecord(value: unknown, path: string): ParsedRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be an object.`);
  }

  return value as ParsedRecord;
}

export function asArray(value: unknown, path: string) {
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array.`);
  }

  return value;
}

export function readString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const firstString = value.find((item) => typeof item === 'string');
    return typeof firstString === 'string' ? firstString : fallback;
  }
  return fallback;
}

export function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function readInteger(value: unknown, fallback: number) {
  return Math.trunc(readNumber(value, fallback));
}
