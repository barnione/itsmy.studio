'use client';

import { DiscordMessageRenderer } from '@/components/builders/renderers';
import { buildGeneratedMessageConfig } from '@/lib/builders/generated';
import type { MessageBuilderState } from '@/lib/builders/message';

export function MessagePreview({ config }: { config: MessageBuilderState }) {
  return <DiscordMessageRenderer config={buildGeneratedMessageConfig(config)} />;
}
