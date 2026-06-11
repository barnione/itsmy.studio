import {
  dumpExactYaml,
  type BuilderDefinition,
  type BuilderOption,
  type BuilderYamlObject,
} from './core';
import { asArray, asRecord, readBoolean, readInteger, readString } from './import-utils';
import { DEFAULT_PLACEHOLDERS, HYPIXEL_PLACEHOLDERS, ORIGIN_REALMS_PLACEHOLDERS, THE_HIVE_PLACEHOLDERS } from './itsmyconfig-presets';

export type ItsMyConfigPreviewView = 'chat' | 'lore' | 'scoreboard' | 'tablist';
type ItsMyConfigPlaceholderType =
  | 'string'
  | 'color'
  | 'colored_text'
  | 'math'
  | 'animation'
  | 'random'
  | 'progress_bar';

type ItsMyConfigPlaceholderBase = {
  id: string;
  description?: string;
};

type ItsMyConfigStringPlaceholder = ItsMyConfigPlaceholderBase & {
  type: 'string';
  value: string;
};

export type ItsMyConfigColorPlaceholder = ItsMyConfigPlaceholderBase & {
  type: 'color';
  value: string;
  bold: boolean;
  italic: boolean;
  underlined: boolean;
  strikethrough: boolean;
  obfuscated: boolean;
};

type ItsMyConfigColoredTextPlaceholder = ItsMyConfigPlaceholderBase & {
  type: 'colored_text';
  value: string;
};

type ItsMyConfigMathPlaceholder = ItsMyConfigPlaceholderBase & {
  type: 'math';
  value: string;
  rounding: string;
  precision: number;
};

type ItsMyConfigAnimationPlaceholder = ItsMyConfigPlaceholderBase & {
  type: 'animation';
  values: string[];
  interval: number;
};

type ItsMyConfigRandomPlaceholder = ItsMyConfigPlaceholderBase & {
  type: 'random';
  values: string[];
};

type ItsMyConfigProgressBarPlaceholder = ItsMyConfigPlaceholderBase & {
  type: 'progress_bar';
  value: string;
  completedColor: string;
  progressColor: string;
  remainingColor: string;
};

export type ItsMyConfigPlaceholder =
  | ItsMyConfigStringPlaceholder
  | ItsMyConfigColorPlaceholder
  | ItsMyConfigColoredTextPlaceholder
  | ItsMyConfigMathPlaceholder
  | ItsMyConfigAnimationPlaceholder
  | ItsMyConfigRandomPlaceholder
  | ItsMyConfigProgressBarPlaceholder;

type ItsMyConfigTemplates = {
  chat: {
    lines: string;
  };
  lore: {
    title: string;
    lines: string;
  };
  scoreboard: {
    title: string;
    lines: string;
  };
  tablist: {
    header: string;
    footer: string;
  };
};

export type ItsMyConfigBuilderState = {
  placeholders: ItsMyConfigPlaceholder[];
  templates: ItsMyConfigTemplates;
};

export type ItsMyConfigBuilderPreset = {
  id: string;
  label: string;
  description?: string;
  state: ItsMyConfigBuilderState;
};

export const ITSMYCONFIG_VIEW_OPTIONS: BuilderOption<ItsMyConfigPreviewView>[] = [
  {
    value: 'chat',
    label: 'Chat',
    hint: 'Preview normal messages.',
  },
  {
    value: 'lore',
    label: 'Item Lore',
    hint: 'Preview item name and lore lines.',
  },
  {
    value: 'scoreboard',
    label: 'Scoreboard',
    hint: 'Preview sidebar title and lines.',
  },
  {
    value: 'tablist',
    label: 'Tablist',
    hint: 'Preview header and footer.',
  },
];

const DEFAULT_TEMPLATES: ItsMyConfigTemplates = {
  chat: {
    lines: [
      '<p:prefix> <p:eco-format:"1250"> has been added to your account.',
      '<p:error-prefix> You need <p:eco-format:"250"> to buy this rank.',
      '<p:prefix> Visit <p:secondary-color><p:store></p> <p:text-color>for new items.',
    ].join('\n'),
  },
  lore: {
    title: '<green>Woodcutter IV',
    lines: [
      '<p:darkest-color>Status:</p> <green>Working',
      '<p:darkest-color>Employees:</p> <p:secondary-color>1203',
      '',
      '<p:dark-color>Chop trees and harvest wood',
      '<p:dark-color>efficiently.',
      '',
      '<p:darkest-color>Paid Actions:',
      '<p:dark-color> • </p><p:text-color>Break',
      '',
      '<p:dark-color>◆</p> <p:primary-color>Click:</p><p:text-color> More information',
      '<p:dark-color>◆</p> <p:primary-color>Shift Click:</p><p:text-color> Leave',
    ].join('\n'),
  },
  scoreboard: {
    title: '<p:server-name>',
    lines: [
      '<p:secondary-color>Balance',
      '<p:eco-format:"15250">',
      '',
      '<p:secondary-color>Next reward',
      '<p:exp-format:"320">',
      '',
      '<p:dark-color><p:ip>',
    ].join('\n'),
  },
  tablist: {
    header: [
      '<p:server-name>',
      '<p:dark-color>play with style',
    ].join('\n'),
    footer: [
      '<p:secondary-color>Store</p> <p:text-color><p:store>',
      '<p:secondary-color>Discord</p> <p:text-color><p:discord>',
    ].join('\n'),
  },
};

export const ITSMYCONFIG_BUILDER_PRESETS: ItsMyConfigBuilderPreset[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Official default placeholders and starter examples.',
    state: {
      placeholders: DEFAULT_PLACEHOLDERS,
      templates: DEFAULT_TEMPLATES,
    },
  },
  {
    id: 'hypixel',
    label: 'Hypixel',
    description: 'Hypixel-specific placeholders and templates.',
    state: {
      placeholders: HYPIXEL_PLACEHOLDERS,
      templates: DEFAULT_TEMPLATES,
    },
  },
  {
    id: 'origin-realms',
    label: 'Origin Realms',
    description: 'Origin Realms-specific placeholders and templates.',
    state: {
      placeholders: ORIGIN_REALMS_PLACEHOLDERS,
      templates: DEFAULT_TEMPLATES,
    },
  },
  {
    id: 'thehive',
    label: 'The Hive',
    description: 'The Hive-specific placeholders and templates.',
    state: {
      placeholders: THE_HIVE_PLACEHOLDERS,
      templates: DEFAULT_TEMPLATES,
    },
  },
];

export const ITSMYCONFIG_BUILDER_DEFINITION: BuilderDefinition<ItsMyConfigBuilderState> = {
  kind: 'itsmyconfig',
  label: 'ItsMyConfig Builder',
  description: 'Edit default placeholders and preview them in common Minecraft UI views.',
  output: {
    title: 'Placeholder YAML',
    description: "Copy this file into your 'ItsMyConfig/placeholders/default.yml' or merge the 'custom-placeholder' section.",
    lang: 'yaml',
  },
  createInitialState: createInitialItsMyConfigState,
  serialize: serializeItsMyConfigState,
};

export function createInitialItsMyConfigState(): ItsMyConfigBuilderState {
  return createItsMyConfigStateFromPreset('default');
}

export function createItsMyConfigStateFromPreset(presetId: string): ItsMyConfigBuilderState {
  const preset =
    ITSMYCONFIG_BUILDER_PRESETS.find((entry) => entry.id === presetId) ??
    ITSMYCONFIG_BUILDER_PRESETS[0];

  return {
    placeholders: preset.state.placeholders.map(cloneItsMyConfigPlaceholder),
    templates: cloneItsMyConfigTemplates(preset.state.templates),
  };
}

export function isItsMyConfigPlaceholderVisible(placeholder: ItsMyConfigPlaceholder) {
  return placeholder.id !== 'price-modifier';
}

function cloneItsMyConfigPlaceholder<TPlaceholder extends ItsMyConfigPlaceholder>(
  placeholder: TPlaceholder,
): TPlaceholder {
  switch (placeholder.type) {
    case 'animation':
      return {
        ...placeholder,
        values: [...placeholder.values],
      };
    case 'random':
      return {
        ...placeholder,
        values: [...placeholder.values],
      };
    default:
      return { ...placeholder };
  }
}

function cloneItsMyConfigTemplates(templates: ItsMyConfigTemplates): ItsMyConfigTemplates {
  return {
    chat: { ...templates.chat },
    lore: { ...templates.lore },
    scoreboard: { ...templates.scoreboard },
    tablist: { ...templates.tablist },
  };
}

export function splitItsMyConfigLines(source: string) {
  return source.split(/\r?\n/);
}

export function deserializeItsMyConfigConfig(value: unknown): ItsMyConfigBuilderState {
  const initialState = createInitialItsMyConfigState();

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The imported YAML must be an object.');
  }

  const root = asRecord(value, 'root');
  const importedPlaceholders =
    root['custom-placeholder'] !== undefined
      ? asRecord(root['custom-placeholder'], 'custom-placeholder')
      : root;

  return {
    ...initialState,
    placeholders: initialState.placeholders.map((placeholder) => {
      const imported = importedPlaceholders[placeholder.id];

      if (!imported || typeof imported !== 'object' || Array.isArray(imported)) {
        return placeholder;
      }

      return deserializeImportedPlaceholder(placeholder, asRecord(imported, placeholder.id));
    }),
  };
}

function serializeItsMyConfigState(state: ItsMyConfigBuilderState) {
  const customPlaceholder: BuilderYamlObject = {};

  for (const placeholder of state.placeholders) {
    customPlaceholder[placeholder.id] = toItsMyConfigPlaceholderYaml(placeholder);
  }

  return `${dumpExactYaml({ 'custom-placeholder': customPlaceholder })}\n`;
}

function toItsMyConfigPlaceholderYaml(placeholder: ItsMyConfigPlaceholder): BuilderYamlObject {
  switch (placeholder.type) {
    case 'string':
      return {
        value: placeholder.value,
      };
    case 'colored_text':
      return {
        value: placeholder.value,
        type: placeholder.type,
      };
    case 'color':
      return {
        value: placeholder.value,
        type: placeholder.type,
        bold: trueOrUndefined(placeholder.bold),
        italic: trueOrUndefined(placeholder.italic),
        underlined: trueOrUndefined(placeholder.underlined),
        strikethrough: trueOrUndefined(placeholder.strikethrough),
        obfuscated: trueOrUndefined(placeholder.obfuscated),
      };
    case 'math':
      return {
        value: placeholder.value,
        type: placeholder.type,
        rounding: placeholder.rounding,
        precision: placeholder.precision,
      };
    case 'animation':
      return {
        values: placeholder.values,
        type: placeholder.type,
        interval: placeholder.interval,
      };
    case 'random':
      return {
        values: placeholder.values,
        type: placeholder.type,
      };
    case 'progress_bar':
      return {
        value: placeholder.value,
        type: placeholder.type,
        'completed-color': placeholder.completedColor,
        'progress-color': placeholder.progressColor,
        'remaining-color': placeholder.remainingColor,
      };
  }
}

function trueOrUndefined(value: boolean) {
  return value ? true : undefined;
}

function deserializeImportedPlaceholder(
  fallback: ItsMyConfigPlaceholder,
  imported: Record<string, unknown>,
): ItsMyConfigPlaceholder {
  const description = fallback.description;
  const importedType = normalizePlaceholderType(readString(imported.type, fallback.type));

  switch (importedType) {
    case 'color':
      return {
        id: fallback.id,
        description,
        type: 'color',
        value: readString(imported.value, fallback.type === 'color' ? fallback.value : 'white'),
        bold: readBoolean(imported.bold, fallback.type === 'color' ? fallback.bold : false),
        italic: readBoolean(imported.italic, fallback.type === 'color' ? fallback.italic : false),
        underlined: readBoolean(
          imported.underlined,
          fallback.type === 'color' ? fallback.underlined : false,
        ),
        strikethrough: readBoolean(
          imported.strikethrough,
          fallback.type === 'color' ? fallback.strikethrough : false,
        ),
        obfuscated: readBoolean(
          imported.obfuscated,
          fallback.type === 'color' ? fallback.obfuscated : false,
        ),
      };
    case 'colored_text':
      return {
        id: fallback.id,
        description,
        type: 'colored_text',
        value: readString(imported.value, getFallbackValue(fallback)),
      };
    case 'math':
      return {
        id: fallback.id,
        description,
        type: 'math',
        value: readString(imported.value, getFallbackValue(fallback)),
        rounding: readString(imported.rounding, getFallbackValue(fallback)),
        precision: Math.max(0, readInteger(imported.precision, fallback.type === 'math' ? fallback.precision : 0)),
      };
    case 'animation':
      return {
        id: fallback.id,
        description,
        type: 'animation',
        values: readStringValues(imported.values, fallback.type === 'animation' ? fallback.values : []),
        interval: Math.max(0, readInteger(imported.interval, fallback.type === 'animation' ? fallback.interval : 20)),
      };
    case 'random':
      return {
        id: fallback.id,
        description,
        type: 'random',
        values: readStringValues(imported.values, fallback.type === 'random' ? fallback.values : []),
      };
    case 'progress_bar':
      return {
        id: fallback.id,
        description,
        type: 'progress_bar',
        value: readString(imported.value, getFallbackValue(fallback)),
        completedColor: readString(
          imported['completed-color'],
          fallback.type === 'progress_bar' ? fallback.completedColor : '&a',
        ),
        progressColor: readString(
          imported['progress-color'],
          fallback.type === 'progress_bar' ? fallback.progressColor : '&e',
        ),
        remainingColor: readString(
          imported['remaining-color'],
          fallback.type === 'progress_bar' ? fallback.remainingColor : '&7',
        ),
      };
    case 'string':
    default:
      return {
        id: fallback.id,
        description,
        type: 'string',
        value: readString(imported.value, getFallbackValue(fallback)),
      };
  }
}

function getFallbackValue(fallback: ItsMyConfigPlaceholder) {
  switch (fallback.type) {
    case 'animation':
    case 'random':
      return fallback.values[0] ?? '';
    case 'string':
    case 'color':
    case 'colored_text':
    case 'math':
    case 'progress_bar':
      return fallback.value;
  }
}

function normalizePlaceholderType(value: string): ItsMyConfigPlaceholderType {
  switch (value) {
    case 'color':
    case 'colored_text':
    case 'math':
    case 'animation':
    case 'random':
    case 'progress_bar':
      return value;
    default:
      return 'string';
  }
}

function readStringValues(value: unknown, fallback: string[]) {
  if (typeof value === 'string') {
    return value.length > 0 ? value.split(/\r?\n/) : [];
  }

  if (Array.isArray(value)) {
    return asArray(value, 'values')
      .filter((item): item is string => typeof item === 'string');
  }

  return [...fallback];
}
