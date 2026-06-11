import {
  Check,
  ChevronDown,
  Circle,
  ExternalLink,
  FileText,
  ImageIcon,
  Lock,
  MessageSquareText,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type {
  GeneratedButtonComponent,
  GeneratedButtonStyle,
  GeneratedCheckboxComponent,
  GeneratedCheckboxGroupComponent,
  GeneratedChoiceOption,
  GeneratedFileComponent,
  GeneratedFileUploadComponent,
  GeneratedMediaGalleryComponent,
  GeneratedMessageComponent,
  GeneratedMessageConfig,
  GeneratedModalComponent,
  GeneratedModalConfig,
  GeneratedModalInputComponent,
  GeneratedRadioGroupComponent,
  GeneratedSectionAccessory,
  GeneratedSelectMenuComponent,
  GeneratedTextInputComponent,
} from '@/lib/builders/generated';
import { DiscordTextContent } from './content';
import {
  discordFontFamily,
  getButtonClassName,
  getFileLabel,
  getGalleryItemStyle,
  getGalleryLayoutStyle,
  ggSansFontFace,
  isHexColor,
  resolveEmojiAsset,
} from './utils';

export function DiscordMessageRenderer({ config }: { config: GeneratedMessageConfig }) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-[#1f2023] bg-[#313338] text-[#dbdee1]"
      style={{ fontFamily: discordFontFamily }}
    >
      <style>{ggSansFontFace}</style>
      {config.ephemeral ? (
        <div className="border-b border-[#26282c] bg-[#2a2c30] px-4 py-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1e1f22] px-3 py-1 text-[11px] font-medium text-[#b5bac1]">
            <Lock className="size-3.5" />
            Only you can see this message
          </div>
        </div>
      ) : null}

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <img
            src="/avatar.webp"
            alt="ItsMyBot avatar"
            className="mt-0.5 size-10 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[15px] font-medium text-white">ItsMyBot</span>
              <span className="rounded bg-[#5865f2] px-1.5 py-px text-[10px] font-bold uppercase leading-[1.6] tracking-[0.08em] text-white">
                App
              </span>
              <span className="text-xs text-[#949ba4]">Just now</span>
            </div>

            <div className="mt-2 flex min-w-0 flex-col gap-2.5">
              {config.components.length > 0 ? (
                config.components.map((component, index) => (
                  <MessageComponentRenderer
                    key={`${component.type}-${index}`}
                    component={component}
                    depth={0}
                  />
                ))
              ) : (
                <EmptyPreviewState label="No components yet." />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiscordModalRenderer({ config }: { config: GeneratedModalConfig }) {
  return (
    <div
      className="rounded-3xl border border-[#1f2023] bg-[#1e1f22] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      style={{ fontFamily: discordFontFamily }}
    >
      <style>{ggSansFontFace}</style>
      <div className="mx-auto w-full max-w-155 rounded-2xl border border-[#111214] bg-[#313338] p-5 text-[#dbdee1] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">
              {config.title || 'Untitled Modal'}
            </p>
            {config['custom-id'] ? (
              <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-[#949ba4]">
                {config['custom-id']}
              </p>
            ) : null}
          </div>

          <span className="rounded-full border border-[#404249] bg-[#2b2d31] px-2.5 py-1 text-[11px] font-medium text-[#b5bac1]">
            Modal
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {config.components.length > 0 ? (
            config.components.map((component, index) => (
              <ModalComponentRenderer
                key={`${component.type}-${index}`}
                component={component}
              />
            ))
          ) : (
            <EmptyPreviewState label="No modal components yet." />
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-4 text-sm font-medium text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#5865f2] px-4 text-sm font-medium text-white"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageComponentRenderer({
  component,
  depth,
}: {
  component: GeneratedMessageComponent;
  depth: number;
}) {
  switch (component.type) {
    case 'text-display':
      return <DiscordTextContent content={component.content ?? ''} />;

    case 'separator': {
      const hasDivider = component.divider ?? true;
      const paddingClassName = component.spacing === 2 ? 'py-2' : 'py-0';

      return (
        <div className={paddingClassName}>
          {hasDivider ? <div className="h-px w-full bg-[#3f4147]" /> : null}
        </div>
      );
    }

    case 'action-row':
      return (
        <div className="flex flex-wrap gap-2">
          {component.components.length > 0 ? (
            component.components.map((child, index) =>
              child.type === 'button' ? (
                <PreviewButton key={`${child.type}-${index}`} component={child} />
              ) : (
                <PreviewSelectMenu
                  key={`${child.type}-${index}`}
                  component={child}
                  fullWidth={component.components.length === 1}
                />
              ),
            )
          ) : (
            <EmptyPreviewState compact label="Empty action row." />
          )}
        </div>
      );

    case 'section':
      return (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0 space-y-2">
            {component.components.length > 0 ? (
              component.components.map((textBlock, index) => (
                <DiscordTextContent
                  key={`${textBlock.type}-${index}`}
                  content={textBlock.content ?? ''}
                />
              ))
            ) : (
              <EmptyPreviewState compact label="Empty section content." />
            )}
          </div>

          {component.accessory ? <SectionAccessory accessory={component.accessory} /> : null}
        </div>
      );

    case 'container': {
      const accentColor = component.color && isHexColor(component.color) ? component.color : null;

      return (
        <div className="overflow-hidden rounded-xl border border-[#404249] bg-[#393A42]">
          <div className="flex">
            {accentColor ? (
              <div
                className="w-1 shrink-0"
                style={{ backgroundColor: accentColor }}
              />
            ) : null}

            <div className="min-w-0 flex-1 p-4">
              {component.spoiler ? (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1e1f22] px-3 py-1 text-[11px] font-medium text-[#b5bac1]">
                  <Lock className="size-3.5" />
                  Spoiler container
                </div>
              ) : null}

              <div className="flex min-w-0 flex-col gap-2.5">
                {component.components.length > 0 ? (
                  component.components.map((child, index) => (
                    <MessageComponentRenderer
                      key={`${child.type}-${index}`}
                      component={child}
                      depth={depth + 1}
                    />
                  ))
                ) : (
                  <EmptyPreviewState compact label="Empty container." />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'media-gallery':
      return <PreviewMediaGallery component={component} />;

    case 'file':
      return <PreviewFile component={component} />;

    case 'repeat':
      return (
        <div className="rounded-xl border border-dashed border-[#4a4d55] bg-[#2b2d31] p-4">
          <div className="mb-3 flex items-center gap-2 text-[#b5bac1]">
            <MessageSquareText className="size-4" />
            <span className="text-xs font-medium uppercase tracking-[0.18em]">
              Repeat
            </span>
            <span className="truncate text-xs normal-case tracking-normal text-[#949ba4]">
              {component['data-source'] || 'No data source'}
            </span>
          </div>

          {depth >= 2 ? (
            <EmptyPreviewState compact label="Nested repeat preview truncated." />
          ) : component.template.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {component.template.map((child, index) => (
                <MessageComponentRenderer
                  key={`${child.type}-${index}`}
                  component={child}
                  depth={depth + 1}
                />
              ))}
            </div>
          ) : (
            <EmptyPreviewState compact label="Empty repeat template." />
          )}
        </div>
      );
  }
}

function ModalComponentRenderer({ component }: { component: GeneratedModalComponent }) {
  if (component.type === 'text-display') {
    return <DiscordTextContent content={component.content ?? ''} />;
  }

  return (
    <div className="rounded-xl border border-[#404249] bg-[#2b2d31] p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-white">
          {component.label || 'Untitled Field'}
        </p>
        {component.description ? (
          <p className="mt-1 text-xs leading-5 text-[#b5bac1]">{component.description}</p>
        ) : null}
      </div>

      {component.component.type === 'text-input' ? (
        <PreviewTextInput component={component.component} />
      ) : null}

      {component.component.type === 'select-menu' ? (
        <PreviewSelectMenu component={component.component} fullWidth />
      ) : null}

      {component.component.type === 'file-upload' ? (
        <PreviewFileUpload component={component.component} />
      ) : null}

      {component.component.type === 'checkbox' ? (
        <PreviewCheckbox component={component.component} />
      ) : null}

      {component.component.type === 'checkbox-group' ? (
        <PreviewChoiceGroup component={component.component} kind="checkbox-group" />
      ) : null}

      {component.component.type === 'radio-group' ? (
        <PreviewChoiceGroup component={component.component} kind="radio-group" />
      ) : null}
    </div>
  );
}

function PreviewButton({ component }: { component: GeneratedButtonComponent }) {
  const emojiAsset = component.emoji ? resolveEmojiAsset(component.emoji) : null;
  const label = component.label || 'Button';

  return (
    <button
      type="button"
      disabled
      className={getButtonClassName(component.style, component.disabled)}
    >
      {emojiAsset ? (
        <img
          src={emojiAsset}
          alt=""
          className="size-4 shrink-0 object-contain"
        />
      ) : component.emoji ? (
        <span className="text-sm leading-none">{component.emoji}</span>
      ) : null}

      <span className="truncate">{label}</span>

      {component.style === 'link' && component.url ? (
        <ExternalLink className="size-3.5 shrink-0 opacity-80" />
      ) : null}
    </button>
  );
}

function PreviewSelectMenu({
  component,
  fullWidth = false,
}: {
  component: GeneratedSelectMenuComponent;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex h-10 items-center justify-between rounded-lg border border-[#1f2124] bg-[#1e1f22] px-3 text-sm text-[#dbdee1] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        fullWidth ? 'w-full' : 'min-w-60 max-w-full',
      )}
    >
      <span className="truncate text-[#b5bac1]">
        {component.placeholder || placeholderForSelect(component)}
      </span>
      <ChevronDown className="size-4 shrink-0 text-[#b5bac1]" />
    </div>
  );
}

function PreviewTextInput({ component }: { component: GeneratedTextInputComponent }) {
  const value = component.value || component.placeholder || 'Text input';

  return component.style === 'paragraph' ? (
    <div className="min-h-24 rounded-lg border border-[#1f2124] bg-[#1e1f22] px-3 py-2.5 text-sm leading-6 text-[#b5bac1]">
      {value}
    </div>
  ) : (
    <div className="flex h-10 items-center rounded-lg border border-[#1f2124] bg-[#1e1f22] px-3 text-sm text-[#b5bac1]">
      {value}
    </div>
  );
}

function PreviewFileUpload({
  component,
}: {
  component: GeneratedFileUploadComponent;
}) {
  const maxFiles = component['max-values'] ?? 1;
  const minFiles = component['min-values'] ?? 0;

  return (
    <div className="rounded-lg border border-dashed border-[#4a4d55] bg-[#1e1f22] px-4 py-5 text-center">
      <div className="flex flex-col items-center gap-2 text-[#b5bac1]">
        <Upload className="size-5" />
        <p className="text-sm font-medium text-white">Upload files</p>
        <p className="text-xs text-[#949ba4]">
          {minFiles > 0 ? `Min ${minFiles}` : 'Optional'} • Max {maxFiles}
        </p>
      </div>
    </div>
  );
}

function PreviewCheckbox({
  component,
}: {
  component: GeneratedCheckboxComponent;
}) {
  return (
    <div className="flex h-10 items-center gap-3 rounded-lg border border-[#1f2124] bg-[#1e1f22] px-3 text-sm text-[#dbdee1]">
      <ChoiceIndicator kind="checkbox" checked={component.default ?? false} />
      <span className="text-[#b5bac1]">
        {component.default ? 'Checked by default' : 'Unchecked'}
      </span>
    </div>
  );
}

function PreviewChoiceGroup({
  component,
  kind,
}: {
  component: GeneratedCheckboxGroupComponent | GeneratedRadioGroupComponent;
  kind: 'checkbox-group' | 'radio-group';
}) {
  if (component.options.length === 0) {
    return <EmptyPreviewState compact label="No options yet." />;
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#1f2124] bg-[#1e1f22] p-3">
      {component.options.map((option, index) => (
        <div
          key={`${option.value}-${index}`}
          className="flex items-start gap-3 text-sm text-[#dbdee1]"
        >
          <ChoiceIndicator kind={kind} checked={option.default ?? false} />
          <div className="min-w-0">
            <div className="truncate">{option.label || option.value || `Option ${index + 1}`}</div>
            {option.description ? (
              <div className="mt-0.5 text-xs leading-5 text-[#949ba4]">{option.description}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChoiceIndicator({
  kind,
  checked,
}: {
  kind: 'checkbox' | 'checkbox-group' | 'radio-group';
  checked: boolean;
}) {
  if (kind === 'radio-group') {
    return (
      <span
        className={cn(
          'relative inline-flex size-4 shrink-0 items-center justify-center rounded-full border',
          checked ? 'border-[#5865f2]' : 'border-[#6d727b]',
        )}
      >
        {checked ? <span className="size-2 rounded-full bg-[#5865f2]" /> : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded-sm border',
        checked ? 'border-[#5865f2] bg-[#5865f2] text-white' : 'border-[#6d727b]',
      )}
    >
      {checked ? <Check className="size-3" /> : null}
    </span>
  );
}

function SectionAccessory({ accessory }: { accessory: GeneratedSectionAccessory }) {
  if (accessory.type === 'button') {
    return <PreviewButton component={accessory} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#1f2124] bg-[#1e1f22]">
      {accessory.url ? (
        <img
          src={accessory.url}
          alt=""
          className="size-20 object-cover"
        />
      ) : (
        <div className="flex size-20 items-center justify-center text-[#6d727b]">
          <ImageIcon className="size-6" />
        </div>
      )}
    </div>
  );
}

function PreviewMediaGallery({
  component,
}: {
  component: GeneratedMediaGalleryComponent;
}) {
  if (component.items.length === 0) {
    return <EmptyPreviewState compact label="Empty gallery." />;
  }

  const items = component.items.slice(0, 10);

  return (
    <div style={getGalleryLayoutStyle(items.length)}>
      {items.map((item, index) => (
        <div
          key={`${item.url}-${index}`}
          className="group relative overflow-hidden rounded-lg bg-[#1e1f22]"
          style={getGalleryItemStyle(index, items.length)}
        >
          {item.url ? (
            <img
              src={item.url}
              alt={item.description || ''}
              className={cn(
                'size-full object-cover',
                item.spoiler ? 'blur-md brightness-75' : '',
              )}
            />
          ) : (
            <div className="flex h-full min-h-27.5 items-center justify-center text-[#6d727b]">
              <ImageIcon className="size-6" />
            </div>
          )}

          {item.spoiler ? (
            <div className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              Spoiler
            </div>
          ) : null}

          {item.description ? (
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent px-3 py-2 text-xs text-white">
              {item.description}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PreviewFile({ component }: { component: GeneratedFileComponent }) {
  const label = getFileLabel(component.url ?? '');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#404249] bg-[#2b2d31] px-3 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1e1f22] text-[#b5bac1]">
        <FileText className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 text-xs text-[#949ba4]">
          {component.spoiler ? 'Spoiler attachment' : 'Attachment'}
        </p>
      </div>
    </div>
  );
}

function EmptyPreviewState({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-[#4a4d55] text-sm text-[#949ba4]',
        compact ? 'px-3 py-3' : 'px-4 py-6',
      )}
    >
      {label}
    </div>
  );
}

function placeholderForSelect(component: GeneratedSelectMenuComponent) {
  if (component.options.length === 0) {
    return 'Select an option';
  }

  if (component.options.length === 1) {
    return component.options[0].label || 'Select an option';
  }

  return `Choose from ${component.options.length} options`;
}
