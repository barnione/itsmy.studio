const config = {
  compilers: {
    mdx: true,
  },
  entry: [
    'src/app/**/*.{ts,tsx}',
    'src/mdx-components.tsx',
    'source.config.ts',
    'content/**/*.mdx',
    'next.config.mjs',
    'postcss.config.mjs',
  ],
  project: [
    'src/**/*.{ts,tsx}',
    'source.config.ts',
    'content/**/*.mdx',
    '*.config.{js,cjs,mjs,ts}',
    'next-env.d.ts',
  ],
  ignoreFiles: [
    'src/lib/urls.ts',
    'src/lib/merge-refs.ts',
  ],
};

export default config;