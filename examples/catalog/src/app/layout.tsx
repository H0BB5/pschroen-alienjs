import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './aliencn.css';
import './catalog.css';

export const metadata: Metadata = {
  title: 'Aliencn // System Catalog',
  description: 'Standalone reference application for the Aliencn component registry.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-aliencn-space data-aliencn-theme="dark">
      <body>{children}</body>
    </html>
  );
}
