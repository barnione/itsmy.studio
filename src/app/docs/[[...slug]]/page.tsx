import { getPageImage, source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound, redirect } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { LLMCopyButton, ViewOptions } from '@/components/ai/page-actions';
import { DiscordIcon, gitConfig } from '@/lib/layout.shared';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';
import Link from 'next/link';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  if (!params.slug?.length) redirect('/docs/itsmybot');

  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const rightSidebar = page.data.rightSidebar !== false;
  const full = page.data.full || !rightSidebar;

  return (
    <DocsPage
      toc={page.data.toc}
      full={full}
      tableOfContent={rightSidebar ? { style: 'clerk' } : { enabled: false, style: 'clerk' }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <Link
          className={cn(
            buttonVariants({
              color: 'secondary',
              size: 'sm',
              className: 'gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground',
            }),
          )}
          href="https://itsmy.studio/discord"
          target="_blank"
        >
          <DiscordIcon />
          Support
        </Link>
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  if (!params.slug?.length) {
    return {
      title: 'Docs',
      description: 'Product documentation for ItsMy Studio.',
    };
  }

  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
