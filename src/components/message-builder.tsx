'use client';

import { useState } from 'react';
import { ComponentListEditor } from '@/components/builders/message/component-list-editor';
import { MessagePreview } from '@/components/builders/message/preview';
import { OutputIndentControl } from '@/components/builders/output-indent-control';
import { BuilderShell } from '@/components/builders/shell';
import { BuilderToggleField } from '@/components/builders/ui';
import {
  DEFAULT_YAML_OUTPUT_INDENT,
  indentYamlOutput,
  normalizeYamlOutputIndent,
} from '@/lib/builders/core';
import {
  MESSAGE_BUILDER_DEFINITION,
  TOP_LEVEL_COMPONENTS,
  type MessageBuilderState,
} from '@/lib/builders/message';

function resolveNextState<T>(updater: T | ((current: T) => T), current: T) {
  return typeof updater === 'function' ? (updater as (current: T) => T)(current) : updater;
}

export function MessageBuilder({
  config: controlledConfig,
  onChange,
  yamlOutputIndent: controlledYamlOutputIndent,
  onYamlOutputIndentChange,
}: {
  config?: MessageBuilderState;
  onChange?: (config: MessageBuilderState) => void;
  yamlOutputIndent?: number;
  onYamlOutputIndentChange?: (indent: number) => void;
}) {
  const [internalConfig, setInternalConfig] = useState<MessageBuilderState>(
    MESSAGE_BUILDER_DEFINITION.createInitialState,
  );
  const [internalYamlOutputIndent, setInternalYamlOutputIndent] = useState(DEFAULT_YAML_OUTPUT_INDENT);
  const isControlled = controlledConfig !== undefined && onChange !== undefined;
  const config = isControlled ? controlledConfig : internalConfig;
  const yamlOutputIndent = controlledYamlOutputIndent ?? internalYamlOutputIndent;

  function setConfig(updater: MessageBuilderState | ((current: MessageBuilderState) => MessageBuilderState)) {
    const next = resolveNextState(updater, config);

    if (isControlled) {
      onChange(next);
      return;
    }

    setInternalConfig(next);
  }

  function setYamlOutputIndent(value: number | string) {
    const next = normalizeYamlOutputIndent(value);
    setInternalYamlOutputIndent(next);
    onYamlOutputIndentChange?.(next);
  }

  const output = indentYamlOutput(MESSAGE_BUILDER_DEFINITION.serialize(config), yamlOutputIndent);

  return (
    <BuilderShell
      options={{
        title: 'Message Options',
        children: (
          <div className="grid gap-4 md:grid-cols-2">
            <BuilderToggleField
              label="Ephemeral"
              description="Only works when the message is sent from an interaction."
              checked={config.ephemeral}
              onCheckedChange={(checked) =>
                setConfig((current) => ({ ...current, ephemeral: checked }))
              }
            />
            <BuilderToggleField
              label="Disable Mentions"
              description="Prevent mentions in the message from pinging users or roles."
              checked={config.disableMentions}
              onCheckedChange={(checked) =>
                setConfig((current) => ({ ...current, disableMentions: checked }))
              }
            />
          </div>
        ),
      }}
      editor={{
        title: 'Components',
        children: (
          <ComponentListEditor
            components={config.components}
            onChange={(components) => setConfig((current) => ({ ...current, components }))}
            allowedTypes={TOP_LEVEL_COMPONENTS}
            emptyLabel="Start by adding your first component."
          />
        ),
      }}
      preview={{
        title: 'Preview',
        description: 'A simplified preview to check the structure before copying the config.',
        children: <MessagePreview config={config} />,
      }}
      output={output}
      outputConfig={MESSAGE_BUILDER_DEFINITION.output}
      outputAction={
        <OutputIndentControl value={yamlOutputIndent} onChange={setYamlOutputIndent} />
      }
    />
  );
}
