'use client';

import {
  BuilderField,
  BuilderOptionTabs,
  BuilderToggleField,
  builderInputClassName,
} from '@/components/builders/ui';
import {
  BUTTON_STYLES,
  type ButtonComponent,
  type ButtonStyle,
} from '@/lib/builders/message';
import { CollapsibleEditorCard, ReorderActions } from './shared';

const buttonStyleOptions: { value: ButtonStyle; label: string; hint: string }[] = BUTTON_STYLES.map(
  (style) => ({
    value: style,
    label: style.charAt(0).toUpperCase() + style.slice(1),
    hint: style,
  }),
);

export function ButtonEditor({
  button,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp = false,
  canMoveDown = false,
  allowRemove,
}: {
  button: ButtonComponent;
  onChange: (button: ButtonComponent) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  allowRemove: boolean;
}) {
  return (
    <CollapsibleEditorCard
      label="Button"
      collapsible={false}
      actions={
        allowRemove ? (
          <ReorderActions
            itemLabel="button"
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
          />
        ) : null
      }
    >

      <div className="pt-1">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
            <BuilderField label="Label">
              <input
                value={button.label}
                onChange={(event) => onChange({ ...button, label: event.target.value })}
                className={builderInputClassName}
                placeholder="Click me"
              />
            </BuilderField>

            <div className="md:col-span-2">
              <BuilderField label="Style">
                <BuilderOptionTabs
                  compact
                  value={button.style}
                  onChange={(style) =>
                    onChange({
                      ...button,
                      style,
                      customId: style === 'link' ? '' : button.customId || 'script_button',
                    })
                  }
                  options={buttonStyleOptions}
                />
              </BuilderField>
            </div>
          </div>

          {button.style === 'link' ? (
            <BuilderField label="URL" description="Required for link buttons.">
              <input
                value={button.url}
                onChange={(event) => onChange({ ...button, url: event.target.value })}
                className={builderInputClassName}
                placeholder="https://example.com"
              />
            </BuilderField>
          ) : (
            <BuilderField
              label="Custom ID"
              description="Use a `script_` prefix if you want to detect clicks in scripts."
            >
              <input
                value={button.customId}
                onChange={(event) => onChange({ ...button, customId: event.target.value })}
                className={builderInputClassName}
                placeholder="script_button"
              />
            </BuilderField>
          )}

          <BuilderField label="Emoji" description="Optional emoji shown before the label.">
            <input
              value={button.emoji}
              onChange={(event) => onChange({ ...button, emoji: event.target.value })}
              className={builderInputClassName}
              placeholder="👋"
            />
          </BuilderField>

          <div className="md:col-span-2">
            <BuilderToggleField
              label="Disabled"
              description="Disable the button to make it visible but not clickable."
              checked={button.disabled}
              onCheckedChange={(checked) => onChange({ ...button, disabled: checked })}
            />
          </div>
        </div>
      </div>
    </CollapsibleEditorCard>
  );
}
