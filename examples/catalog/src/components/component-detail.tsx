'use client';

import { Link, useTransitionRouter } from 'next-view-transitions';
import * as React from 'react';

import { Badge } from '@/components/aliencn/badge';
import { Banner } from '@/components/aliencn/banner';
import { Button } from '@/components/aliencn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/aliencn/card';
import { Dialog } from '@/components/aliencn/dialog';
import { EmptyState } from '@/components/aliencn/empty-state';
import { InputField } from '@/components/aliencn/input-field';
import { Magnetic } from '@/components/aliencn/magnetic';
import { AlertDialog } from '@/components/aliencn/alert-dialog';
import { Checkbox } from '@/components/aliencn/checkbox';
import { DecodeText } from '@/components/aliencn/decode-text';
import { Label } from '@/components/aliencn/label';
import { AlienPanel } from '@/components/aliencn/panel';
import { Progress } from '@/components/aliencn/progress';
import { Select } from '@/components/aliencn/select';
import { Separator } from '@/components/aliencn/separator';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/aliencn/table';
import { Textarea } from '@/components/aliencn/textarea';
import { Ticker } from '@/components/aliencn/ticker';
import { toast } from '@/components/aliencn/toast';
import { Tooltip } from '@/components/aliencn/tooltip';
import { ShaderCanvas } from '@/components/aliencn/shader-canvas';
import { Sheet, SheetRow, SheetSection } from '@/components/aliencn/sheet';
import { Skeleton } from '@/components/aliencn/skeleton';
import { Switch } from '@/components/aliencn/switch';
import { Tabs } from '@/components/aliencn/tabs';
import { getRegistryEntry, REGISTRY, registryNumber } from '@/lib/registry-manifest';

export function ComponentDetail({ slug }: Readonly<{ slug: string }>): React.JSX.Element | null {
  const entry = getRegistryEntry(slug);
  const index = REGISTRY.findIndex((candidate) => candidate.slug === slug);
  const router = useTransitionRouter();
  const navLockRef = React.useRef(0);
  const [replayKey, setReplayKey] = React.useState(0);

  const previousSlug = REGISTRY[(index + REGISTRY.length - 1) % REGISTRY.length]?.slug;
  const nextSlug = REGISTRY[(index + 1) % REGISTRY.length]?.slug;

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (event.key !== 'Escape' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      // Open dialogs and sheets own the keyboard while in the top layer.
      if (document.querySelector('dialog[open]')) return;
      // Leave keys alone inside anything that uses them: text fields keep
      // carets, selects and tablists keep arrow navigation.
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest(
          'input, textarea, select, [contenteditable="true"], [role="tablist"], [role="slider"], [role="radiogroup"], audio, video'
        )
      ) {
        return;
      }

      if (event.key === 'Escape') {
        router.push('/');
        return;
      }

      // Debounce rapid presses so a held key does not spam history while a
      // view transition is still playing.
      const now = performance.now();
      if (now - navLockRef.current < 300) return;
      navLockRef.current = now;

      const destination = event.key === 'ArrowLeft' ? previousSlug : nextSlug;
      if (destination) {
        event.preventDefault();
        router.push(`/component/${destination}`);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [nextSlug, previousSlug, router]);

  if (!entry || index < 0) return null;

  const previous = REGISTRY[(index + REGISTRY.length - 1) % REGISTRY.length] ?? entry;
  const next = REGISTRY[(index + 1) % REGISTRY.length] ?? entry;
  const install = `npx aliencn add ${entry.slug}`;

  return (
    <main className="catalog-shell detail-shell">
      <div className="catalog-grain" aria-hidden="true" />

      <header className="detail-topbar">
        <Link className="detail-back" href="/">
          <span aria-hidden="true">←</span> REGISTRY / 0013
        </Link>
        <span className="detail-topbar__meta">
          <span className="detail-topbar__keys" aria-hidden="true">← → NAVIGATE / ESC INDEX</span>
          <DecodeText
            key={entry.slug}
            text={`UNIT ${registryNumber(entry.slug)} / ${String(REGISTRY.length).padStart(2, '0')}`}
          />
        </span>
      </header>

      <article className="detail-body">
        <header className="detail-head">
          <p className="catalog-eyebrow detail-head__eyebrow">
            <DecodeText key={`${entry.slug}-kind`} text={entry.category === 'experience' ? 'EXPERIENTIAL UNIT' : 'DASHBOARD UNIT'} />
            <Badge tone={entry.status === 'stable' ? 'success' : 'info'}>{entry.status}</Badge>
          </p>
          <h1 className="detail-title" style={{ viewTransitionName: `comp-${entry.slug}` }}>
            {entry.name}
          </h1>
          <p className="detail-description">{entry.description}</p>
        </header>

        <dl className="detail-meta">
          <div>
            <dt>Contract</dt>
            <dd>{entry.contract}</dd>
          </div>
          <div>
            <dt>Packages</dt>
            <dd>{entry.dependencies.length > 0 ? entry.dependencies.join(' + ') : 'None'}</dd>
          </div>
          <div>
            <dt>Registry deps</dt>
            <dd>{entry.registryDependencies.join(' + ')}</dd>
          </div>
        </dl>

        <InstallCommand command={install} />

        <section className="detail-bench" aria-label={`${entry.name} test bench`}>
          <div className="detail-bench__head">
            <span><DecodeText text="TEST BENCH" /></span>
            <span className="detail-bench__meta">
              <button
                type="button"
                className="detail-bench__replay"
                onClick={() => setReplayKey((current) => current + 1)}
              >
                <span aria-hidden="true">↻</span> REPLAY
              </button>
              <DecodeText text="LIVE UNIT" />
            </span>
          </div>
          <div className="detail-bench__stage">
            <UnitDemo key={replayKey} slug={entry.slug} />
          </div>
        </section>

        <section className="detail-code" aria-label="Usage">
          <div className="detail-code__head">
            <span><DecodeText text="USAGE" /></span>
            <span><DecodeText text="SOURCE OWNED" /></span>
          </div>
          <pre><code>{entry.code}</code></pre>
        </section>
      </article>

      <nav className="detail-pager" aria-label="Adjacent units">
        <Link href={`/component/${previous.slug}`}>
          <span className="detail-pager__dir"><span aria-hidden="true">←</span> PREV</span>
          <span className="detail-pager__name">{previous.name}</span>
        </Link>
        <Link href={`/component/${next.slug}`} className="detail-pager__next">
          <span className="detail-pager__dir">NEXT <span aria-hidden="true">→</span></span>
          <span className="detail-pager__name">{next.name}</span>
        </Link>
      </nav>
    </main>
  );
}

function InstallCommand({ command }: Readonly<{ command: string }>): React.JSX.Element {
  const [copied, setCopied] = React.useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied; the command stays selectable.
    }
  };

  return (
    <div className="detail-install">
      <span className="detail-install__prompt" aria-hidden="true">$</span>
      <code>{command}</code>
      <Button size="sm" tone="ghost" onClick={() => void copy()}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

function UnitDemo({ slug }: Readonly<{ slug: string }>): React.JSX.Element {
  const remountKey = slug;
  switch (slug) {
    case 'button':
      return (
        <div className="detail-demo-row">
          <Button>Primary</Button>
          <Button tone="secondary">Secondary</Button>
          <Button tone="ghost">Ghost</Button>
          <Button tone="danger">Abort</Button>
          <Button loading>Resolving</Button>
          <Button disabled>Offline</Button>
        </div>
      );
    case 'card':
      return (
        <Card className="detail-demo-card">
          <CardHeader>
            <CardTitle>Telemetry viewport</CardTitle>
            <CardDescription>Registration, hierarchy, and a quiet surface.</CardDescription>
          </CardHeader>
          <CardContent>RX 0.82 / TX 0.64</CardContent>
        </Card>
      );
    case 'badge':
      return (
        <div className="detail-demo-row">
          <Badge>Standby</Badge>
          <Badge tone="info">Scanning</Badge>
          <Badge tone="success">Online</Badge>
          <Badge tone="warning">Drift</Badge>
          <Badge tone="danger">Fault</Badge>
        </div>
      );
    case 'input-field':
      return (
        <div className="detail-demo-stack">
          <InputField
            label="Endpoint"
            hint="Enter a target coordinate or callsign."
            inputProps={{ placeholder: 'kya://field/08', defaultValue: 'alien://spectral/01' }}
          />
          <InputField
            label="Rejected vector"
            error="Coordinate checksum is incomplete."
            inputProps={{ defaultValue: 'x-41/' }}
          />
        </div>
      );
    case 'tabs':
      return (
        <Tabs
          defaultValue="signal"
          items={[
            { value: 'signal', label: 'Signal', content: <p>Envelope holding at 0.82 coherence.</p> },
            { value: 'field', label: 'Field', content: <p>Deformation mapped across the plane.</p> },
            { value: 'trace', label: 'Trace', content: <p>Last event 08:42:16 UTC.</p> }
          ]}
        />
      );
    case 'dialog':
      return <DialogDemo />;
    case 'sheet':
      return <SheetDemo />;
    case 'switch':
      return <SwitchDemo />;
    case 'skeleton':
      return (
        <div className="detail-demo-stack">
          <Skeleton className="detail-demo-skeleton" />
          <Skeleton style={{ width: '72%' }} />
          <Skeleton style={{ width: '46%' }} />
        </div>
      );
    case 'empty-state':
      return (
        <EmptyState
          title="No object selected"
          description="Choose a field object to expose its material and motion parameters."
          action={<Button size="sm" tone="ghost">Scan field</Button>}
        />
      );
    case 'banner':
      return (
        <div className="detail-demo-stack">
          <Banner tone="info">A new field map is available for inspection.</Banner>
          <Banner tone="warning">Viewport drift exceeds the preferred threshold.</Banner>
        </div>
      );
    case 'panel':
      return (
        <div className="detail-demo-panel">
          <AlienPanel
            fast
            items={[
              { name: 'Spectral field' },
              { type: 'slider', name: 'Drift', min: 0, max: 1, step: 0.01, value: 0.42, callback: () => undefined },
              { type: 'toggle', name: 'Wobble', value: true, callback: () => undefined }
            ]}
          />
        </div>
      );
    case 'magnetic':
      return (
        <Magnetic threshold={36}>
          <Button size="lg">Establish link</Button>
        </Magnetic>
      );
    case 'shader-canvas':
      return <ShaderCanvas className="detail-demo-shader" label="Animated spectral field" speed={0.42} intensity={0.92} />;
    case 'tooltip':
      return (
        <div className="detail-demo-row">
          <Tooltip content="Coordinate checksum holds at 0.82.">
            <Button tone="secondary">Hover or focus</Button>
          </Tooltip>
          <Tooltip content="Flips when the viewport is tight." side="bottom">
            <Button tone="ghost">Bottom side</Button>
          </Tooltip>
        </div>
      );
    case 'toast':
      return (
        <div className="detail-demo-row">
          <Button tone="secondary" onClick={() => toast('Field map refreshed.', { tone: 'info' })}>
            Info toast
          </Button>
          <Button tone="secondary" onClick={() => toast('Spectral link established.', { tone: 'success' })}>
            Success toast
          </Button>
          <Button tone="danger" onClick={() => toast('Renderer context lost.', { tone: 'danger', duration: 0 })}>
            Sticky danger
          </Button>
        </div>
      );
    case 'select':
      return (
        <div className="detail-demo-stack">
          <Label htmlFor="bench-select">Target field</Label>
          <Select id="bench-select" defaultValue="a">
            <option value="a">Spectral field A</option>
            <option value="b">Spectral field B</option>
            <option value="c">Dark field</option>
          </Select>
        </div>
      );
    case 'label':
      return (
        <div className="detail-demo-stack">
          <Label htmlFor="bench-endpoint">Endpoint</Label>
          <InputField label="Endpoint" inputProps={{ id: 'bench-endpoint', defaultValue: 'alien://spectral/01' }} />
        </div>
      );
    case 'separator':
      return (
        <div className="detail-demo-stack">
          <p>Registration above.</p>
          <Separator />
          <p>Hairline between blocks.</p>
          <Separator dashed />
          <p>Dashed variant below.</p>
        </div>
      );
    case 'textarea':
      return <Textarea rows={4} defaultValue="Envelope holding at 0.82 coherence." aria-label="Transmission notes" className="detail-demo-textarea" />;
    case 'checkbox':
      return (
        <div className="detail-demo-stack">
          <Checkbox defaultChecked label="Persist telemetry" />
          <Checkbox label="Mirror to dark field" />
          <Checkbox disabled label="Locked by operator policy" />
        </div>
      );
    case 'alert-dialog':
      return <AlertDialogDemo />;
    case 'table':
      return <TableDemo />;
    case 'progress':
      return <ProgressDemo />;
    case 'scroll-director':
      return (
        <p className="detail-demo-note">
          Active on this page. Scroll and the content blocks lean with velocity;
          modal surfaces lock the page; anchor links glide. Native scroll position
          is never intercepted.
        </p>
      );
    case 'decode-text':
      return <DecodeText key={remountKey} text="SPECTRAL LINK STABLE" className="detail-demo-decode" />;
    case 'ticker':
      return (
        <Ticker
          className="detail-demo-ticker"
          duration={18}
          items={['Drift 0.42', 'Noise 0.78', 'Nodes 13', 'Field nominal']}
        />
      );
    case 'section-rail':
      return (
        <div className="detail-demo-rail">
          <SectionRailPreview />
        </div>
      );
    default:
      return <p>No bench is registered for this unit.</p>;
  }
}

function DialogDemo(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button tone="secondary" onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Protocol acknowledgement"
        description="Bind the local operator to the selected spectral field."
        footer={
          <>
            <Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Acknowledge</Button>
          </>
        }
      >
        <p className="catalog-dialog-copy">No telemetry leaves this device.</p>
      </Dialog>
    </>
  );
}

function SheetDemo(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [wobble, setWobble] = React.useState(true);
  const [grid, setGrid] = React.useState(true);
  return (
    <>
      <Button tone="secondary" onClick={() => setOpen(true)}>Open sheet</Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        eyebrow="FIELD CONFIG / 01"
        title="Field configuration"
        description="Local overrides for this operator session."
        footer={
          <>
            <span className="detail-sheet-status">2 SETTINGS</span>
            <Button size="sm" onClick={() => setOpen(false)}>Apply</Button>
          </>
        }
      >
        <SheetSection label="Render">
          <SheetRow label="Wobble drift" sublabel="Organic motion on the hero field.">
            <Switch checked={wobble} onCheckedChange={setWobble} aria-label="Wobble drift" />
          </SheetRow>
          <SheetRow label="Registration grid" sublabel="Hairline grid across surfaces.">
            <Switch checked={grid} onCheckedChange={setGrid} aria-label="Registration grid" />
          </SheetRow>
        </SheetSection>
      </Sheet>
    </>
  );
}

function SwitchDemo(): React.JSX.Element {
  const [standard, setStandard] = React.useState(true);
  const [system, setSystem] = React.useState(true);
  return (
    <div className="detail-demo-stack detail-demo-switches">
      <div className="detail-demo-switch-row">
        <span className="detail-demo-variant">DEFAULT</span>
        <Switch checked={standard} onCheckedChange={setStandard} label="Spectral link" />
      </div>
      <div className="detail-demo-switch-row">
        <span className="detail-demo-variant">SYSTEM</span>
        <Switch variant="system" checked={system} onCheckedChange={setSystem} label="Telemetry bus" />
      </div>
    </div>
  );
}

function AlertDialogDemo(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button tone="danger" onClick={() => setOpen(true)}>Sever link</Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Sever spectral link"
        description="The operator will disconnect from the field."
        actionLabel="Sever"
        onAction={() => toast('Spectral link severed.', { tone: 'warning' })}
      >
        <p className="catalog-dialog-copy">Telemetry stops immediately. Reconnection requires a new handshake.</p>
      </AlertDialog>
    </>
  );
}

function SectionRailPreview(): React.JSX.Element {
  return (
    <nav className="aliencn-rail" aria-label="Section progress preview">
      <a href="#controls" aria-current="true"><span aria-hidden="true" /><span>01</span></a>
      <a href="#systems"><span aria-hidden="true" /><span>02</span></a>
      <a href="#states"><span aria-hidden="true" /><span>03</span></a>
    </nav>
  );
}

const DEMO_NODES = [
  { node: 'Alpha', state: 'Nominal', drift: 0.42 },
  { node: 'Beta', state: 'Scanning', drift: 0.78 },
  { node: 'Gamma', state: 'Drift', drift: 1.04 },
  { node: 'Delta', state: 'Idle', drift: 0.11 }
] as const;

type NodeKey = 'node' | 'state' | 'drift';

function TableDemo(): React.JSX.Element {
  const [sort, setSort] = React.useState<{ key: NodeKey; direction: 'ascending' | 'descending' }>({
    key: 'node',
    direction: 'ascending'
  });
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set());

  const rows = [...DEMO_NODES].sort((a, b) => {
    const left = a[sort.key];
    const right = b[sort.key];
    const order = left < right ? -1 : left > right ? 1 : 0;
    return sort.direction === 'ascending' ? order : -order;
  });

  const toggle = (node: string): void => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(node)) next.delete(node);
      else next.add(node);
      return next;
    });
  };

  const sortBy = (key: NodeKey): void => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const header = (key: NodeKey, text: string, numeric = false): React.JSX.Element => (
    <TableHead
      aria-sort={sort.key === key ? sort.direction : undefined}
      className={numeric ? 'aliencn-table__cell--numeric' : undefined}
    >
      <button type="button" className="aliencn-table__sort" onClick={() => sortBy(key)}>
        {text}
      </button>
    </TableHead>
  );

  return (
    <div className="detail-demo-stack detail-demo-tables">
      <Table className="detail-demo-table">
        <TableCaption>
          {selected.size > 0 ? `${selected.size} node(s) selected` : 'Sortable columns / selectable rows'}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="detail-demo-table__pick" aria-label="Select" />
            {header('node', 'Node')}
            {header('state', 'State')}
            {header('drift', 'Drift', true)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.node} data-state={selected.has(row.node) ? 'selected' : undefined}>
              <TableCell className="detail-demo-table__pick">
                <Checkbox
                  checked={selected.has(row.node)}
                  onChange={() => toggle(row.node)}
                  aria-label={`Select ${row.node}`}
                />
              </TableCell>
              <TableCell>{row.node}</TableCell>
              <TableCell>{row.state}</TableCell>
              <TableCell numeric>{row.drift.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Table className="detail-demo-table aliencn-table--zebra aliencn-table--compact">
        <TableCaption>Zebra / compact variant</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead className="aliencn-table__cell--numeric">RX</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell>01</TableCell><TableCell>Spectral</TableCell><TableCell numeric>0.82</TableCell></TableRow>
          <TableRow><TableCell>02</TableCell><TableCell>Dark field</TableCell><TableCell numeric>0.64</TableCell></TableRow>
          <TableRow><TableCell>03</TableCell><TableCell>Telemetry</TableCell><TableCell numeric>0.97</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function ProgressDemo(): React.JSX.Element {
  const [value, setValue] = React.useState(12);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : Math.min(100, current + Math.ceil(Math.random() * 7))));
    }, 180);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="detail-demo-stack">
      <div className="detail-demo-progress-row">
        <span className="detail-demo-variant">BUFFERING</span>
        <span className="detail-demo-progress-value">{String(value).padStart(3, '0')}%</span>
      </div>
      <Progress value={value} label="Buffering" />
      <div className="detail-demo-progress-row">
        <span className="detail-demo-variant">SCANNING</span>
        <span className="detail-demo-progress-value">---</span>
      </div>
      <Progress label="Scanning" />
    </div>
  );
}
