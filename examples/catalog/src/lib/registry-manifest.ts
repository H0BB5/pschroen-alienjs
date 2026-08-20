export type RegistryCategory = 'dashboard' | 'experience' | 'motion' | 'theme';
export type RegistryStatus = 'stable' | 'preview';

export interface RegistryEntry {
  slug: string;
  name: string;
  category: RegistryCategory;
  status: RegistryStatus;
  description: string;
  contract: string;
  dependencies: readonly string[];
  registryDependencies: readonly string[];
  code: string;
  /** Install command override; defaults to `npx @kya-os/aliencn add <slug>`. */
  install?: string;
}

export const REGISTRY: readonly RegistryEntry[] = [
  {
    slug: 'button',
    name: 'Button',
    category: 'dashboard',
    status: 'stable',
    description: 'Primary, secondary, ghost, and danger actions with loading and disabled states.',
    contract: 'Native button semantics, aria-busy while resolving, disabled never fires.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Button } from '@/components/aliencn/button';\n\n<Button tone=\"danger\" size=\"lg\" onClick={abort}>\n  Abort\n</Button>"
  },
  {
    slug: 'card',
    name: 'Card',
    category: 'dashboard',
    status: 'stable',
    description: 'Composable surface with header, title, description, content, and footer.',
    contract: 'Pure composition, no state; flat variant collapses the radius.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Card, CardContent, CardHeader, CardTitle } from '@/components/aliencn/card';\n\n<Card>\n  <CardHeader><CardTitle>Telemetry</CardTitle></CardHeader>\n  <CardContent>RX 0.82 / TX 0.64</CardContent>\n</Card>"
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'dashboard',
    status: 'stable',
    description: 'Compact semantic state label with five tones.',
    contract: 'Tone plus text, never color alone; static by default.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Badge } from '@/components/aliencn/badge';\n\n<Badge tone=\"success\">Online</Badge>\n<Badge tone=\"danger\">Fault</Badge>"
  },
  {
    slug: 'input-field',
    name: 'Input field',
    category: 'dashboard',
    status: 'stable',
    description: 'Labeled input with hint, error, and complete ARIA wiring.',
    contract: 'Automatic ids, aria-describedby, aria-invalid, polite live errors.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { InputField } from '@/components/aliencn/input-field';\n\n<InputField\n  label=\"Endpoint\"\n  hint=\"Target coordinate or callsign.\"\n  inputProps={{ placeholder: 'kya://field/08' }}\n/>"
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'dashboard',
    status: 'stable',
    description: 'Keyboard-navigable tabs with controlled and uncontrolled modes.',
    contract: 'Roving tabindex, arrow and Home/End keys, full tablist relationships.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Tabs } from '@/components/aliencn/tabs';\n\n<Tabs\n  defaultValue=\"signal\"\n  items={[{ value: 'signal', label: 'Signal', content: <p>Stable.</p> }]}\n/>"
  },
  {
    slug: 'dialog',
    name: 'Dialog',
    category: 'dashboard',
    status: 'stable',
    description: 'Native modal dialog with managed open state and accessible labels.',
    contract: 'Top layer, focus containment, Escape and cancel handled by the platform.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Dialog } from '@/components/aliencn/dialog';\n\n<Dialog open={open} onOpenChange={setOpen} title=\"Protocol\">\n  <p>Bind the local operator.</p>\n</Dialog>"
  },
  {
    slug: 'sheet',
    name: 'Sheet',
    category: 'dashboard',
    status: 'preview',
    description: 'Edge-docked configuration surface with sections, rows, and a save bar.',
    contract: 'Native dialog top layer; sections, toggle rows, and dirty-state footer.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Sheet, SheetRow, SheetSection } from '@/components/aliencn/sheet';\n\n<Sheet open={open} onOpenChange={setOpen} title=\"Field configuration\">\n  <SheetSection label=\"SIGNAL\">\n    <SheetRow label=\"Spectral link\">\n      <Switch checked={linked} onCheckedChange={setLinked} aria-label=\"Spectral link\" />\n    </SheetRow>\n  </SheetSection>\n</Sheet>"
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'dashboard',
    status: 'stable',
    description: 'Controlled boolean switch in two treatments: a standard settings toggle and a square system instrument.',
    contract: 'Real button with role switch and aria-checked; default variant sized for touch.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Switch } from '@/components/aliencn/switch';\n\n<Switch checked={linked} onCheckedChange={setLinked} label=\"Spectral link\" />\n<Switch variant=\"system\" checked={bus} onCheckedChange={setBus} label=\"Telemetry bus\" />"
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    category: 'dashboard',
    status: 'stable',
    description: 'Reduced-motion-aware loading placeholder.',
    contract: 'Decorative only; animation suspends under reduced motion.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Skeleton } from '@/components/aliencn/skeleton';\n\n<Skeleton style={{ height: '9rem' }} />"
  },
  {
    slug: 'empty-state',
    name: 'Empty state',
    category: 'dashboard',
    status: 'stable',
    description: 'Centered empty composition with icon, copy, and one action.',
    contract: 'Heading-based structure that reads in document order.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { EmptyState } from '@/components/aliencn/empty-state';\n\n<EmptyState\n  title=\"No object selected\"\n  description=\"Choose a field object.\"\n  action={<Button size=\"sm\" tone=\"ghost\">Scan field</Button>}\n/>"
  },
  {
    slug: 'banner',
    name: 'Banner',
    category: 'dashboard',
    status: 'stable',
    description: 'Persistent info, success, warning, and danger notices.',
    contract: 'Status and alert roles by tone; dismissal is labeled.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Banner } from '@/components/aliencn/banner';\n\n<Banner tone=\"warning\" onDismiss={ack}>\n  Viewport drift exceeds the preferred threshold.\n</Banner>"
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'dashboard',
    status: 'stable',
    description: 'Hover and focus tooltip with viewport-aware flipping and Escape dismissal.',
    contract: 'role tooltip with aria-describedby on the trigger; content stays hoverable; WCAG 1.4.13.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Tooltip } from '@/components/aliencn/tooltip';\n\n<Tooltip content=\"Coordinate checksum\">\n  <Button tone=\"secondary\">Inspect</Button>\n</Tooltip>"
  },
  {
    slug: 'toast',
    name: 'Toast',
    category: 'dashboard',
    status: 'stable',
    description: 'Queued notifications with tones, live regions, and hover-paused timers.',
    contract: 'status/alert live regions; timers pause while the stack is hovered.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Toaster, toast } from '@/components/aliencn/toast';\n\n<Toaster />\ntoast('Spectral link established.', { tone: 'success' });"
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'dashboard',
    status: 'stable',
    description: 'Styled native select with platform keyboard, form, and mobile behavior.',
    contract: 'Real <select>; options are ordinary children.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Select } from '@/components/aliencn/select';\n\n<Select aria-label=\"Field\" defaultValue=\"a\">\n  <option value=\"a\">Field A</option>\n  <option value=\"b\">Field B</option>\n</Select>"
  },
  {
    slug: 'label',
    name: 'Label',
    category: 'dashboard',
    status: 'stable',
    description: 'The registration-mark form label used across field components.',
    contract: 'Native label association.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Label } from '@/components/aliencn/label';\n\n<Label htmlFor=\"endpoint\">Endpoint</Label>"
  },
  {
    slug: 'separator',
    name: 'Separator',
    category: 'dashboard',
    status: 'stable',
    description: 'Hairline or dashed rule in both orientations.',
    contract: 'Decorative by default; role separator opt-in.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Separator } from '@/components/aliencn/separator';\n\n<Separator dashed />"
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    category: 'dashboard',
    status: 'stable',
    description: 'Multi-line input sharing the Input optics.',
    contract: 'Native textarea semantics with aria-invalid wiring.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Textarea } from '@/components/aliencn/textarea';\n\n<Textarea rows={4} placeholder=\"Transmission notes\" />"
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'dashboard',
    status: 'stable',
    description: 'Native checkbox with the square instrument treatment.',
    contract: 'Real input inside its label; focus ring on the visual box.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Checkbox } from '@/components/aliencn/checkbox';\n\n<Checkbox defaultChecked label=\"Persist telemetry\" />"
  },
  {
    slug: 'alert-dialog',
    name: 'Alert dialog',
    category: 'dashboard',
    status: 'stable',
    description: 'Destructive-confirm preset over the native dialog.',
    contract: 'Focus starts on Cancel; danger tone on the action.',
    dependencies: [],
    registryDependencies: ['styles', 'cn', 'dialog', 'button'],
    code: "import { AlertDialog } from '@/components/aliencn/alert-dialog';\n\n<AlertDialog\n  open={open}\n  onOpenChange={setOpen}\n  title=\"Sever link\"\n  actionLabel=\"Sever\"\n  onAction={sever}\n/>"
  },
  {
    slug: 'table',
    name: 'Table',
    category: 'dashboard',
    status: 'stable',
    description: 'Styled semantic table with an owned horizontal scroll frame.',
    contract: 'Plain table semantics; deliberately not a data-table.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/aliencn/table';\n\n<Table>\n  <TableHeader>\n    <TableRow><TableHead>Node</TableHead><TableHead>Drift</TableHead></TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow><TableCell>Alpha</TableCell><TableCell numeric>0.42</TableCell></TableRow>\n  </TableBody>\n</Table>"
  },
  {
    slug: 'progress',
    name: 'Progress',
    category: 'dashboard',
    status: 'stable',
    description: 'Styled native progress with an indeterminate scan state.',
    contract: 'Determinate fill or indeterminate scan; scan rests under reduced motion.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Progress } from '@/components/aliencn/progress';\n\n<Progress value={64} label=\"Buffering\" />\n<Progress label=\"Scanning\" />"
  },
  {
    slug: 'scroll-director',
    name: 'Scroll director',
    category: 'experience',
    status: 'stable',
    description: 'Kinetic scroll response on native scrolling, modal scroll lock, and anchor glides.',
    contract: 'Native scroll position untouched; touch and reduced motion stay fully native.',
    dependencies: [],
    registryDependencies: ['styles'],
    code: "import { ScrollDirector } from '@/components/aliencn/scroll-director';\n\n<ScrollDirector />\n\n<section data-kinetic>Leans with scroll velocity.</section>"
  },
  {
    slug: 'decode-text',
    name: 'Decode text',
    category: 'experience',
    status: 'stable',
    description: 'Text that scrambles into place on first view.',
    contract: 'Screen readers always get the real text; static under reduced motion.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { DecodeText } from '@/components/aliencn/decode-text';\n\n<DecodeText text=\"SPECTRAL LINK STABLE\" />"
  },
  {
    slug: 'ticker',
    name: 'Ticker',
    category: 'experience',
    status: 'stable',
    description: 'Seamless hairline status stream.',
    contract: 'Duplicated list is aria-hidden; pauses on hover; rests under reduced motion.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { Ticker } from '@/components/aliencn/ticker';\n\n<Ticker items={['Drift 0.42', 'Nodes 13', 'Field nominal']} />"
  },
  {
    slug: 'section-rail',
    name: 'Section rail',
    category: 'experience',
    status: 'stable',
    description: 'Fixed section-progress ticks in difference blend.',
    contract: 'Tracks the section nearest viewport center; hidden on narrow viewports.',
    dependencies: [],
    registryDependencies: ['styles', 'cn'],
    code: "import { SectionRail } from '@/components/aliencn/section-rail';\n\n<SectionRail sections={[{ id: 'controls', label: 'Controls', number: '01' }]} />"
  },
  {
    slug: 'panel',
    name: 'Space panel',
    category: 'experience',
    status: 'stable',
    description: 'SSR-safe React host for Space.js panel items with deterministic cleanup.',
    contract: 'Items captured at mount; imperative updates through the onReady handle.',
    dependencies: ['@alienkitty/space.js'],
    registryDependencies: ['styles', 'cn'],
    code: "import { AlienPanel } from '@/components/aliencn/panel';\n\n<AlienPanel\n  items={[{ name: 'Spectral field' }, { type: 'slider', name: 'Drift', value: 0.42 }]}\n  onUpdate={(event) => console.log(event.path)}\n/>"
  },
  {
    slug: 'magnetic',
    name: 'Magnetic',
    category: 'experience',
    status: 'stable',
    description: 'Progressively enhanced Space.js magnetic motion with a reduced-motion fallback.',
    contract: 'No-op under reduced motion; transforms cleared on unmount.',
    dependencies: ['@alienkitty/space.js'],
    registryDependencies: ['styles', 'cn'],
    code: "import { Magnetic } from '@/components/aliencn/magnetic';\n\n<Magnetic threshold={36}>\n  <Button size=\"lg\">Establish link</Button>\n</Magnetic>"
  },
  {
    slug: 'shader-canvas',
    name: 'Shader canvas',
    category: 'experience',
    status: 'stable',
    description: 'Responsive Alien.js and Three.js shader surface with lifecycle-safe WebGL cleanup.',
    contract: 'Client-only WebGL, full teardown on unmount, labeled image role with fallback.',
    dependencies: ['@alienkitty/alien.js', 'three'],
    registryDependencies: ['styles', 'cn'],
    code: "import { ShaderCanvas } from '@/components/aliencn/shader-canvas';\n\n<ShaderCanvas label=\"Animated spectral field\" speed={0.42} intensity={0.92} />"
  },
  {
    slug: 'motion',
    name: 'KYA-OS motion',
    category: 'motion',
    status: 'stable',
    description:
      'The vendored KYA-OS motion layer: title decrypt reveals, glitch text, smooth scroll skew, and page transitions as five dependency-free vanilla ES modules.',
    contract: 'Copied byte-for-byte; Next.js and static sites run identical bytes; diff is a byte gate.',
    dependencies: [],
    registryDependencies: ['motion-types'],
    code: "import { initTitles } from './components/aliencn/motion/Title.js';\n\n// <h1 data-title-reveal>KYA-OS</h1>\ninitTitles();"
  },
  {
    slug: 'motion-react',
    name: 'Motion for React',
    category: 'motion',
    status: 'stable',
    description:
      'Thin React bindings over the vendored motion modules: a TitleReveal component and a usePageTransition hook.',
    contract: 'No duplicated animation logic; real text for screen readers; static under reduced motion.',
    dependencies: [],
    registryDependencies: ['motion'],
    code: "import { TitleReveal } from '@/components/aliencn/motion-react';\n\n<TitleReveal text=\"SPECTRAL LINK STABLE\" />"
  },
  {
    slug: 'kya-os-theme',
    name: 'KYA-OS theme',
    category: 'theme',
    status: 'stable',
    description:
      'The KYA-OS light/dark token layer as a packaged theme preset: light tokens on :root, dark tokens under prefers-color-scheme and data-theme hooks.',
    contract: 'Tokens only; set data-theme on documentElement to force a theme, remove it to follow the OS.',
    dependencies: [],
    registryDependencies: ['styles'],
    code: "/* aliencn init --theme kya-os writes aliencn-theme.css */\nimport './aliencn.css';\nimport './aliencn-theme.css';\n\n// Toggle contract:\ndocument.documentElement.setAttribute('data-theme', 'dark');",
    install: 'npx @kya-os/aliencn init --theme kya-os'
  }
] as const;

export function getRegistryEntry(slug: string): RegistryEntry | undefined {
  return REGISTRY.find((entry) => entry.slug === slug);
}

export function registryNumber(slug: string): string {
  const index = REGISTRY.findIndex((entry) => entry.slug === slug);
  return String(index + 1).padStart(2, '0');
}
