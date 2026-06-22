'use client';

import { useState, type ReactNode } from 'react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import type { BuilderOutputDefinition } from '@/lib/builders/core';
import { BuilderPanel } from './ui';

type BuilderShellSection = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function BuilderShell({
  options,
  editor,
  preview,
  output,
  outputConfig,
  outputAction,
}: {
  options?: BuilderShellSection;
  editor: BuilderShellSection;
  preview?: BuilderShellSection;
  output: string;
  outputConfig: BuilderOutputDefinition;
  outputAction?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="not-prose flex min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-4 bg-fd-primary-foreground p-3 rounded-lg border border-fd-border/70">
        {options ? (
          <BuilderPanel
            title={options.title}
            description={options.description}
            action={options.action}
          >
            {options.children}
          </BuilderPanel>
        ) : null}

        <BuilderPanel
          title={editor.title}
          description={editor.description}
          action={editor.action}
        >
          {editor.children}
        </BuilderPanel>
      </div>

      <div className="flex min-w-0 w-full flex-col gap-6 xl:sticky xl:top-20">
        {preview ? (
          <BuilderPanel
            title={preview.title}
            description={preview.description}
            action={preview.action}
          >
            <div className="min-w-0 overflow-x-auto">{preview.children}</div>
          </BuilderPanel>
        ) : null}

        <BuilderPanel
          title={outputConfig.title}
          description={outputConfig.description}
          action={outputAction}
        >
          <div className="min-w-0 overflow-x-auto">
            <DynamicCodeBlock lang={outputConfig.lang ?? 'yaml'} code={output} />
          </div>
        </BuilderPanel>
      </div>
    </section>
  );
}
