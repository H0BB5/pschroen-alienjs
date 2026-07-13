import * as React from 'react';

import { cn } from '{{utils}}/cn';

/**
 * A styled semantic table: registration-mark headers, hairline rows, and an
 * owned horizontal scroll container. Deliberately not a data-table; pair
 * with your own sorting/pagination (for example TanStack Table) and keep the
 * markup semantic.
 */
export function Table({
  className,
  children,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>): React.JSX.Element {
  return (
    <div className="aliencn-table-frame">
      <table {...props} className={cn('aliencn-table', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader(props: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return <thead {...props} />;
}

export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return <tbody {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>): React.JSX.Element {
  return <tr {...props} className={cn('aliencn-table__row', className)} />;
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return <th {...props} className={cn('aliencn-table__head', className)} />;
}

export function TableCell({
  className,
  numeric = false,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }): React.JSX.Element {
  return (
    <td
      {...props}
      className={cn('aliencn-table__cell', numeric && 'aliencn-table__cell--numeric', className)}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>): React.JSX.Element {
  return <caption {...props} className={cn('aliencn-table__caption', className)} />;
}
