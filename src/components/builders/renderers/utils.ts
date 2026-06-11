import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { get as getEmojiByShortcode } from 'node-emoji';
import twemoji from 'twemoji';
import type { GeneratedButtonStyle } from '@/lib/builders/generated';

export const ggSansFontFace = `
@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-normal-400.woff2);
  font-family: "gg sans";
  font-weight: 400;
  font-style: normal;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-normal-500.woff2);
  font-family: "gg sans";
  font-weight: 500;
  font-style: normal;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-normal-600.woff2);
  font-family: "gg sans";
  font-weight: 600;
  font-style: normal;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-normal-700.woff2);
  font-family: "gg sans";
  font-weight: 700;
  font-style: normal;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-normal-800.woff2);
  font-family: "gg sans";
  font-weight: 800;
  font-style: normal;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-italic-400.woff2);
  font-family: "gg sans";
  font-weight: 400;
  font-style: italic;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-italic-500.woff2);
  font-family: "gg sans";
  font-weight: 500;
  font-style: italic;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-italic-600.woff2);
  font-family: "gg sans";
  font-weight: 600;
  font-style: italic;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-italic-700.woff2);
  font-family: "gg sans";
  font-weight: 700;
  font-style: italic;
}

@font-face {
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/ggsans-italic-800.woff2);
  font-family: "gg sans";
  font-weight: 800;
  font-style: italic;
}
`;

export const discordFontFamily =
  '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';

export function isHexColor(value: string) {
  return /^#([0-9a-fA-F]{6})$/.test(value.trim());
}

export function getButtonClassName(style: GeneratedButtonStyle, disabled?: boolean) {
  return cn(
    'inline-flex h-8 max-w-full items-center justify-center gap-2 rounded-md px-3.75 text-sm font-medium text-white transition border',
    style === 'primary' && 'bg-[#5865f2]',
    style === 'secondary' && 'bg-[#414149] border-[#44444D] hover:bg-[#484952] hover:border-[#4B4C55]',
    style === 'success' && 'bg-[#008545] border-[#FFFFFF]/0.8',
    style === 'danger' && 'bg-[#da373c]',
    style === 'link' && 'bg-[#414149] border-[#44444D] hover:bg-[#484952] hover:border-[#4B4C55]',
    disabled && 'cursor-default opacity-55',
  );
}

export function getFileLabel(url: string) {
  if (!url.trim()) {
    return 'Untitled file';
  }

  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').filter(Boolean).at(-1);
    return filename || url;
  } catch {
    return url;
  }
}

export function getGalleryLayoutStyle(count: number): CSSProperties {
  switch (count) {
    case 1:
      return { display: 'grid', gap: '8px', gridTemplateColumns: '1fr' };
    case 2:
      return { display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr' };
    case 3:
    case 4:
      return {
        display: 'grid',
        gap: '8px',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
      };
    default:
      return {
        display: 'grid',
        gap: '8px',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      };
  }
}

export function getGalleryItemStyle(index: number, count: number): CSSProperties {
  const baseStyle: CSSProperties = {
    aspectRatio: '16 / 9',
    minHeight: count === 1 ? '220px' : '110px',
  };

  if (count === 3 && index === 0) {
    return {
      ...baseStyle,
      gridRow: '1 / span 2',
      aspectRatio: '4 / 5',
      minHeight: '228px',
    };
  }

  return baseStyle;
}

type EmojiLike =
  | string
  | {
      name: string;
      id: string;
      animated?: boolean;
    };

const SHORTCODE_ALIAS_FIXUPS: Record<string, string> = {
  construction_site: 'building_construction',
};

function resolveEmojiShortcode(value: string) {
  const match = /^:([a-z0-9_+-]{1,32}):$/i.exec(value.trim());
  if (!match) {
    return null;
  }

  const alias = match[1].toLowerCase();
  const normalizedAlias = alias.replace(/-/g, '_');
  const candidates = [
    alias,
    normalizedAlias,
    SHORTCODE_ALIAS_FIXUPS[alias],
    SHORTCODE_ALIAS_FIXUPS[normalizedAlias],
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const resolved = getEmojiByShortcode(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export function resolveEmojiAsset(value: EmojiLike) {
  if (typeof value !== 'string') {
    if (!value.id) {
      return null;
    }

    return `https://cdn.discordapp.com/emojis/${value.id}.${value.animated ? 'gif' : 'png'}`;
  }

  const customEmojiMatch = value.match(/^<a?:(\w+):(\d+)>$/);
  if (customEmojiMatch) {
    return `https://cdn.discordapp.com/emojis/${customEmojiMatch[2]}${value.startsWith('<a:') ? '.gif' : '.png'}`;
  }

  const shortcodeEmoji = resolveEmojiShortcode(value);
  if (shortcodeEmoji) {
    value = shortcodeEmoji;
  }

  if (!/\p{Extended_Pictographic}/u.test(value)) {
    return null;
  }

  try {
    const codepoints = twemoji.convert
      .toCodePoint(
        value.indexOf(String.fromCharCode(0x200d)) < 0 ? value.replace(/\uFE0F/g, '') : value,
      )
      .toLowerCase();

    return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg`;
  } catch {
    return null;
  }
}
