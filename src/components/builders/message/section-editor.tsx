'use client';

import { BuilderField, BuilderOptionTabs } from '@/components/builders/ui';
import { createAccessory, createTextDisplay, type SectionComponent, type TextDisplayComponent } from '@/lib/builders/message';
import { moveItem, removeAt, replaceAt } from '@/lib/builders/core';
import { ButtonEditor } from './button-editor';
import { TextDisplayEditor } from './text-display-editor';
import { ThumbnailEditor } from './thumbnail-editor';
import { AddItemButton, NestedEditorCard, ReorderActions } from './shared';

const sectionAccessoryOptions = [
  { value: 'button', label: 'Button', hint: 'Interactive accessory' },
  { value: 'thumbnail', label: 'Thumbnail', hint: 'Image accessory' },
] as const;

function SectionTextListEditor({
  components,
  onChange,
}: {
  components: TextDisplayComponent[];
  onChange: (components: TextDisplayComponent[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-fd-background p-2">
      {components.map((component, index) => (
        <NestedEditorCard
          key={component.id}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-fd-muted-foreground">
              Text Display
            </p>
            <ReorderActions
              itemLabel="text block"
              canMoveUp={index > 0}
              canMoveDown={index < components.length - 1}
              onMoveUp={() => onChange(moveItem(components, index, index - 1))}
              onMoveDown={() => onChange(moveItem(components, index, index + 1))}
              onRemove={() => onChange(removeAt(components, index))}
            />
          </div>

          <TextDisplayEditor
            component={component}
            onChange={(next) => onChange(replaceAt(components, index, next))}
          />
        </NestedEditorCard>
      ))}

      <AddItemButton
        label="Add Text Display"
        onClick={() => {
          const nextComponent = createTextDisplay('Another text block');
          onChange([...components, nextComponent]);
        }}
      />
    </div>
  );
}

export function SectionEditor({
  component,
  onChange,
}: {
  component: SectionComponent;
  onChange: (component: SectionComponent) => void;
}) {
  function setSectionAccessoryType(type: 'button' | 'thumbnail') {
    if (component.accessory?.type === type) return;

    onChange({
      ...component,
      accessory: createAccessory(type),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <BuilderField
        label="Text Blocks"
        description="Sections support text-display components on the left side."
      >
        <SectionTextListEditor
          components={component.components}
          onChange={(next) => onChange({ ...component, components: next })}
        />
      </BuilderField>

      <BuilderField
        label="Accessory"
        description="Accessory displayed on the right side of the section."
        headerControl={
          <BuilderOptionTabs
            compact
            value={component.accessory?.type ?? 'button'}
            onChange={setSectionAccessoryType}
            options={[...sectionAccessoryOptions]}
          />
        }
      >
        <div className="rounded-lg bg-fd-background p-2">
          {component.accessory?.type === 'button' ? (
            <ButtonEditor
              button={component.accessory}
              onChange={(button) => onChange({ ...component, accessory: button })}
              allowRemove={false}
            />
          ) : null}

          {component.accessory?.type === 'thumbnail' ? (
            <ThumbnailEditor
              thumbnail={component.accessory}
              onChange={(thumbnail) =>
                onChange({
                  ...component,
                  accessory: thumbnail,
                })
              }
            />
          ) : null}
        </div>
      </BuilderField>
    </div>
  );
}
