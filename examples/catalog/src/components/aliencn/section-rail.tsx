'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface SectionRailEntry {
  /** The id of the section element this entry tracks and links to. */
  id: string;
  label: string;
  /** Compact index shown on the rail, e.g. "01"; defaults to the position. */
  number?: string;
}

export interface SectionRailProps extends React.HTMLAttributes<HTMLElement> {
  sections: readonly SectionRailEntry[];
  label?: string;
}

/**
 * A fixed left rail of section ticks that tracks the section nearest the
 * viewport center. Renders in difference blend so it stays legible over both
 * dark and light surfaces; hidden on narrow viewports by the stylesheet.
 * Pair with `scroll-director` for smooth anchor glides.
 */
export function SectionRail({
  sections,
  label = 'Section progress',
  className,
  ...props
}: SectionRailProps): React.JSX.Element {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observed = sections.flatMap((section) => {
      const element = document.getElementById(section.id);
      return element ? [element] : [];
    });
    if (observed.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-38% 0px -52% 0px' }
    );
    for (const element of observed) observer.observe(element);
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav {...props} className={cn('aliencn-rail', className)} aria-label={label}>
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id ? 'true' : undefined}
          aria-label={section.label}
        >
          <span aria-hidden="true" />
          <span>{section.number ?? String(index).padStart(2, '0')}</span>
        </a>
      ))}
    </nav>
  );
}
