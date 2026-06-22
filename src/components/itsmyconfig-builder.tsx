'use client';

import { Clipboard, RotateCcw } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { ItsMyConfigPreview } from '@/components/builders/itsmyconfig/preview';
import { BuilderShell } from '@/components/builders/shell';
import {
  BuilderField,
  BuilderOptionTabs,
  BuilderToggleField,
  builderInputClassName,
  builderSelectClassName,
} from '@/components/builders/ui';
import { cn } from '@/lib/cn';
import {
  createItsMyConfigStateFromPreset,
  createInitialItsMyConfigState,
  deserializeItsMyConfigConfig,
  ITSMYCONFIG_BUILDER_DEFINITION,
  ITSMYCONFIG_BUILDER_PRESETS,
  ITSMYCONFIG_VIEW_OPTIONS,
  isItsMyConfigPlaceholderVisible,
  type ItsMyConfigBuilderState,
  type ItsMyConfigPlaceholder,
  type ItsMyConfigPreviewView,
} from '@/lib/builders/itsmyconfig';

function resolveNextState<T>(updater: T | ((current: T) => T), current: T) {
  return typeof updater === 'function' ? (updater as (current: T) => T)(current) : updater;
}

export function ItsMyConfigBuilder({
  config: controlledConfig,
  onChange,
}: {
  config?: ItsMyConfigBuilderState;
  onChange?: (config: ItsMyConfigBuilderState) => void;
}) {
  const [internalConfig, setInternalConfig] = useState<ItsMyConfigBuilderState>(
    createInitialItsMyConfigState,
  );
  const [activeView, setActiveView] = useState<ItsMyConfigPreviewView>('chat');
  const [selectedPresetId, setSelectedPresetId] = useState(ITSMYCONFIG_BUILDER_PRESETS[0]?.id ?? 'default');
  const [importState, setImportState] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null,
  );
  const isControlled = controlledConfig !== undefined && onChange !== undefined;
  const config = isControlled ? controlledConfig : internalConfig;
  const visiblePlaceholderEntries = config.placeholders.flatMap((placeholder, index) =>
    isItsMyConfigPlaceholderVisible(placeholder) ? [{ placeholder, index }] : [],
  );

  function setConfig(
    updater: ItsMyConfigBuilderState | ((current: ItsMyConfigBuilderState) => ItsMyConfigBuilderState),
  ) {
    const next = resolveNextState(updater, config);

    if (isControlled) {
      onChange(next);
      return;
    }

    setInternalConfig(next);
  }

  function replacePlaceholder(index: number, nextPlaceholder: ItsMyConfigPlaceholder) {
    setConfig((current) => ({
      ...current,
      placeholders: current.placeholders.map((placeholder, placeholderIndex) =>
        placeholderIndex === index ? nextPlaceholder : placeholder,
      ),
    }));
  }

  async function importFromClipboard() {
    try {
      const yaml = await navigator.clipboard.readText();

      if (!yaml.trim()) {
        throw new Error('Clipboard is empty.');
      }

      const { load } = await import('js-yaml');
      const parsed = load(yaml);
      const importedState = deserializeItsMyConfigConfig(parsed);
      setConfig((current) => ({
        ...current,
        ...importedState,
        templates: current.templates,
      }));
      setImportState({ tone: 'success', message: 'Placeholder YAML imported from clipboard.' });
    } catch {
      setImportState({
        tone: 'error',
        message: 'Unable to import this YAML. Paste a valid ItsMyConfig placeholder file.',
      });
    }

    window.setTimeout(() => setImportState(null), 2600);
  }

  function resetDefaults() {
    const nextState = createInitialItsMyConfigState();
    setConfig((current) => ({
      ...nextState,
      templates: current.templates,
    }));
    setImportState({ tone: 'success', message: 'Default placeholders restored.' });
    window.setTimeout(() => setImportState(null), 2200);
  }

  function applyPreset() {
    const preset = ITSMYCONFIG_BUILDER_PRESETS.find((entry) => entry.id === selectedPresetId);
    const nextState = createItsMyConfigStateFromPreset(selectedPresetId);

    setConfig(nextState);
    setImportState({
      tone: 'success',
      message: preset ? `Preset "${preset.label}" applied.` : 'Preset applied.',
    });
    window.setTimeout(() => setImportState(null), 2200);
  }

  const output = ITSMYCONFIG_BUILDER_DEFINITION.serialize(config);

  return (
    <BuilderShell
      options={{
        title: 'Builder Options',
        description: 'Import or reset default placeholders before copying the generated YAML.',
        action: (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={importFromClipboard}
              className={cn(buttonVariants({ color: 'secondary', size: 'sm' }), 'gap-2')}
            >
              <Clipboard className="size-3.5" />
              Import clipboard
            </button>
            <button
              type="button"
              onClick={resetDefaults}
              className={cn(buttonVariants({ color: 'secondary', size: 'sm' }), 'gap-2')}
            >
              <RotateCcw className="size-3.5" />
              Reset defaults
            </button>
          </div>
        ),
        children: (
          <div className="flex flex-col gap-4">
            <BuilderField
              label="Preset"
              description="Apply ready config data. Add more presets in `src/lib/builders/itsmyconfig.ts`."
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={selectedPresetId}
                  onChange={(event) => setSelectedPresetId(event.target.value)}
                  className={builderSelectClassName}
                >
                  {ITSMYCONFIG_BUILDER_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={applyPreset}
                  className={cn(buttonVariants({ color: 'secondary', size: 'sm' }), 'shrink-0')}
                >
                  Apply preset
                </button>
              </div>
            </BuilderField>

            {importState ? (
              <p
                className={cn(
                  'text-sm',
                  importState.tone === 'error' ? 'text-red-600' : 'text-emerald-600',
                )}
              >
                {importState.message}
              </p>
            ) : null}
          </div>
        ),
      }}
      editor={{
        title: 'Placeholders & Examples',
        description: 'The example snippets are already there. Change values and adjust the fixed templates.',
        children: (
          <div className="grid gap-2">
            {visiblePlaceholderEntries.map(({ placeholder, index }) => (
              <PlaceholderCard
                key={placeholder.id}
                placeholder={placeholder}
                onChange={(nextPlaceholder) => replacePlaceholder(index, nextPlaceholder)}
              />
            ))}
          </div>
        ),
      }}
      preview={{
        title: 'Minecraft Preview',
        children: (
          <div className="grid gap-3">
            <BuilderOptionTabs
              value={activeView}
              onChange={setActiveView}
              options={ITSMYCONFIG_VIEW_OPTIONS}
              compact
            />

            <ItsMyConfigPreview state={config} view={activeView} />
          </div>
        ),
      }}
      output={output}
      outputConfig={ITSMYCONFIG_BUILDER_DEFINITION.output}
    />
  );
}

function PlaceholderCard({
  placeholder,
  onChange,
}: {
  placeholder: ItsMyConfigPlaceholder;
  onChange: (placeholder: ItsMyConfigPlaceholder) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaValue =
    placeholder.type === 'string' || placeholder.type === 'colored_text' ? placeholder.value : '';

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [textareaValue]);

  return (
    <div className="rounded-xl border border-fd-border/70 bg-fd-background p-3 pb-1">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h4 className="text-sm font-semibold">{placeholder.id}</h4>
          {placeholder.description ? (
            <p className="text-xs text-fd-muted-foreground">{placeholder.description}</p>
          ) : null}
        </div>
      </div>

      <div className="pt-3">
        {placeholder.type === 'string' || placeholder.type === 'colored_text' ? (
          <textarea
            ref={textareaRef}
            value={placeholder.value}
            onChange={(event) => onChange({ ...placeholder, value: event.target.value })}
            rows={1}
            className={cn(builderInputClassName, 'resize-none overflow-hidden py-2 leading-5')}
            spellCheck={false}
            aria-label={`${placeholder.id} value`}
          />
        ) : null}

        {placeholder.type === 'color' ? (
          <div className="grid gap-3">
            <input
              value={placeholder.value}
              onChange={(event) => onChange({ ...placeholder, value: event.target.value })}
              className={builderInputClassName}
              spellCheck={false}
              placeholder="yellow"
              aria-label={`${placeholder.id} color`}
            />

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 mb-1">
              <BuilderToggleField
                label="Bold"
                description="Adds `<bold>` to the opening color tag."
                checked={placeholder.bold}
                onCheckedChange={(bold) => onChange({ ...placeholder, bold })}
              />
              <BuilderToggleField
                label="Italic"
                description="Adds `<italic>` to the opening color tag."
                checked={placeholder.italic}
                onCheckedChange={(italic) => onChange({ ...placeholder, italic })}
              />
              <BuilderToggleField
                label="Underlined"
                description="Adds `<underlined>` to the opening color tag."
                checked={placeholder.underlined}
                onCheckedChange={(underlined) => onChange({ ...placeholder, underlined })}
              />
              <BuilderToggleField
                label="Strikethrough"
                description="Adds `<strikethrough>` to the opening color tag."
                checked={placeholder.strikethrough}
                onCheckedChange={(strikethrough) => onChange({ ...placeholder, strikethrough })}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
