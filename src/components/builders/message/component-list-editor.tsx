'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { moveItem, removeAt, replaceAt } from '@/lib/builders/core';
import {
  CONTAINER_COMPONENTS,
  TOP_LEVEL_COMPONENTS,
  createComponent,
  describeComponent,
  formatComponentType,
  type AddableComponentType,
  type BuilderComponent,
} from '@/lib/builders/message';
import { cn } from '@/lib/cn';
import { ActionRowEditor } from './action-row-editor';
import { ContainerEditor } from './container-editor';
import { FileEditor } from './file-editor';
import { MediaGalleryEditor } from './media-gallery-editor';
import { RepeatEditor } from './repeat-editor';
import { SectionEditor } from './section-editor';
import { SeparatorEditor } from './separator-editor';
import { TextDisplayEditor } from './text-display-editor';
import { CollapsibleEditorCard, ReorderActions } from './shared';

function hasNestedBuilder(component: BuilderComponent) {
  switch (component.type) {
    case 'text-display':
    case 'separator':
    case 'file':
      return false;
    case 'action-row':
    case 'section':
    case 'container':
    case 'media-gallery':
    case 'repeat':
      return true;
  }
}

function summarizeNestedComponent(component: BuilderComponent) {
  switch (component.type) {
    case 'action-row': {
      const child = component.components[0];

      if (!child) return 'Empty row';
      if (child.type === 'select-menu') {
        return `Select menu • ${child.options.length} option${child.options.length === 1 ? '' : 's'}`;
      }

      return `${component.components.length} button${component.components.length === 1 ? '' : 's'}`;
    }
    case 'section':
      return `${component.components.length} text block${component.components.length === 1 ? '' : 's'} • ${formatComponentType(component.accessory?.type ?? 'button')} accessory`;
    case 'container':
      return `${component.components.length} nested component${component.components.length === 1 ? '' : 's'}${component.color ? ` • ${component.color}` : ''}${component.spoiler ? ' • spoiler' : ''}`;
    case 'media-gallery':
      return `${component.items.length} media item${component.items.length === 1 ? '' : 's'}`;
    case 'repeat':
      return `${component.dataSource || 'No data source'} • ${component.template.length} template block${component.template.length === 1 ? '' : 's'}`;
    case 'text-display':
    case 'separator':
    case 'file':
      return undefined;
  }
}

function AddComponentRow({
  allowedTypes,
  onAdd,
}: {
  allowedTypes: AddableComponentType[];
  onAdd: (type: AddableComponentType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-dashed px-4 py-3">
      {allowedTypes.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onAdd(type)}
          className={cn(buttonVariants({ color: 'secondary', size: 'sm' }), 'gap-2')}
        >
          <Plus className="size-3.5" />
          {formatComponentType(type)}
        </button>
      ))}
    </div>
  );
}

function ComponentEditor({
  component,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
  defaultOpen = false,
}: {
  component: BuilderComponent;
  onChange: (component: BuilderComponent) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  defaultOpen?: boolean;
}) {
  const collapsible = hasNestedBuilder(component);

  return (
    <CollapsibleEditorCard
      label={formatComponentType(component.type)}
      description={describeComponent(component.type)}
      summary={collapsible ? summarizeNestedComponent(component) : undefined}
      defaultOpen={collapsible && defaultOpen}
      collapsible={collapsible}
      actions={
        <ReorderActions
          itemLabel="component"
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
        />
      }
      className="rounded-xl border-fd-border/80"
    >

      {component.type === 'text-display' ? (
        <TextDisplayEditor component={component} onChange={onChange} />
      ) : null}

      {component.type === 'separator' ? (
        <SeparatorEditor component={component} onChange={onChange} />
      ) : null}

      {component.type === 'action-row' ? (
        <ActionRowEditor component={component} onChange={onChange} />
      ) : null}

      {component.type === 'section' ? (
        <SectionEditor component={component} onChange={onChange} />
      ) : null}

      {component.type === 'container' ? (
        <ContainerEditor component={component} onChange={onChange}>
          <ComponentListEditor
            components={component.components}
            onChange={(next) => onChange({ ...component, components: next })}
            allowedTypes={CONTAINER_COMPONENTS}
            emptyLabel="Add the first component inside this container."
          />
        </ContainerEditor>
      ) : null}

      {component.type === 'media-gallery' ? (
        <MediaGalleryEditor component={component} onChange={onChange} />
      ) : null}

      {component.type === 'file' ? (
        <FileEditor component={component} onChange={onChange} />
      ) : null}

      {component.type === 'repeat' ? (
        <RepeatEditor component={component} onChange={onChange}>
          <ComponentListEditor
            components={component.template}
            onChange={(template) => onChange({ ...component, template })}
            allowedTypes={TOP_LEVEL_COMPONENTS}
            emptyLabel="Add the first component inside the repeat template."
          />
        </RepeatEditor>
      ) : null}
    </CollapsibleEditorCard>
  );
}

export function ComponentListEditor({
  components,
  onChange,
  allowedTypes,
  emptyLabel,
}: {
  components: BuilderComponent[];
  onChange: (components: BuilderComponent[]) => void;
  allowedTypes: AddableComponentType[];
  emptyLabel: string;
}) {
  const [lastAddedComponentId, setLastAddedComponentId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-fd-background p-2">
      {components.length > 0 ? (
        components.map((component, index) => (
          <ComponentEditor
            key={component.id}
            component={component}
            defaultOpen={component.id === lastAddedComponentId}
            onChange={(next) => onChange(replaceAt(components, index, next))}
            onMoveUp={() => onChange(moveItem(components, index, index - 1))}
            onMoveDown={() => onChange(moveItem(components, index, index + 1))}
            onRemove={() => onChange(removeAt(components, index))}
            canMoveUp={index > 0}
            canMoveDown={index < components.length - 1}
          />
        ))
      ) : (
        <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-fd-muted-foreground">
          {emptyLabel}
        </div>
      )}

      <AddComponentRow
        allowedTypes={allowedTypes}
        onAdd={(type) => {
          const nextComponent = createComponent(type);
          setLastAddedComponentId(nextComponent.id);
          onChange([...components, nextComponent]);
        }}
      />
    </div>
  );
}
