'use client';

import * as React from 'react';

import { Badge } from '@/components/aliencn/badge';
import { Banner } from '@/components/aliencn/banner';
import { Button } from '@/components/aliencn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/aliencn/card';
import { Dialog } from '@/components/aliencn/dialog';
import { EmptyState } from '@/components/aliencn/empty-state';
import { InputField } from '@/components/aliencn/input-field';
import { Magnetic } from '@/components/aliencn/magnetic';
import { AlienPanel, type AlienPanelItem } from '@/components/aliencn/panel';
import { ShaderCanvas } from '@/components/aliencn/shader-canvas';
import { Skeleton } from '@/components/aliencn/skeleton';
import { Switch } from '@/components/aliencn/switch';
import { Tabs, type TabItem } from '@/components/aliencn/tabs';

type Theme = 'dark' | 'light';

const PANEL_ITEMS = [
  { name: 'Spectral field' },
  {
    type: 'slider',
    name: 'Drift',
    min: 0,
    max: 1,
    step: 0.01,
    value: 0.42,
    callback: () => undefined
  },
  {
    type: 'slider',
    name: 'Noise',
    min: 0,
    max: 2,
    step: 0.01,
    value: 0.78,
    callback: () => undefined
  },
  { type: 'divider' },
  { type: 'toggle', name: 'Wobble', value: true, callback: () => undefined }
] satisfies readonly AlienPanelItem[];

const TAB_ITEMS = [
  {
    value: 'signal',
    label: 'Signal',
    content: <p>Input vector stable. Spectral envelope is holding at 0.82 coherence.</p>
  },
  {
    value: 'field',
    label: 'Field',
    content: <p>Low-frequency deformation is mapped across the viewport plane.</p>
  },
  {
    value: 'trace',
    label: 'Trace',
    content: <p>Last operator event was recorded at 08:42:16 UTC.</p>
  }
] satisfies readonly TabItem[];

export function Catalog(): React.JSX.Element {
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [linked, setLinked] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(true);
  const [panelError, setPanelError] = React.useState<string>();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-aliencn-theme', theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <main className="catalog-shell">
      <a className="catalog-skip" href="#catalog-main">Skip to component catalog</a>

      <header className="catalog-topbar">
        <a className="catalog-wordmark" href="#top" aria-label="Aliencn catalog home">
          <span className="catalog-wordmark__mark" aria-hidden="true">A</span>
          <span>ALIENCN</span>
        </a>
        <nav className="catalog-nav" aria-label="Catalog sections">
          <a href="#controls">Controls</a>
          <a href="#systems">Systems</a>
          <a href="#states">States</a>
        </nav>
        <div className="catalog-topbar__actions">
          <Badge tone={linked ? 'success' : 'warning'}>
            {linked ? 'Link stable' : 'Link idle'}
          </Badge>
          <Button size="sm" tone="ghost" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light field' : 'Dark field'}
          </Button>
        </div>
      </header>

      <section className="catalog-hero" id="top" data-aliencn-theme="dark">
        <ShaderCanvas
          className="catalog-hero__shader"
          label="Animated spectral field"
          speed={0.42}
          intensity={0.92}
        />
        <div className="catalog-hero__scan" aria-hidden="true" />
        <div className="catalog-hero__copy">
          <div className="catalog-eyebrow">
            <span>REGISTRY / 0013</span>
            <span>REACT SYSTEMS INTERFACE</span>
          </div>
          <h1>
            <span>ALIEN</span>
            <span className="catalog-hero__outline">/ CN</span>
          </h1>
          <p>
            Source-owned controls for visual systems that should feel engineered,
            atmospheric, and alive.
          </p>
          <div className="catalog-hero__actions">
            <Magnetic threshold={36}>
              <Button size="lg" onClick={() => setLinked(true)}>Establish link</Button>
            </Magnetic>
            <Button size="lg" tone="ghost" onClick={() => setDialogOpen(true)}>
              Read protocol ↗
            </Button>
          </div>
        </div>
        <dl className="catalog-telemetry">
          <Telemetry label="Build" value="0.2.0" />
          <Telemetry label="Nodes" value="13" />
          <Telemetry label="Latency" value="14ms" />
          <Telemetry label="State" value="Nominal" />
        </dl>
      </section>

      <div id="catalog-main">
        <section className="catalog-section" id="controls" aria-labelledby="controls-title">
          <SectionIndex number="01" label="Operator controls" />
          <div className="catalog-intro">
            <p className="catalog-eyebrow">SYSTEM MANIFEST</p>
            <h2 id="controls-title">Controls with signal,<br />not surface noise.</h2>
            <p>
              Square geometry, hairline states, compact telemetry type, and motion
              inherited from Alien.js and Space.js.
            </p>
          </div>

          <div className="catalog-rack">
            <div className="catalog-rack__cell catalog-rack__cell--actions">
              <RackLabel>ACTION MATRIX</RackLabel>
              <div className="catalog-button-matrix">
                <Button>Primary</Button>
                <Button tone="secondary">Secondary</Button>
                <Button tone="ghost">Ghost</Button>
                <Button tone="danger">Abort</Button>
                <Button loading>Resolving</Button>
                <Button disabled>Offline</Button>
              </div>
            </div>

            <div className="catalog-rack__cell">
              <RackLabel>CHANNEL STATE</RackLabel>
              <div className="catalog-badge-matrix">
                <Badge>Standby</Badge>
                <Badge tone="info">Scanning</Badge>
                <Badge tone="success">Online</Badge>
                <Badge tone="warning">Drift</Badge>
                <Badge tone="danger">Fault</Badge>
              </div>
              <div className="catalog-switch-row">
                <Switch checked={linked} onCheckedChange={setLinked} label="Spectral link" />
                <span>{linked ? '01' : '00'}</span>
              </div>
            </div>

            <div className="catalog-rack__cell catalog-rack__cell--input">
              <RackLabel>VECTOR INPUT</RackLabel>
              <InputField
                label="Endpoint"
                hint="Enter a target coordinate or callsign."
                inputProps={{
                  placeholder: 'kya://field/08',
                  defaultValue: 'alien://spectral/01'
                }}
              />
              <InputField
                label="Rejected vector"
                error="Coordinate checksum is incomplete."
                inputProps={{ defaultValue: 'x-41/' }}
              />
            </div>
          </div>
        </section>

        <section className="catalog-section catalog-section--systems" id="systems" aria-labelledby="systems-title">
          <SectionIndex number="02" label="Composed systems" />
          <h2 id="systems-title" className="catalog-visually-hidden">Composed systems</h2>
          <div className="catalog-systems-grid">
            <Card className="catalog-system-card">
              <CardHeader>
                <div className="catalog-card-meta">
                  <span>FIELD / A</span>
                  <Badge tone="success">Live</Badge>
                </div>
                <CardTitle>Telemetry viewport</CardTitle>
                <CardDescription>
                  Hierarchy from lines, registration, scale, and a deliberately quiet surface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs items={TAB_ITEMS} defaultValue="signal" />
              </CardContent>
              <CardFooter>
                <span className="catalog-footer-code">RX 0.82 / TX 0.64</span>
                <Button size="sm" tone="ghost">Inspect trace</Button>
              </CardFooter>
            </Card>

            <div className="catalog-panel-frame">
              <div className="catalog-panel-frame__head">
                <span>SPACE.JS / PANEL</span>
                <span>DEV TOOL</span>
              </div>
              <AlienPanel
                items={PANEL_ITEMS}
                fast
                onLoadError={(error) => setPanelError(error.message)}
              />
              {panelError ? <p className="catalog-panel-error">{panelError}</p> : null}
            </div>

            <div className="catalog-status-stack">
              {showBanner ? (
                <Banner tone="info" onDismiss={() => setShowBanner(false)}>
                  A new field map is available for inspection.
                </Banner>
              ) : (
                <Button size="sm" tone="ghost" onClick={() => setShowBanner(true)}>
                  Restore notice
                </Button>
              )}
              <Banner tone="success">All registry nodes passed integrity checks.</Banner>
              <Banner tone="warning">Viewport drift exceeds the preferred threshold.</Banner>
              <Banner tone="danger">Renderer context was lost. Reconnect the field.</Banner>
            </div>
          </div>
        </section>

        <section className="catalog-section" id="states" aria-labelledby="states-title">
          <SectionIndex number="03" label="Latent states" />
          <div className="catalog-states-head">
            <h2 id="states-title">Quiet states,<br />same visual grammar.</h2>
            <Button tone="secondary" onClick={() => setDialogOpen(true)}>Open dialog</Button>
          </div>
          <div className="catalog-states-grid">
            <EmptyState
              icon={<OrbitIcon />}
              title="No object selected"
              description="Choose a field object to expose its material and motion parameters."
              action={<Button size="sm" tone="ghost">Scan field</Button>}
            />
            <Card flat className="catalog-loading-frame">
              <CardHeader>
                <CardTitle>BUFFERING / 74%</CardTitle>
                <CardDescription>Skeleton, flat card, and progressive loading states.</CardDescription>
              </CardHeader>
              <CardContent className="catalog-loading-stack">
                <Skeleton className="catalog-skeleton catalog-skeleton--hero" />
                <Skeleton className="catalog-skeleton catalog-skeleton--medium" />
                <Skeleton className="catalog-skeleton catalog-skeleton--short" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <footer className="catalog-footer">
        <span>ALIENCN / SOURCE OWNED / 2026</span>
        <span>ALIEN.JS × SPACE.JS × KYA</span>
      </footer>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Protocol acknowledgement"
        description="Bind the local operator to the selected spectral field."
        footer={
          <>
            <Button tone="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setDialogOpen(false)}>Acknowledge</Button>
          </>
        }
      >
        <p className="catalog-dialog-copy">
          No telemetry leaves this device. The connection remains source-owned and
          can be terminated at any time.
        </p>
      </Dialog>
    </main>
  );
}

function SectionIndex({ number, label }: Readonly<{ number: string; label: string }>): React.JSX.Element {
  return (
    <div className="catalog-section-index" aria-hidden="true">
      <span>{number}</span>
      <span>{label}</span>
    </div>
  );
}

function RackLabel({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <span className="catalog-rack-label">{children}</span>;
}

function Telemetry({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function OrbitIcon(): React.JSX.Element {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" aria-hidden="true">
      <circle cx="27" cy="27" r="4" fill="currentColor" />
      <ellipse cx="27" cy="27" rx="23" ry="9" stroke="currentColor" />
      <ellipse cx="27" cy="27" rx="23" ry="9" stroke="currentColor" transform="rotate(60 27 27)" />
      <ellipse cx="27" cy="27" rx="23" ry="9" stroke="currentColor" transform="rotate(120 27 27)" />
    </svg>
  );
}
