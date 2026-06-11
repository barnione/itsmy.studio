'use client';

import { ChevronDown, ChevronRight, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import {
  BuilderDescriptionTip,
  BuilderIconActionButton,
} from '@/components/builders/ui';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'fumadocs-ui/components/ui/collapsible';
import { cn } from '@/lib/cn';

export function NestedEditorCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-fd-border/70 bg-fd-primary-foreground p-3', className)}>
      {children}
    </div>
  );
}

export function ReorderActions({
  itemLabel,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  itemLabel: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {onMoveUp ? (
        <BuilderIconActionButton
          ariaLabel={`Move ${itemLabel} up`}
          disabled={!canMoveUp}
          onClick={onMoveUp}
        >
          <ChevronUp className="size-4" />
        </BuilderIconActionButton>
      ) : null}
      {onMoveDown ? (
        <BuilderIconActionButton
          ariaLabel={`Move ${itemLabel} down`}
          disabled={!canMoveDown}
          onClick={onMoveDown}
        >
          <ChevronDown className="size-4" />
        </BuilderIconActionButton>
      ) : null}
      {onRemove ? (
        <BuilderIconActionButton ariaLabel={`Remove ${itemLabel}`} onClick={onRemove}>
          <Trash2 className="size-4" />
        </BuilderIconActionButton>
      ) : null}
    </div>
  );
}

export function AddItemButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(buttonVariants({ color: 'secondary', size: 'sm' }), 'gap-2 self-start')}
    >
      <Plus className="size-3.5" />
      {label}
    </button>
  );
}

export function CollapsibleEditorCard({
  label,
  description,
  summary,
  actions,
  children,
  className,
  defaultOpen = false,
  collapsible = true,
}: {
  label: string;
  description?: string;
  summary?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open : true;

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen}>
      <div className={cn('rounded-lg border border-fd-border/70 bg-fd-primary-foreground p-3', className)}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex flex-1 items-start gap-2">
            {collapsible ? (
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground transition hover:bg-fd-accent/50 hover:text-fd-foreground"
                >
                  <ChevronRight
                    className={cn('size-4 transition-transform duration-200 ease-out', isOpen && 'rotate-90')}
                  />
                </button>
              </CollapsibleTrigger>
            ) : null}

            <div className="min-w-0 flex-1">
              <div className="min-w-0 flex items-center gap-1.5 text-left">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-fd-muted-foreground">
                  {label}
                </p>
                {description ? <BuilderDescriptionTip description={description} /> : null}
              </div>

              {!isOpen && summary ? (
                <div className="mt-1 truncate text-sm text-fd-muted-foreground">{summary}</div>
              ) : null}
            </div>
          </div>

          {actions}
        </div>

        {collapsible ? (
          <CollapsibleContent className="pt-1">
            {children}
          </CollapsibleContent>
        ) : (
          <div className="pt-1">{children}</div>
        )}
      </div>
    </Collapsible>
  );
}
