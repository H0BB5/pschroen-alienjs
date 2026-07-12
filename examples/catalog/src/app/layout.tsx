import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { ViewTransitions } from 'next-view-transitions';
import type { ReactNode } from 'react';

import { ScrollDirector } from '@/components/scroll-director';

import './aliencn.css';
import './catalog.css';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap'
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Aliencn // System Catalog',
  description: 'Standalone reference application for the Aliencn component registry.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        data-aliencn-space
        data-aliencn-theme="dark"
        className={`${grotesk.variable} ${mono.variable}`}
        suppressHydrationWarning
      >
        <body>
          <ScrollDirector />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
