import * as React from 'react';

import { cn } from '{{utils}}/cn';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  flat?: boolean;
}

export function Card({ flat = false, className, children, ...props }: CardProps): React.JSX.Element {
  return (
    <section className={cn('aliencn-card', flat && 'aliencn-card--flat', className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div {...props} className={cn('aliencn-card__header', props.className)} />;
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return <h3 {...props} className={cn('aliencn-card__title', props.className)} />;
}

export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return <p {...props} className={cn('aliencn-card__description', props.className)} />;
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div {...props} className={cn('aliencn-card__content', props.className)} />;
}

export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div {...props} className={cn('aliencn-card__footer', props.className)} />;
}
