'use client';

import { Clipboard } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageBuilder } from '@/components/message-builder';
import { ModalBuilder } from '@/components/modal-builder';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import {
  MESSAGE_BUILDER_DEFINITION,
  deserializeMessageConfig,
  type MessageBuilderState,
} from '@/lib/builders/message';
import {
  MODAL_BUILDER_DEFINITION,
  deserializeModalConfig,
  type ModalBuilderState,
} from '@/lib/builders/modal';
import {
  DEFAULT_YAML_OUTPUT_INDENT,
  dedentYamlInput,
  detectYamlOutputIndent,
} from '@/lib/builders/core';
import { cn } from '@/lib/cn';

type BuilderTab = 'message' | 'modal' | 'script';

const builderTabs: {
  id: BuilderTab;
  label: string;
  description: string;
}[] = [
  {
    id: 'message',
    label: 'Message Builder',
    description: 'Build Discord messages with components, preview them, and copy the YAML.',
  },
  {
    id: 'modal',
    label: 'Modal Builder',
    description: 'Build interactive modals with text, labels, inputs, uploads, checkboxes, and choice groups.',
  },
];

function resolveBuilderTab(value: string | null): BuilderTab {
  return value === 'modal' ? value : 'message';
}

export function BuilderHub() {
  return (
    <Suspense fallback={null}>
      <BuilderHubContent />
    </Suspense>
  );
}

function BuilderHubContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = resolveBuilderTab(tabParam);
  const active = builderTabs.find((tab) => tab.id === activeTab) ?? builderTabs[0];
  const [importState, setImportState] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [messageConfig, setMessageConfig] = useState<MessageBuilderState>(
    MESSAGE_BUILDER_DEFINITION.createInitialState,
  );
  const [modalConfig, setModalConfig] = useState<ModalBuilderState>(
    MODAL_BUILDER_DEFINITION.createInitialState,
  );
  const [messageYamlOutputIndent, setMessageYamlOutputIndent] = useState(DEFAULT_YAML_OUTPUT_INDENT);
  const [modalYamlOutputIndent, setModalYamlOutputIndent] = useState(DEFAULT_YAML_OUTPUT_INDENT);

  useEffect(() => {
    if (tabParam === activeTab) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', activeTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [activeTab, pathname, router, searchParams, tabParam]);

  function updateActiveTab(nextTab: BuilderTab) {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get('tab') === nextTab) return;

    params.set('tab', nextTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function importFromClipboard() {
    try {
      const yaml = await navigator.clipboard.readText();

      if (!yaml.trim()) {
        throw new Error('Clipboard is empty.');
      }

      const yamlOutputIndent = detectYamlOutputIndent(yaml);
      const { load } = await import('js-yaml');
      const parsed = load(dedentYamlInput(yaml, yamlOutputIndent));

      if (activeTab === 'message') {
        setMessageConfig(deserializeMessageConfig(parsed));
        setMessageYamlOutputIndent(yamlOutputIndent);
      } else if (activeTab === 'modal') {
        setModalConfig(deserializeModalConfig(parsed));
        setModalYamlOutputIndent(yamlOutputIndent);
      }

      setImportState({ tone: 'success', message: 'YAML imported from clipboard.' });
    } catch (error) {
      setImportState({
        tone: 'error',
        message: 'Unable to import this YAML. Verify that it is correctly formatted and follows the expected schema.',
      });
    }

    window.setTimeout(() => setImportState(null), 2600);
  }

  return (
    <div className="not-prose flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div
              role="tablist"
              aria-label="Builder type"
              className="flex flex-wrap items-end gap-5 border-b border-fd-border/70"
            >
              {builderTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => updateActiveTab(tab.id)}
                  className={cn(
                    '-mb-px inline-flex min-w-0 flex-col items-start border-b-2 pb-3 text-left transition',
                    activeTab === tab.id
                      ? 'border-fd-primary text-fd-foreground'
                      : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground',
                  )}
                >
                  <span className="text-sm font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-fd-muted-foreground">
              {active.description}
            </p>

            {importState ? (
              <p
                className={cn(
                  'mt-3 text-sm',
                  importState.tone === 'error' ? 'text-red-600' : 'text-emerald-600',
                )}
              >
                {importState.message}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={importFromClipboard}
            className={cn(buttonVariants({ color: 'secondary', size: 'sm' }), 'gap-2 self-start')}
          >
            <Clipboard className="size-3.5" />
            Import clipboard
          </button>
        </div>
      </div>

      {activeTab === 'message' ? (
        <MessageBuilder
          config={messageConfig}
          onChange={setMessageConfig}
          yamlOutputIndent={messageYamlOutputIndent}
          onYamlOutputIndentChange={setMessageYamlOutputIndent}
        />
      ) : (
        <ModalBuilder
          config={modalConfig}
          onChange={setModalConfig}
          yamlOutputIndent={modalYamlOutputIndent}
          onYamlOutputIndentChange={setModalYamlOutputIndent}
        />
      )}
    </div>
  );
}
