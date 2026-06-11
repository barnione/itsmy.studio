import {
  createIdFactory,
  dumpExactYaml,
  type BuilderDefinition,
} from './core';
import { buildGeneratedModalConfig } from './generated';
import { asRecord, readBoolean, readInteger, readString } from './import-utils';
import type {
  SelectMenuComponent,
  SelectMenuOption,
  TextDisplayComponent,
} from './message';

export type AddableModalComponentType = 'text-display' | 'label';
export type TextInputStyle = 'short' | 'paragraph';

export type TextInputComponent = {
  id: string;
  type: 'text-input';
  style: TextInputStyle;
  customId: string;
  placeholder: string;
  minLength: number | null;
  maxLength: number | null;
  required: boolean;
  value: string;
};

export type FileUploadComponent = {
  id: string;
  type: 'file-upload';
  customId: string;
  minValues: number | null;
  maxValues: number;
  required: boolean;
};

export type CheckboxComponent = {
  id: string;
  type: 'checkbox';
  customId: string;
  default: boolean;
};

export type ModalChoiceOption = {
  id: string;
  label: string;
  value: string;
  description: string;
  default: boolean;
};

export type CheckboxGroupComponent = {
  id: string;
  type: 'checkbox-group';
  customId: string;
  required: boolean;
  minValues: number | null;
  maxValues: number | null;
  options: ModalChoiceOption[];
};

export type RadioGroupComponent = {
  id: string;
  type: 'radio-group';
  customId: string;
  required: boolean;
  options: ModalChoiceOption[];
};

export type ModalInputComponent =
  | TextInputComponent
  | SelectMenuComponent
  | FileUploadComponent
  | CheckboxComponent
  | CheckboxGroupComponent
  | RadioGroupComponent;

export type ModalInputComponentType = ModalInputComponent['type'];

export type LabelComponent = {
  id: string;
  type: 'label';
  label: string;
  description: string;
  component: ModalInputComponent;
};

export type ModalBuilderComponent = TextDisplayComponent | LabelComponent;

export type ModalBuilderState = {
  title: string;
  customId: string;
  components: ModalBuilderComponent[];
};

export const MODAL_COMPONENTS: AddableModalComponentType[] = ['text-display', 'label'];
export const MODAL_INPUT_COMPONENTS: ModalInputComponentType[] = [
  'text-input',
  'select-menu',
  'file-upload',
  'checkbox',
  'checkbox-group',
  'radio-group',
];
export const TEXT_INPUT_STYLES: TextInputStyle[] = ['short', 'paragraph'];

const nextModalId = createIdFactory();

function createModalTextDisplay(
  content = 'Explain what the modal is for before showing the fields.',
): TextDisplayComponent {
  return {
    id: nextModalId('modal-text'),
    type: 'text-display',
    content,
  };
}

export function createModalSelectMenuOption(
  overrides: Partial<Omit<SelectMenuOption, 'id'>> = {},
): SelectMenuOption {
  return {
    id: nextModalId('modal-select-option'),
    label: 'Option',
    value: 'option',
    ...overrides,
  };
}

export function createModalChoiceOption(
  overrides: Partial<Omit<ModalChoiceOption, 'id'>> = {},
): ModalChoiceOption {
  return {
    id: nextModalId('modal-choice-option'),
    label: 'Option',
    value: 'option',
    description: '',
    default: false,
    ...overrides,
  };
}

function createModalSelectMenu(
  overrides: Partial<Omit<SelectMenuComponent, 'id' | 'type'>> = {},
): SelectMenuComponent {
  return {
    id: nextModalId('modal-select-menu'),
    type: 'select-menu',
    customId: 'modal_select',
    placeholder: 'Select an option',
    minValues: 1,
    maxValues: 1,
    options: [
      createModalSelectMenuOption({ label: 'Option 1', value: 'option_1' }),
      createModalSelectMenuOption({ label: 'Option 2', value: 'option_2' }),
    ],
    ...overrides,
  };
}

function createTextInput(
  overrides: Partial<Omit<TextInputComponent, 'id' | 'type'>> = {},
): TextInputComponent {
  return {
    id: nextModalId('modal-text-input'),
    type: 'text-input',
    style: 'short',
    customId: 'modal_text_input',
    placeholder: '',
    minLength: null,
    maxLength: null,
    required: true,
    value: '',
    ...overrides,
  };
}

function createFileUpload(
  overrides: Partial<Omit<FileUploadComponent, 'id' | 'type'>> = {},
): FileUploadComponent {
  return {
    id: nextModalId('modal-file-upload'),
    type: 'file-upload',
    customId: 'modal_file_upload',
    minValues: null,
    maxValues: 1,
    required: false,
    ...overrides,
  };
}

function createCheckbox(
  overrides: Partial<Omit<CheckboxComponent, 'id' | 'type'>> = {},
): CheckboxComponent {
  return {
    id: nextModalId('modal-checkbox'),
    type: 'checkbox',
    customId: 'modal_checkbox',
    default: false,
    ...overrides,
  };
}

function createCheckboxGroup(
  overrides: Partial<Omit<CheckboxGroupComponent, 'id' | 'type'>> = {},
): CheckboxGroupComponent {
  return {
    id: nextModalId('modal-checkbox-group'),
    type: 'checkbox-group',
    customId: 'modal_checkbox_group',
    required: false,
    minValues: null,
    maxValues: null,
    options: [
      createModalChoiceOption({ label: 'Option 1', value: 'option_1' }),
      createModalChoiceOption({ label: 'Option 2', value: 'option_2' }),
    ],
    ...overrides,
  };
}

function createRadioGroup(
  overrides: Partial<Omit<RadioGroupComponent, 'id' | 'type'>> = {},
): RadioGroupComponent {
  return {
    id: nextModalId('modal-radio-group'),
    type: 'radio-group',
    customId: 'modal_radio_group',
    required: false,
    options: [
      createModalChoiceOption({ label: 'Option 1', value: 'option_1' }),
      createModalChoiceOption({ label: 'Option 2', value: 'option_2' }),
    ],
    ...overrides,
  };
}

function createLabel(): LabelComponent {
  return {
    id: nextModalId('modal-label'),
    type: 'label',
    label: 'Question',
    description: 'Help the user understand what to enter.',
    component: createTextInput(),
  };
}

export function createModalComponent(type: AddableModalComponentType): ModalBuilderComponent {
  switch (type) {
    case 'text-display':
      return createModalTextDisplay();
    case 'label':
      return createLabel();
  }
}

export function createModalInputComponent(type: ModalInputComponentType): ModalInputComponent {
  switch (type) {
    case 'text-input':
      return createTextInput();
    case 'select-menu':
      return createModalSelectMenu();
    case 'file-upload':
      return createFileUpload();
    case 'checkbox':
      return createCheckbox();
    case 'checkbox-group':
      return createCheckboxGroup();
    case 'radio-group':
      return createRadioGroup();
  }
}

function createInitialModalBuilderState(): ModalBuilderState {
  return {
    title: 'Feedback Modal',
    customId: 'feedback_modal',
    components: [
      createModalTextDisplay('Tell users what you need before they fill the modal.'),
      createLabel(),
    ],
  };
}

export function formatModalComponentType(
  type: AddableModalComponentType | ModalInputComponentType,
) {
  switch (type) {
    case 'text-display':
      return 'Text Display';
    case 'label':
      return 'Label';
    case 'text-input':
      return 'Text Input';
    case 'select-menu':
      return 'Select Menu';
    case 'file-upload':
      return 'File Upload';
    case 'checkbox':
      return 'Checkbox';
    case 'checkbox-group':
      return 'Checkbox Group';
    case 'radio-group':
      return 'Radio Group';
  }
}

export function describeModalComponent(
  type: AddableModalComponentType | ModalInputComponentType,
) {
  switch (type) {
    case 'text-display':
      return 'Plain text shown at the top of the modal.';
    case 'label':
      return 'A labeled field wrapping one modal input component.';
    case 'text-input':
      return 'Collect short or long text directly from the user.';
    case 'select-menu':
      return 'Let the user choose one or more predefined options.';
    case 'file-upload':
      return 'Allow the user to upload one or more files in the modal.';
    case 'checkbox':
      return 'Single boolean choice shown as a checkbox.';
    case 'checkbox-group':
      return 'Multiple checkbox options inside one field.';
    case 'radio-group':
      return 'Single-choice radio options inside one field.';
  }
}

function serializeModalConfig(config: ModalBuilderState) {
  return dumpExactYaml(buildGeneratedModalConfig(config));
}

export function deserializeModalConfig(value: unknown): ModalBuilderState {
  const root = asRecord(value, 'modal');

  return {
    title: readString(root.title, 'Untitled Modal'),
    customId: readString(root['custom-id']),
    components: Array.isArray(root.components)
      ? root.components.map((component, index) =>
          deserializeModalComponent(component, `components[${index}]`),
        )
      : [],
  };
}

function deserializeModalComponent(value: unknown, path: string): ModalBuilderComponent {
  const component = asRecord(value, path);
  const type = readString(component.type);

  switch (type) {
    case 'text-display':
      return createModalTextDisplay(readString(component.content));
    case 'label':
      return {
        ...createLabel(),
        label: readString(component.label),
        description: readString(component.description),
        component: deserializeModalInputComponent(component.component, `${path}.component`),
      };
    default:
      throw new Error(`${path}.type "${type}" is not supported by the modal builder.`);
  }
}

function deserializeModalInputComponent(
  value: unknown,
  path: string,
): ModalInputComponent {
  const component = asRecord(value, path);
  const type = readString(component.type);

  switch (type) {
    case 'text-input':
      return createTextInput({
        style: normalizeTextInputStyle(readString(component.style, 'short')),
        customId: readString(component['custom-id']),
        placeholder: readString(component.placeholder),
        minLength:
          component['min-length'] === undefined
            ? null
            : readInteger(component['min-length'], 0),
        maxLength:
          component['max-length'] === undefined
            ? null
            : readInteger(component['max-length'], 0),
        required: readBoolean(component.required, false),
        value: readString(component.value),
      });
    case 'select-menu':
      return createModalSelectMenu({
        customId: readString(component['custom-id']),
        placeholder: readString(component.placeholder),
        minValues: readInteger(component['min-values'], 1),
        maxValues: readInteger(component['max-values'], 1),
        options: Array.isArray(component.options)
          ? component.options.map((option, index) =>
              deserializeModalSelectMenuOption(option, `${path}.options[${index}]`),
            )
          : [],
      });
    case 'file-upload':
      return createFileUpload({
        customId: readString(component['custom-id']),
        required: readBoolean(component.required, false),
        minValues:
          component['min-values'] === undefined
            ? null
            : readInteger(component['min-values'], 0),
        maxValues:
          component['max-values'] === undefined
            ? 1
            : readInteger(component['max-values'], 1),
      });
    case 'checkbox':
      return createCheckbox({
        customId: readString(component['custom-id']),
        default: readBoolean(component.default, false),
      });
    case 'checkbox-group':
      return createCheckboxGroup({
        customId: readString(component['custom-id']),
        required: readBoolean(component.required, false),
        minValues:
          component['min-values'] === undefined
            ? null
            : readInteger(component['min-values'], 0),
        maxValues:
          component['max-values'] === undefined
            ? null
            : readInteger(component['max-values'], 1),
        options: Array.isArray(component.options)
          ? component.options.map((option, index) =>
              deserializeModalChoiceOption(option, `${path}.options[${index}]`),
            )
          : [],
      });
    case 'radio-group':
      return createRadioGroup({
        customId: readString(component['custom-id']),
        required: readBoolean(component.required, false),
        options: Array.isArray(component.options)
          ? component.options.map((option, index) =>
              deserializeModalChoiceOption(option, `${path}.options[${index}]`),
            )
          : [],
      });
    default:
      throw new Error(`${path}.type "${type}" is not supported inside modal label.`);
  }
}

function deserializeModalSelectMenuOption(value: unknown, path: string): SelectMenuOption {
  const option = asRecord(value, path);

  return createModalSelectMenuOption({
    label: readString(option.label),
    value: readString(option.value),
  });
}

function deserializeModalChoiceOption(value: unknown, path: string): ModalChoiceOption {
  const option = asRecord(value, path);

  return createModalChoiceOption({
    label: readString(option.label),
    value: readString(option.value),
    description: readString(option.description),
    default: readBoolean(option.default, false),
  });
}

function normalizeTextInputStyle(style: string): TextInputStyle {
  return style.toLowerCase() === 'paragraph' ? 'paragraph' : 'short';
}

export const MODAL_BUILDER_DEFINITION: BuilderDefinition<ModalBuilderState> = {
  kind: 'modal',
  label: 'Modal Builder',
  description: 'Build Discord modals and export the matching YAML.',
  output: {
    title: 'Generated YAML',
    description: 'Copy this output into modal fields, modal actions, or preset configurations.',
    lang: 'yaml',
  },
  createInitialState: createInitialModalBuilderState,
  serialize: serializeModalConfig,
};
