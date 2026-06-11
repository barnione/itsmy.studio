import { dump } from 'js-yaml';

type BuilderYamlValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | BuilderYamlValue[]
  | BuilderYamlObject;

export type BuilderYamlObject = {
  [key: string]: BuilderYamlValue;
};

export type BuilderOutputDefinition = {
  title: string;
  description: string;
  lang?: string;
};

export type BuilderDefinition<TState> = {
  kind: string;
  label: string;
  description?: string;
  output: BuilderOutputDefinition;
  createInitialState: () => TState;
  serialize: (state: TState) => string;
};

export type BuilderOption<TValue extends string = string> = {
  value: TValue;
  label: string;
  hint?: string;
};

export function createIdFactory(start = 0) {
  let idCounter = start;

  return (prefix: string) => {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  };
}

export function replaceAt<T>(items: T[], index: number, nextItem: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));
}

export function removeAt<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const yamlDumpOptions = {
  noRefs: true,
  lineWidth: -1,
  sortKeys: false,
  quotingType: '"' as const,
};

export function dumpExactYaml(value: unknown) {
  return dump(stripUndefinedYamlValue(value), yamlDumpOptions).trimEnd();
}

function stripUndefinedYamlValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefinedYamlValue);
  }

  if (isYamlObject(value)) {
    const output: Record<string, unknown> = {};

    for (const [key, child] of Object.entries(value)) {
      if (child === undefined) continue;
      output[key] = stripUndefinedYamlValue(child);
    }

    return output;
  }

  return value;
}

function isYamlObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
