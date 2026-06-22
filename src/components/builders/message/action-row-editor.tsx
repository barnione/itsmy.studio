'use client';

import { Plus } from 'lucide-react';
import { BuilderField } from '@/components/builders/ui';
import {
  ACTION_ROW_COMPONENTS,
  createActionRowChildComponent,
  formatComponentType,
  type ActionRowChildComponent,
  type ActionRowComponent,
  type AddableActionRowComponentType,
  type ButtonComponent,
  type SelectMenuComponent,
} from '@/lib/builders/message';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { moveItem, removeAt, replaceAt } from '@/lib/builders/core';
import { cn } from '@/lib/cn';
import { ButtonEditor } from './button-editor';
import { SelectMenuEditor } from './select-menu-editor';

function ActionRowAddRow({
  currentComponents,
  onAdd,
}: {
  currentComponents: ActionRowChildComponent[];
  onAdd: (type: AddableActionRowComponentType) => void;
}) {
  const hasSelectMenu = currentComponents.some((component) => component.type === 'select-menu');
  const buttonCount = currentComponents.filter((component) => component.type === 'button').length;

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-dashed px-4 py-3">
      {ACTION_ROW_COMPONENTS.map((type) => {
        const disabled =
          type === 'button'
            ? hasSelectMenu || buttonCount >= 5
            : hasSelectMenu || buttonCount > 0;

        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onAdd(type)}
            className={cn(buttonVariants({ color: 'secondary', size: 'sm' }), 'gap-2')}
          >
            <Plus className="size-3.5" />
            {formatComponentType(type)}
          </button>
        );
      })}
    </div>
  );
}

function ActionRowItemsEditor({
  components,
  onChange,
}: {
  components: ActionRowChildComponent[];
  onChange: (components: ActionRowChildComponent[]) => void;
}) {
  const hasSelectMenu = components.some((component) => component.type === 'select-menu');
  const buttons = components.filter(
    (component): component is ButtonComponent => component.type === 'button',
  );
  const selectMenu = components.find(
    (component): component is SelectMenuComponent => component.type === 'select-menu',
  );

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-fd-background p-2">
      {hasSelectMenu && selectMenu ? (
        <SelectMenuEditor
          menu={selectMenu}
          allowRemove
          collapsible={false}
          onChange={(next) => onChange([next])}
          onRemove={() => onChange([])}
        />
      ) : (
        buttons.map((button, index) => (
          <ButtonEditor
            key={button.id}
            button={button}
            onChange={(next) => onChange(replaceAt(buttons, index, next))}
            onMoveUp={() => onChange(moveItem(buttons, index, index - 1))}
            onMoveDown={() => onChange(moveItem(buttons, index, index + 1))}
            onRemove={() => onChange(removeAt(buttons, index))}
            canMoveUp={index > 0}
            canMoveDown={index < buttons.length - 1}
            allowRemove
          />
        ))
      )}

      <ActionRowAddRow
        currentComponents={components}
        onAdd={(type) => {
          if (type === 'select-menu') {
            const nextComponent = createActionRowChildComponent('select-menu');
            onChange([nextComponent]);
            return;
          }

          const nextComponent = createActionRowChildComponent('button');
          onChange([...buttons, nextComponent]);
        }}
      />
    </div>
  );
}

export function ActionRowEditor({
  component,
  onChange,
}: {
  component: ActionRowComponent;
  onChange: (component: ActionRowComponent) => void;
}) {
  return (
    <BuilderField
      label="Components"
      description="Use buttons or one select menu inside the action row."
    >
      <ActionRowItemsEditor
        components={component.components}
        onChange={(next) => onChange({ ...component, components: next })}
      />
    </BuilderField>
  );
}
