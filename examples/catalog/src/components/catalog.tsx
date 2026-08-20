'use client';

import { Link } from 'next-view-transitions';
import * as React from 'react';

import { AlertDialog } from '@/components/aliencn/alert-dialog';
import { Badge } from '@/components/aliencn/badge';
import { Checkbox } from '@/components/aliencn/checkbox';
import { Label } from '@/components/aliencn/label';
import { Progress } from '@/components/aliencn/progress';
import { Select } from '@/components/aliencn/select';
import { Separator } from '@/components/aliencn/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/aliencn/table';
import { Textarea } from '@/components/aliencn/textarea';
import { Tooltip } from '@/components/aliencn/tooltip';
import { DecodeText } from '@/components/aliencn/decode-text';
import { SectionRail } from '@/components/aliencn/section-rail';
import { Ticker } from '@/components/aliencn/ticker';
import { toast } from '@/components/aliencn/toast';
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
import { Sheet, SheetRow, SheetSection } from '@/components/aliencn/sheet';
import { Skeleton } from '@/components/aliencn/skeleton';
import { Switch } from '@/components/aliencn/switch';
import { Tabs, type TabItem } from '@/components/aliencn/tabs';
import { REGISTRY } from '@/lib/registry-manifest';

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
    content: (
      <Table className="catalog-node-table">
        <TableHeader>
          <TableRow>
            <TableHead>Node</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="aliencn-table__cell--numeric">Drift</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alpha</TableCell>
            <TableCell>Nominal</TableCell>
            <TableCell numeric>0.42</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Beta</TableCell>
            <TableCell>Scanning</TableCell>
            <TableCell numeric>0.78</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Gamma</TableCell>
            <TableCell>Drift</TableCell>
            <TableCell numeric>1.04</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  },
  {
    value: 'trace',
    label: 'Trace',
    content: <p>Last operator event was recorded at 08:42:16 UTC.</p>
  }
] satisfies readonly TabItem[];

const SECTIONS = [
  { id: 'controls', number: '01', label: 'Controls' },
  { id: 'systems', number: '02', label: 'Systems' },
  { id: 'states', number: '03', label: 'States' },
  { id: 'registry', number: '04', label: 'Registry' }
] as const;

const SECTION_IDS = SECTIONS.map((section) => section.id);

const TICKER_ITEMS = [
  'Spectral link stable',
  'Drift 0.42',
  'Noise 0.78',
  'Coherence 0.82',
  'Registry 0013',
  '31 units indexed',
  'Field nominal',
  'Source owned'
] as const;

interface FieldConfig {
  linked: boolean;
  scan: boolean;
  grid: boolean;
}

export function Catalog(): React.JSX.Element {
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [linked, setLinked] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(true);
  const [panelError, setPanelError] = React.useState<string>();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [abortOpen, setAbortOpen] = React.useState(false);
  const [fx, setFx] = React.useState({ scan: true, grid: true });
  const [draft, setDraft] = React.useState<FieldConfig>({ linked: false, scan: true, grid: true });

  const dirty = draft.linked !== linked || draft.scan !== fx.scan || draft.grid !== fx.grid;

  const openSheet = (): void => {
    setDraft({ linked, scan: fx.scan, grid: fx.grid });
    setSheetOpen(true);
  };

  const applyDraft = (): void => {
    setLinked(draft.linked);
    setFx({ scan: draft.scan, grid: draft.grid });
  };

  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-catalog-scan', fx.scan ? 'on' : 'off');
    html.setAttribute('data-catalog-grid', fx.grid ? 'on' : 'off');
  }, [fx]);

  const shellRef = React.useRef<HTMLElement>(null);
  const heroRef = React.useRef<HTMLElement>(null);
  const readoutRef = React.useRef<HTMLSpanElement>(null);
  const progressRef = React.useRef<HTMLSpanElement>(null);

  const activeSection = useActiveSection(SECTION_IDS);
  useReveal(shellRef);
  useScrollProgress(progressRef);
  useFieldPointer(heroRef, readoutRef);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-aliencn-theme', theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <main className="catalog-shell" ref={shellRef}>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('catalog-js');"
        }}
      />
      <a className="catalog-skip" href="#catalog-main">Skip to component catalog</a>
      <div className="catalog-grain" aria-hidden="true" />

      <header className="catalog-topbar">
        <a className="catalog-wordmark" href="#top" aria-label="Aliencn catalog home">
          <span className="catalog-wordmark__mark" aria-hidden="true">A</span>
          <span>ALIENCN</span>
        </a>
        <nav className="catalog-nav" aria-label="Catalog sections">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={activeSection === section.id ? 'true' : undefined}
            >
              <span className="catalog-nav__index" aria-hidden="true">{section.number}</span>
              {section.label}
            </a>
          ))}
        </nav>
        <div className="catalog-topbar__actions">
          <Badge tone={linked ? 'success' : 'warning'}>
            {linked ? 'Link stable' : 'Link idle'}
          </Badge>
          <Button size="sm" tone="ghost" onClick={openSheet}>Config</Button>
          <Button size="sm" tone="ghost" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light field' : 'Dark field'}
          </Button>
        </div>
      </header>
      <span className="catalog-progress" aria-hidden="true">
        <span ref={progressRef} />
      </span>

      <SectionRail
        sections={[{ id: 'top', number: '00', label: 'Index' }, ...SECTIONS.map((section) => ({ id: section.id, number: section.number, label: section.label }))]}
      />

      <section className="catalog-hero" id="top" data-aliencn-theme="dark" ref={heroRef}>
        <div className="catalog-hero__field" aria-hidden="false">
          <ShaderCanvas
            className="catalog-hero__shader"
            label="Animated spectral field"
            speed={0.42}
            intensity={0.92}
          />
        </div>
        <div className="catalog-hero__scan" aria-hidden="true" />
        <div className="catalog-hero__cross" aria-hidden="true">
          <span className="catalog-hero__cross-v" />
          <span className="catalog-hero__cross-h" />
        </div>
        <div className="catalog-hero__copy" data-reveal>
          <div className="catalog-eyebrow">
            <DecodeText text="REGISTRY / 0013" />
            <DecodeText text="REACT SYSTEMS INTERFACE" />
          </div>
          <h1>
            <span className="catalog-hero__word">ALIEN</span>
            <span className="catalog-hero__word catalog-hero__outline">/ CN</span>
          </h1>
          <p>
            Source-owned controls for visual systems that should feel engineered,
            atmospheric, and alive.
          </p>
          <div className="catalog-hero__actions">
            <Magnetic threshold={36}>
              <Button
                size="lg"
                onClick={() => {
                  const next = !linked;
                  toast(next ? 'Spectral link established.' : 'Spectral link severed.', {
                    tone: next ? 'success' : 'warning'
                  });
                  setLinked(next);
                }}
              >
                {linked ? 'Sever link' : 'Establish link'}
              </Button>
            </Magnetic>
            <Button size="lg" tone="ghost" onClick={() => setDialogOpen(true)}>
              Read protocol ↗
            </Button>
          </div>
        </div>
        <dl className="catalog-telemetry" data-reveal>
          <Telemetry label="Build"><DecodeText text="0.2.0" /></Telemetry>
          <Telemetry label="Nodes"><DecodeText text="13" /></Telemetry>
          <Telemetry label="Latency"><LiveLatency linked={linked} /></Telemetry>
          <Telemetry label="Uptime"><LiveUptime /></Telemetry>
          <Telemetry label="State">
            <DecodeText key={linked ? 'nominal' : 'idle'} text={linked ? 'Nominal' : 'Idle'} />
          </Telemetry>
        </dl>
        <span className="catalog-hero__readout" ref={readoutRef} aria-hidden="true">
          FIELD X 0.500 / Y 0.500
        </span>
      </section>

      <Ticker items={TICKER_ITEMS} aria-label="System status stream" className="catalog-stream" />

      <div id="catalog-main">
        <section className="catalog-section" id="controls" aria-labelledby="controls-title">
          <SectionIndex number="01" label="Operator controls" />
          <div className="catalog-intro" data-kinetic="">
            <p className="catalog-eyebrow" data-reveal>SYSTEM MANIFEST</p>
            <h2 id="controls-title" data-reveal>
              <Lines lines={['Controls with signal,', 'not surface noise.']} />
            </h2>
            <p data-reveal data-reveal-i="2">
              Square geometry, hairline states, compact telemetry type, and motion
              inherited from Alien.js and Space.js.
            </p>
          </div>

          <div className="catalog-rack" data-kinetic="">
            <div className="catalog-rack__cell catalog-rack__cell--actions" data-reveal>
              <RackLabel>ACTION MATRIX</RackLabel>
              <div className="catalog-button-matrix">
                <Button>Primary</Button>
                <Button tone="secondary">Secondary</Button>
                <Button tone="ghost">Ghost</Button>
                <Button tone="danger" onClick={() => setAbortOpen(true)}>Abort</Button>
                <Button loading>Resolving</Button>
                <Button disabled>Offline</Button>
              </div>
            </div>

            <div className="catalog-rack__cell" data-reveal data-reveal-i="1">
              <RackLabel>CHANNEL STATE</RackLabel>
              <div className="catalog-badge-matrix">
                <Badge>Standby</Badge>
                <Badge tone="info">Scanning</Badge>
                <Badge tone="success">Online</Badge>
                <Badge tone="warning">Drift</Badge>
                <Badge tone="danger">Fault</Badge>
              </div>
              <Separator dashed className="catalog-cell-sep" />
              <div className="catalog-switch-row">
                <Switch variant="system" checked={linked} onCheckedChange={setLinked} label="Spectral link" />
                <span>{linked ? '01' : '00'}</span>
              </div>
              <Checkbox defaultChecked label="Persist telemetry" className="catalog-cell-checkbox" />
            </div>

            <div className="catalog-rack__cell catalog-rack__cell--input" data-reveal data-reveal-i="2">
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
              <div className="catalog-field-group">
                <Label htmlFor="catalog-target">Target field</Label>
                <Select id="catalog-target" defaultValue="a">
                  <option value="a">Spectral field A</option>
                  <option value="b">Spectral field B</option>
                  <option value="d">Dark field</option>
                </Select>
              </div>
              <div className="catalog-field-group">
                <Label htmlFor="catalog-notes">Transmission notes</Label>
                <Textarea id="catalog-notes" rows={2} placeholder="Envelope holding at 0.82 coherence." />
              </div>
            </div>
          </div>
        </section>

        <section className="catalog-section catalog-section--systems" id="systems" aria-labelledby="systems-title">
          <SectionIndex number="02" label="Composed systems" />
          <h2 id="systems-title" className="catalog-visually-hidden">Composed systems</h2>
          <div className="catalog-systems-grid" data-kinetic="">
            <Card className="catalog-system-card" data-reveal>
              <CardHeader>
                <div className="catalog-card-meta">
                  <DecodeText text="FIELD / A" />
                  <Badge tone={linked ? 'success' : 'warning'}>{linked ? 'Live' : 'Idle'}</Badge>
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
                <span className="catalog-footer-code"><LiveSignal linked={linked} /></span>
                <Tooltip content="Opens the last operator event at 08:42:16 UTC.">
                  <Button size="sm" tone="ghost">Inspect trace</Button>
                </Tooltip>
              </CardFooter>
            </Card>

            <div className="catalog-panel-frame" data-reveal data-reveal-i="1">
              <div className="catalog-panel-frame__head">
                <span><DecodeText text="SPACE.JS / PANEL" /></span>
                <span><DecodeText text="DEV TOOL" /></span>
              </div>
              <AlienPanel
                items={PANEL_ITEMS}
                fast
                onLoadError={(error) => setPanelError(error.message)}
              />
              {panelError ? <p className="catalog-panel-error">{panelError}</p> : null}
            </div>

            <div className="catalog-status-stack" data-reveal data-reveal-i="2">
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
          <div className="catalog-states-head" data-kinetic="">
            <h2 id="states-title" data-reveal>
              <Lines lines={['Quiet states,', 'same visual grammar.']} />
            </h2>
            <div data-reveal data-reveal-i="1">
              <Button tone="secondary" onClick={() => setDialogOpen(true)}>Open dialog</Button>
            </div>
          </div>
          <div className="catalog-states-grid" data-kinetic="">
            <div data-reveal>
              <EmptyState
                icon={<OrbitIcon />}
                title="No object selected"
                description="Choose a field object to expose its material and motion parameters."
                action={<Button size="sm" tone="ghost">Scan field</Button>}
              />
            </div>
            <Card flat className="catalog-loading-frame" data-reveal data-reveal-i="1">
              <CardHeader>
                <CardTitle>BUFFERING / 74%</CardTitle>
                <CardDescription>Skeleton, flat card, and progressive loading states.</CardDescription>
              </CardHeader>
              <CardContent className="catalog-loading-stack">
                <Progress value={74} label="Buffering" />
                <Progress label="Scanning" />
                <Skeleton className="catalog-skeleton catalog-skeleton--hero" />
                <Skeleton className="catalog-skeleton catalog-skeleton--medium" />
                <Skeleton className="catalog-skeleton catalog-skeleton--short" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="catalog-section catalog-section--registry" id="registry" aria-labelledby="registry-title">
          <SectionIndex number="04" label="Registry index" />
          <div className="catalog-registry-head" data-kinetic="">
            <h2 id="registry-title" data-reveal>
              <Lines lines={[`${REGISTRY.length} units,`, 'one grammar.']} />
            </h2>
            <p data-reveal data-reveal-i="1">
              Every unit is source-owned once installed. Open a unit for its live
              test bench, contract, and install path.
            </p>
          </div>
          <ol className="catalog-registry" data-reveal data-reveal-i="2">
            {REGISTRY.map((entry, index) => (
              <li key={entry.slug} data-kinetic="">
                <Link href={`/component/${entry.slug}`} className="catalog-registry__row">
                  <span className="catalog-registry__num">{String(index + 1).padStart(2, '0')}</span>
                  <span
                    className="catalog-registry__name"
                    style={{ viewTransitionName: `comp-${entry.slug}` }}
                  >
                    {entry.name}
                  </span>
                  <span className="catalog-registry__cat">{entry.category}</span>
                  <Badge tone={entry.status === 'stable' ? 'success' : 'info'}>{entry.status}</Badge>
                  <span className="catalog-registry__arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="catalog-footer" data-kinetic="">
        <span><DecodeText text="ALIENCN / SOURCE OWNED / 2026" /></span>
        <span className="catalog-footer__clock">
          <LiveClock /> / SECTOR 7G
        </span>
        <span><DecodeText text="ALIEN.JS × SPACE.JS × KYA" /></span>
      </footer>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Protocol acknowledgement"
        description="Bind the local operator to the selected spectral field."
        footer={
          <>
            <Button tone="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setLinked(true);
                setDialogOpen(false);
              }}
            >
              Acknowledge
            </Button>
          </>
        }
      >
        <p className="catalog-dialog-copy">
          No telemetry leaves this device. The connection remains source-owned and
          can be terminated at any time.
        </p>
      </Dialog>

      <AlertDialog
        open={abortOpen}
        onOpenChange={setAbortOpen}
        title="Abort sequence"
        description="The current spectral pass will be discarded."
        actionLabel="Abort"
        onAction={() => {
          setLinked(false);
          toast('Sequence aborted. Spectral link severed.', { tone: 'warning' });
        }}
      >
        <p className="catalog-dialog-copy">Telemetry captured so far stays on this device.</p>
      </AlertDialog>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        eyebrow="FIELD CONFIG / 01"
        title="Field configuration"
        description="Local overrides for this operator session. Changes hold until applied."
        footer={
          <>
            <span className={cnStatus(dirty)}>{dirty ? 'UNSAVED CHANGES' : 'ALL APPLIED'}</span>
            <span className="catalog-sheet-actions">
              <Button
                size="sm"
                tone="ghost"
                disabled={!dirty}
                onClick={() => setDraft({ linked, scan: fx.scan, grid: fx.grid })}
              >
                Discard
              </Button>
              <Button size="sm" disabled={!dirty} onClick={applyDraft}>
                Apply
              </Button>
            </span>
          </>
        }
      >
        <SheetSection label="Signal">
          <SheetRow label="Spectral link" sublabel="Bind the operator to the field.">
            <Switch
              checked={draft.linked}
              onCheckedChange={(value) => setDraft((current) => ({ ...current, linked: value }))}
              aria-label="Spectral link"
            />
          </SheetRow>
        </SheetSection>
        <SheetSection label="Render">
          <SheetRow label="Scan sweep" sublabel="Slow scanline across the hero field.">
            <Switch
              checked={draft.scan}
              onCheckedChange={(value) => setDraft((current) => ({ ...current, scan: value }))}
              aria-label="Scan sweep"
            />
          </SheetRow>
          <SheetRow label="Registration grid" sublabel="Hairline grid over the spectral field.">
            <Switch
              checked={draft.grid}
              onCheckedChange={(value) => setDraft((current) => ({ ...current, grid: value }))}
              aria-label="Registration grid"
            />
          </SheetRow>
        </SheetSection>
      </Sheet>
    </main>
  );
}

function cnStatus(dirty: boolean): string {
  return dirty ? 'catalog-sheet-status catalog-sheet-status--dirty' : 'catalog-sheet-status';
}

/* Choreography ------------------------------------------------------------ */

function useReveal(shellRef: React.RefObject<HTMLElement | null>): void {
  React.useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    document.documentElement.classList.add('catalog-js');
    const targets = Array.from(shell.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [shellRef]);
}

function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    const sections = ids.flatMap((id) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-38% 0px -52% 0px' }
    );
    for (const section of sections) observer.observe(section);

    const onScroll = (): void => {
      if (window.scrollY < window.innerHeight * 0.4) setActive(null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [ids]);

  return active;
}

function useScrollProgress(barRef: React.RefObject<HTMLSpanElement | null>): void {
  React.useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let frame = 0;

    const update = (): void => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${value.toFixed(4)})`;
    };
    const request = (): void => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [barRef]);
}

function useFieldPointer(
  heroRef: React.RefObject<HTMLElement | null>,
  readoutRef: React.RefObject<HTMLSpanElement | null>
): void {
  React.useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    let frame = 0;
    let bounds: DOMRect | null = null;
    let pointerX = 0.5;
    let pointerY = 0.5;

    const apply = (): void => {
      frame = 0;
      hero.style.setProperty('--fx', (pointerX - 0.5).toFixed(4));
      hero.style.setProperty('--fy', (pointerY - 0.5).toFixed(4));
      if (bounds) {
        hero.style.setProperty('--cx', `${(pointerX * bounds.width).toFixed(1)}px`);
        hero.style.setProperty('--cy', `${(pointerY * bounds.height).toFixed(1)}px`);
      }
      const readout = readoutRef.current;
      if (readout) {
        readout.textContent = `FIELD X ${pointerX.toFixed(3)} / Y ${pointerY.toFixed(3)}`;
      }
    };

    const onPointerEnter = (): void => {
      bounds = hero.getBoundingClientRect();
      hero.classList.add('is-tracking');
    };
    const onPointerMove = (event: PointerEvent): void => {
      if (!bounds) bounds = hero.getBoundingClientRect();
      pointerX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointerY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onPointerLeave = (): void => {
      hero.classList.remove('is-tracking');
      pointerX = 0.5;
      pointerY = 0.5;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onResize = (): void => {
      bounds = null;
    };

    hero.addEventListener('pointerenter', onPointerEnter);
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener('pointerenter', onPointerEnter);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [heroRef, readoutRef]);
}

function useSteadyInterval(tick: () => void, ms: number): void {
  const tickRef = React.useRef(tick);
  tickRef.current = tick;

  React.useEffect(() => {
    let id: number | undefined;
    const run = (): void => tickRef.current();
    const start = (): void => {
      if (id === undefined) id = window.setInterval(run, ms);
    };
    const stop = (): void => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    const onVisibility = (): void => {
      if (document.hidden) {
        stop();
      } else {
        run();
        start();
      }
    };

    run();
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ms]);
}

/* Live instrumentation ----------------------------------------------------- */

function LiveLatency({ linked }: Readonly<{ linked: boolean }>): React.JSX.Element {
  const [latency, setLatency] = React.useState(14);
  useSteadyInterval(() => {
    setLatency(11 + Math.round(Math.random() * 7));
  }, 2400);
  return <span>{linked ? `${latency}ms` : '--'}</span>;
}

function LiveUptime(): React.JSX.Element {
  const startRef = React.useRef<number | null>(null);
  const [seconds, setSeconds] = React.useState(0);
  useSteadyInterval(() => {
    startRef.current ??= Date.now();
    setSeconds(Math.floor((Date.now() - startRef.current) / 1000));
  }, 1000);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return <span>{`T+${hh}:${mm}:${ss}`}</span>;
}

function LiveClock(): React.JSX.Element {
  const [clock, setClock] = React.useState('--:--:--');
  useSteadyInterval(() => {
    setClock(new Date().toISOString().slice(11, 19));
  }, 1000);
  return <span>{clock} UTC</span>;
}

function LiveSignal({ linked }: Readonly<{ linked: boolean }>): React.JSX.Element {
  const [signal, setSignal] = React.useState({ rx: 0.82, tx: 0.64 });
  useSteadyInterval(() => {
    setSignal((current) => ({
      rx: drift(current.rx, 0.6, 0.94),
      tx: drift(current.tx, 0.4, 0.86)
    }));
  }, 2000);

  if (!linked) return <span>RX 0.00 / TX 0.00</span>;
  return <span>{`RX ${signal.rx.toFixed(2)} / TX ${signal.tx.toFixed(2)}`}</span>;
}

function drift(value: number, min: number, max: number): number {
  const next = value + (Math.random() - 0.5) * 0.06;
  return Math.min(max, Math.max(min, next));
}

/* Static fragments ---------------------------------------------------------- */

function Lines({ lines }: Readonly<{ lines: readonly string[] }>): React.JSX.Element {
  return (
    <>
      {lines.map((line, index) => (
        <span className="catalog-line" key={line} data-line-i={index}>
          <span>{line}</span>
        </span>
      ))}
    </>
  );
}

function SectionIndex({ number, label }: Readonly<{ number: string; label: string }>): React.JSX.Element {
  return (
    <div className="catalog-section-index" aria-hidden="true">
      <span><DecodeText text={number} /></span>
      <span><DecodeText text={label} /></span>
    </div>
  );
}

function RackLabel({ children }: Readonly<{ children: string }>): React.JSX.Element {
  return <span className="catalog-rack-label"><DecodeText text={children} /></span>;
}

function Telemetry({ label, children }: Readonly<{ label: string; children: React.ReactNode }>): React.JSX.Element {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
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
