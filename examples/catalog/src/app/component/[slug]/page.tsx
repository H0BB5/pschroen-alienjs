import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ComponentDetail } from '@/components/component-detail';
import { getRegistryEntry, REGISTRY } from '@/lib/registry-manifest';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return REGISTRY.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getRegistryEntry(slug);
  if (!entry) return { title: 'Aliencn // Unknown unit' };
  return {
    title: `Aliencn // ${entry.name}`,
    description: entry.description
  };
}

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params;
  if (!getRegistryEntry(slug)) notFound();
  return <ComponentDetail slug={slug} />;
}
