import {
  createIdFactory,
  dumpExactYaml,
  type BuilderDefinition,
} from './core';
import { buildGeneratedMessageComponent, buildGeneratedMessageConfig } from './generated';
import { asRecord, readBoolean, readInteger, readString } from './import-utils';

export type ButtonStyle = 'primary' | 'secondary' | 'success' | 'danger' | 'link';
export type AddableComponentType =
  | 'text-display'
  | 'container'
  | 'section'
  | 'action-row'
  | 'media-gallery'
  | 'separator'
  | 'file'
  | 'repeat';
export type AddableActionRowComponentType = 'button' | 'select-menu';

export type TextDisplayComponent = {
  id: string;
  type: 'text-display';
  content: string;
};

export type SeparatorComponent = {
  id: string;
  type: 'separator';
  spacing: 1 | 2;
  divider: boolean;
};

export type ButtonComponent = {
  id: string;
  type: 'button';
  label: string;
  style: ButtonStyle;
  customId: string;
  url: string;
  emoji: string;
  disabled: boolean;
};

export type SelectMenuOption = {
  id: string;
  label: string;
  value: string;
};

export type SelectMenuComponent = {
  id: string;
  type: 'select-menu';
  customId: string;
  placeholder: string;
  minValues: number;
  maxValues: number;
  options: SelectMenuOption[];
};

export type ThumbnailComponent = {
  id: string;
  type: 'thumbnail';
  url: string;
};

export type MediaGalleryItem = {
  id: string;
  url: string;
  description: string;
  spoiler: boolean;
};

export type MediaGalleryComponent = {
  id: string;
  type: 'media-gallery';
  items: MediaGalleryItem[];
};

export type FileComponent = {
  id: string;
  type: 'file';
  url: string;
  spoiler: boolean;
};

export type RepeatComponent = {
  id: string;
  type: 'repeat';
  dataSource: string;
  template: BuilderComponent[];
};

export type ActionRowChildComponent = ButtonComponent | SelectMenuComponent;

export type ActionRowComponent = {
  id: string;
  type: 'action-row';
  components: ActionRowChildComponent[];
};

export type SectionAccessory = ButtonComponent | ThumbnailComponent;

export type SectionComponent = {
  id: string;
  type: 'section';
  components: TextDisplayComponent[];
  accessory: SectionAccessory | null;
};

export type ContainerComponent = {
  id: string;
  type: 'container';
  color: string;
  spoiler: boolean;
  components: BuilderComponent[];
};

export type BuilderComponent =
  | TextDisplayComponent
  | SeparatorComponent
  | ActionRowComponent
  | SectionComponent
  | ContainerComponent
  | MediaGalleryComponent
  | FileComponent
  | RepeatComponent;

export type DisplayComponentType =
  | AddableComponentType
  | AddableActionRowComponentType
  | SectionAccessory['type'];

export type MessageBuilderState = {
  ephemeral: boolean;
  disableMentions: boolean;
  components: BuilderComponent[];
};

export const TOP_LEVEL_COMPONENTS: AddableComponentType[] = [
  'text-display',
  'container',
  'section',
  'action-row',
  'media-gallery',
  'separator',
  'file',
  'repeat',
];

export const CONTAINER_COMPONENTS: AddableComponentType[] = [
  'text-display',
  'section',
  'action-row',
  'media-gallery',
  'separator',
  'file',
  'repeat',
];

export const ACTION_ROW_COMPONENTS: AddableActionRowComponentType[] = ['button', 'select-menu'];

export const BUTTON_STYLES: ButtonStyle[] = [
  'primary',
  'secondary',
  'success',
  'danger',
  'link',
];

const nextMessageId = createIdFactory();

export function createTextDisplay(
  content = '### Welcome\nBuild your message here and copy the generated YAML.',
): TextDisplayComponent {
  return {
    id: nextMessageId('text'),
    type: 'text-display',
    content,
  };
}

function createButton(
  overrides: Partial<Omit<ButtonComponent, 'id' | 'type'>> = {},
): ButtonComponent {
  return {
    id: nextMessageId('button'),
    type: 'button',
    label: 'Click me',
    style: 'primary',
    customId: 'script_button',
    url: '',
    emoji: '',
    disabled: false,
    ...overrides,
  };
}

export function createSelectMenuOption(
  overrides: Partial<Omit<SelectMenuOption, 'id'>> = {},
): SelectMenuOption {
  return {
    id: nextMessageId('select-option'),
    label: 'Option',
    value: 'option',
    ...overrides,
  };
}

function createSelectMenu(
  overrides: Partial<Omit<SelectMenuComponent, 'id' | 'type'>> = {},
): SelectMenuComponent {
  return {
    id: nextMessageId('select-menu'),
    type: 'select-menu',
    customId: 'script_select_menu',
    placeholder: 'Select an option',
    minValues: 1,
    maxValues: 1,
    options: [
      createSelectMenuOption({ label: 'Option 1', value: 'option_1' }),
      createSelectMenuOption({ label: 'Option 2', value: 'option_2' }),
    ],
    ...overrides,
  };
}

function createThumbnail(
  url = 'https://itsmy.studio/itsmystudio-logo.svg',
): ThumbnailComponent {
  return {
    id: nextMessageId('thumbnail'),
    type: 'thumbnail',
    url,
  };
}

export function createMediaGalleryItem(
  overrides: Partial<Omit<MediaGalleryItem, 'id'>> = {},
): MediaGalleryItem {
  return {
    id: nextMessageId('media-item'),
    url: 'https://itsmy.studio/itsmystudio-logo.svg',
    description: '',
    spoiler: false,
    ...overrides,
  };
}

function createMediaGallery(
  items: MediaGalleryItem[] = [
    createMediaGalleryItem(),
    createMediaGalleryItem(),
  ],
): MediaGalleryComponent {
  return {
    id: nextMessageId('media-gallery'),
    type: 'media-gallery',
    items,
  };
}

function createFile(
  overrides: Partial<Omit<FileComponent, 'id' | 'type'>> = {},
): FileComponent {
  return {
    id: nextMessageId('file'),
    type: 'file',
    url: 'https://itsmy.studio/itsmystudio-logo.svg',
    spoiler: false,
    ...overrides,
  };
}

function createRepeat(
  overrides: Partial<Omit<RepeatComponent, 'id' | 'type'>> = {},
): RepeatComponent {
  return {
    id: nextMessageId('repeat'),
    type: 'repeat',
    dataSource: 'pagination-items',
    template: [createTextDisplay('Repeated item content')],
    ...overrides,
  };
}

function createActionRow(
  components: ActionRowChildComponent[] = [
    createButton({
      label: 'Join Discord',
      style: 'link',
      url: 'https://itsmy.studio/discord',
      customId: '',
    }),
  ],
): ActionRowComponent {
  return {
    id: nextMessageId('action-row'),
    type: 'action-row',
    components,
  };
}

function createSection(): SectionComponent {
  return {
    id: nextMessageId('section'),
    type: 'section',
    components: [createTextDisplay('Section title\nMore details about your message go here.')],
    accessory: createAccessory('button'),
  };
}

function createContainer(): ContainerComponent {
  return {
    id: nextMessageId('container'),
    type: 'container',
    color: '#5865F2',
    spoiler: false,
    components: [createTextDisplay('This content is grouped inside a container.')],
  };
}

function createSeparator(): SeparatorComponent {
  return {
    id: nextMessageId('separator'),
    type: 'separator',
    spacing: 1,
    divider: true,
  };
}

export function createActionRowChildComponent(
  type: AddableActionRowComponentType,
): ActionRowChildComponent {
  switch (type) {
    case 'button':
      return createButton();
    case 'select-menu':
      return createSelectMenu();
  }
}

export function createComponent(type: AddableComponentType): BuilderComponent {
  switch (type) {
    case 'text-display':
      return createTextDisplay('Your text here');
    case 'container':
      return createContainer();
    case 'section':
      return createSection();
    case 'action-row':
      return createActionRow();
    case 'media-gallery':
      return createMediaGallery();
    case 'separator':
      return createSeparator();
    case 'file':
      return createFile();
    case 'repeat':
      return createRepeat();
  }
}

export function createAccessory(type: string): SectionAccessory | null {
  if (type === 'button') {
    return createButton({
      label: 'Learn more',
      style: 'link',
      url: 'https://itsmy.studio/discord',
      customId: '',
    });
  }

  if (type === 'thumbnail') {
    return createThumbnail();
  }

  return null;
}

function createInitialMessageBuilderState(): MessageBuilderState {
  return {
    ephemeral: false,
    disableMentions: false,
    components: [
      createTextDisplay(
        '### Welcome [[member_display_name]]\nThanks for joining **%guild_name%**.',
      ),
      createTextDisplay(
        'Use placeholders, markdown, buttons, sections, galleries, and files to shape the message.',
      ),
      createActionRow(),
    ],
  };
}

export function formatComponentType(type: DisplayComponentType) {
  switch (type) {
    case 'text-display':
      return 'Text Display';
    case 'container':
      return 'Container';
    case 'section':
      return 'Section';
    case 'action-row':
      return 'Action Row';
    case 'media-gallery':
      return 'Media Gallery';
    case 'separator':
      return 'Separator';
    case 'file':
      return 'File';
    case 'repeat':
      return 'Repeat';
    case 'button':
      return 'Button';
    case 'select-menu':
      return 'Select Menu';
    case 'thumbnail':
      return 'Thumbnail';
  }
}

export function describeComponent(type: DisplayComponentType) {
  switch (type) {
    case 'text-display':
      return 'Plain text with Discord markdown support.';
    case 'container':
      return 'Group multiple blocks under a colored wrapper.';
    case 'section':
      return 'Text on the left with an accessory on the right.';
    case 'action-row':
      return 'A row of buttons or one select menu.';
    case 'media-gallery':
      return 'Display multiple media items in a gallery.';
    case 'separator':
      return 'Add spacing or a divider line.';
    case 'file':
      return 'Attach a file or image to the message.';
    case 'repeat':
      return 'Repeat a template from a data source.';
    case 'button':
      return 'Trigger actions or open external links.';
    case 'select-menu':
      return 'Let users pick one or more options.';
    case 'thumbnail':
      return 'Display an image accessory inside a section.';
  }
}

function serializeMessageConfig(config: MessageBuilderState) {
  return dumpExactYaml(buildGeneratedMessageConfig(config));
}

export function deserializeMessageConfig(value: unknown): MessageBuilderState {
  const root = asRecord(value, 'message');

  return {
    ephemeral: readBoolean(root.ephemeral),
    disableMentions: readBoolean(root['disable-mentions']),
    components: deserializeMessageComponents(root.components, 'components'),
  };
}

function deserializeMessageComponents(value: unknown, path = 'components'): BuilderComponent[] {
  if (!Array.isArray(value)) return [];

  return value.map((component, index) =>
    deserializeBuilderComponent(component, `${path}[${index}]`),
  );
}

function deserializeBuilderComponent(value: unknown, path: string): BuilderComponent {
  const component = asRecord(value, path);
  const type = readString(component.type);

  switch (type) {
    case 'text-display':
      return createTextDisplay(readString(component.content));
    case 'separator':
      return {
        ...createSeparator(),
        spacing: readInteger(component.spacing, 1) === 2 ? 2 : 1,
        divider: readBoolean(component.divider, true),
      };
    case 'action-row':
      return createActionRow(
        Array.isArray(component.components)
          ? component.components.map((child, index) =>
              deserializeActionRowChild(child, `${path}.components[${index}]`),
            )
          : [],
      );
    case 'section':
      return {
        ...createSection(),
        components: Array.isArray(component.components)
          ? component.components
              .map((child, index) =>
                deserializeSectionTextDisplay(child, `${path}.components[${index}]`),
              )
              .filter((child): child is TextDisplayComponent => child !== null)
          : [],
        accessory:
          component.accessory === undefined
            ? null
            : deserializeAccessory(component.accessory, `${path}.accessory`),
      };
    case 'container':
      return {
        ...createContainer(),
        color: readString(component.color),
        spoiler: readBoolean(component.spoiler),
        components: Array.isArray(component.components)
          ? component.components.map((child, index) =>
              deserializeBuilderComponent(child, `${path}.components[${index}]`),
            )
          : [],
      };
    case 'media-gallery':
      return createMediaGallery(
        Array.isArray(component.items)
          ? component.items.map((item, index) =>
              deserializeMediaGalleryItem(item, `${path}.items[${index}]`),
            )
          : [],
      );
    case 'file':
      return createFile({
        url: readString(component.url),
        spoiler: readBoolean(component.spoiler),
      });
    case 'repeat':
      return createRepeat({
        dataSource: readString(component['data-source']),
        template: Array.isArray(component.template)
          ? component.template.map((child, index) =>
              deserializeBuilderComponent(child, `${path}.template[${index}]`),
            )
          : [],
      });
    default:
      throw new Error(`${path}.type "${type}" is not supported by the message builder.`);
  }
}

function deserializeSectionTextDisplay(
  value: unknown,
  path: string,
): TextDisplayComponent | null {
  const component = asRecord(value, path);

  if (readString(component.type) !== 'text-display') {
    return null;
  }

  return createTextDisplay(readString(component.content));
}

function deserializeActionRowChild(value: unknown, path: string): ActionRowChildComponent {
  const component = asRecord(value, path);
  const type = readString(component.type);

  switch (type) {
    case 'button':
      return deserializeButton(component);
    case 'select-menu':
      return deserializeSelectMenu(component, path);
    default:
      throw new Error(`${path}.type "${type}" is not supported inside action-row.`);
  }
}

function deserializeAccessory(value: unknown, path: string): SectionAccessory | null {
  const component = asRecord(value, path);
  const type = readString(component.type);

  switch (type) {
    case 'button':
      return deserializeButton(component);
    case 'thumbnail':
      return createThumbnail(readString(component.url));
    default:
      throw new Error(`${path}.type "${type}" is not supported as a section accessory.`);
  }
}

function deserializeButton(component: Record<string, unknown>): ButtonComponent {
  const rawStyle = readString(component.style, 'primary').toLowerCase();
  const style = normalizeButtonStyle(rawStyle);

  return createButton({
    label: readString(component.label),
    style,
    customId: style === 'link' ? '' : readString(component['custom-id']),
    url: style === 'link' ? readString(component.url) : '',
    emoji: readString(component.emoji),
    disabled: readBoolean(component.disabled),
  });
}

function deserializeSelectMenu(value: unknown, path: string): SelectMenuComponent {
  const component = asRecord(value, path);

  return createSelectMenu({
    customId: readString(component['custom-id']),
    placeholder: readString(component.placeholder),
    minValues: readInteger(component['min-values'], 1),
    maxValues: readInteger(component['max-values'], 1),
    options: Array.isArray(component.options)
      ? component.options.map((option, index) =>
          deserializeSelectMenuOption(option, `${path}.options[${index}]`),
        )
      : [],
  });
}

function deserializeSelectMenuOption(value: unknown, path: string): SelectMenuOption {
  const option = asRecord(value, path);

  return createSelectMenuOption({
    label: readString(option.label),
    value: readString(option.value),
  });
}

function deserializeMediaGalleryItem(value: unknown, path: string): MediaGalleryItem {
  const item = asRecord(value, path);

  return createMediaGalleryItem({
    url: readString(item.url),
    description: readString(item.description),
    spoiler: readBoolean(item.spoiler),
  });
}

function normalizeButtonStyle(style: string): ButtonStyle {
  switch (style) {
    case 'url':
    case 'link':
      return 'link';
    case 'secondary':
    case 'success':
    case 'danger':
      return style;
    default:
      return 'primary';
  }
}

export const MESSAGE_BUILDER_DEFINITION: BuilderDefinition<MessageBuilderState> = {
  kind: 'message',
  label: 'Message Builder',
  description: 'Build Discord message blocks and export the matching YAML.',
  output: {
    title: 'Generated YAML',
    description:
      'Copy this output into sendMessage, reply, editMessage, presets, or any other message field.',
    lang: 'yaml'
  },
  createInitialState: createInitialMessageBuilderState,
  serialize: serializeMessageConfig,
};
