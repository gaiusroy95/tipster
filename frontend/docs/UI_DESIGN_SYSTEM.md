# UI Design System — Sports Tipster Platform

> Premium dark-mode sports application aesthetic. Original design inspired by Flashscore, Sofascore, DraftKings, and FanDuel — not a copy.

## 1. Design Principles

1. **Dark by default** — Reduces eye strain during long sessions; matches sports broadcast UI conventions.
2. **Data density with clarity** — Odds and stats are scannable; whitespace prevents clutter.
3. **Mobile-first** — Touch targets ≥ 44×44px; bottom navigation on small screens.
4. **Motion with purpose** — Subtle transitions; no animation on high-frequency odds cells.
5. **Accessible** — WCAG 2.1 AA contrast targets; visible focus rings; semantic HTML.

---

## 2. Color Tokens

Defined as CSS custom properties in `src/app/styles/theme.css` and consumed by Tailwind `@theme`.

### 2.1 Background & Surface

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| `--color-bg-primary` | `#0B0F14` | `bg-bg-primary` | App shell background |
| `--color-bg-surface` | `#141A22` | `bg-bg-surface` | Cards, panels, list rows |
| `--color-bg-elevated` | `#1A222D` | `bg-bg-elevated` | Modals, dropdowns, drawers |
| `--color-bg-hover` | `#1E2733` | `bg-bg-hover` | Interactive row hover |
| `--color-bg-input` | `#0F1419` | `bg-bg-input` | Form field backgrounds |

### 2.2 Borders & Dividers

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-border-default` | `#2A3441` | Card borders, table dividers |
| `--color-border-subtle` | `#1F2833` | Section separators |
| `--color-border-focus` | `#00C853` | Focus ring color |

### 2.3 Text

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#F0F4F8` | Headings, primary body |
| `--color-text-secondary` | `#C5CDD6` | Supporting labels |
| `--color-text-muted` | `#8B9AAB` | Timestamps, captions |
| `--color-text-disabled` | `#5A6573` | Disabled controls |

### 2.4 Accent & Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent-primary` | `#00C853` | Primary CTAs, active nav, links |
| `--color-accent-primary-hover` | `#00A844` | Button hover |
| `--color-accent-secondary` | `#00B8D4` | Secondary highlights, info |
| `--color-accent-win` | `#22C55E` | Positive P/L, won bets |
| `--color-accent-loss` | `#EF4444` | Negative P/L, lost bets |
| `--color-accent-live` | `#FF3B30` | Live match indicator |
| `--color-accent-warning` | `#F59E0B` | Pending, caution states |
| `--color-accent-gold` | `#F5A623` | Rank #1, prize badges |
| `--color-accent-silver` | `#C0C0C0` | Rank #2 |
| `--color-accent-bronze` | `#CD7F32` | Rank #3 |

### 2.5 Overlay & Shadow

| Token | Value | Usage |
|-------|-------|-------|
| `--color-overlay` | `rgba(11, 15, 20, 0.75)` | Modal backdrop |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.4)` | Default cards |
| `--shadow-elevated` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, drawers |
| `--shadow-glow-accent` | `0 0 20px rgba(0,200,83,0.15)` | Primary button emphasis |

### 2.6 Example `theme.css` Structure

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  --color-bg-primary: #0B0F14;
  --color-bg-surface: #141A22;
  --color-bg-elevated: #1A222D;
  --color-border-default: #2A3441;
  --color-text-primary: #F0F4F8;
  --color-text-muted: #8B9AAB;
  --color-accent-primary: #00C853;
  /* ... remaining tokens */
}

@theme inline {
  --color-bg-primary: var(--color-bg-primary);
  --color-bg-surface: var(--color-bg-surface);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

---

## 3. Typography

### 3.1 Font Families

| Role | Font | CSS variable | Usage |
|------|------|--------------|-------|
| UI | **Inter** | `--font-sans` | Body, headings, navigation |
| Data | **JetBrains Mono** | `--font-mono` | Odds, stakes, balances, stats |

Load via Google Fonts in `globals.css`. Fallback: `system-ui` / `ui-monospace`.

### 3.2 Type Scale

| Name | Size | Line height | Weight | Usage |
|------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px | 400 | Badges, fine print |
| `text-sm` | 14px | 20px | 400–500 | Table cells, labels |
| `text-base` | 16px | 24px | 400 | Body default |
| `text-lg` | 18px | 28px | 500 | Section titles |
| `text-xl` | 20px | 28px | 600 | Page subtitles |
| `text-2xl` | 24px | 32px | 600 | Page titles |
| `text-3xl` | 30px | 36px | 700 | Hero stats |
| `text-4xl` | 36px | 40px | 700 | Dashboard balance |

### 3.3 Typography Rules

- **Headings:** Inter, semibold (600). Never all-caps for headings.
- **Odds & money:** JetBrains Mono, bold (700) for emphasis; tabular nums (`font-variant-numeric: tabular-nums`).
- **Labels:** 14px, muted color, 500 weight.
- **Truncation:** Single-line ellipsis on team names in lists; full names on detail pages.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Tight inline gaps |
| `2` | 8px | Icon-to-text gap |
| `3` | 12px | Compact padding |
| `4` | 16px | Card padding (default) |
| `6` | 24px | Section gaps (mobile) |
| `8` | 32px | Section gaps (desktop) |
| `12` | 48px | Page section separation |

### 4.2 Page Layout

| Breakpoint | Page padding | Max content width |
|------------|--------------|-------------------|
| `< md` | 16px | 100% |
| `md–lg` | 20px | 100% |
| `≥ lg` | 24px | 1280px (`max-w-7xl`) |

### 4.3 Grid

- **12-column grid** on `lg+` for dashboard and profile stat grids.
- **2-column** stat cards on `sm`; **4-column** on `lg`.

---

## 5. Breakpoints

| Name | Min width | Layout behavior |
|------|-----------|-----------------|
| `sm` | 640px | 2-column stat grids |
| `md` | 768px | Tables replace card lists |
| `lg` | 1024px | Sidebar replaces bottom nav |
| `xl` | 1280px | Wider content area |
| `2xl` | 1536px | Optional max-width centering |

---

## 6. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Badges, chips |
| `rounded-md` | 8px | Buttons, inputs |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Modals, drawers |
| `rounded-full` | 9999px | Avatars, live dots |

---

## 7. Component Catalog

### 7.1 Buttons

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | `accent-primary` | `#0B0F14` | none | Place bet, submit |
| **Secondary** | transparent | `text-primary` | `border-default` | Cancel, back |
| **Ghost** | transparent | `text-muted` | none | Tertiary actions |
| **Danger** | `accent-loss` | white | none | Confirm cancel bet |

**Sizes:** `sm` (32px), `md` (40px), `lg` (48px) height.

**States:** hover (brightness), active (scale 0.98), disabled (opacity 50%), loading (spinner replaces label).

### 7.2 Inputs

- Background: `bg-input`
- Border: `border-default`; focus: `border-focus` + ring
- Height: 44px (touch-friendly)
- Error state: red border + `FieldError` message below

### 7.3 Cards

| Variant | Description |
|---------|-------------|
| **Default** | `bg-surface`, `rounded-lg`, `shadow-card`, 16px padding |
| **Interactive** | Hover lift + `bg-hover` transition |
| **Stat** | Large mono number, small muted label |
| **Match** | Teams, time, odds preview, live badge |

### 7.4 Badges

| Badge | Color | Usage |
|-------|-------|-------|
| Live | `accent-live` | Pulsing dot + "LIVE" |
| Won | `accent-win` | Bet result |
| Lost | `accent-loss` | Bet result |
| Rank 1–3 | gold/silver/bronze | Leaderboard |

### 7.5 Tables

- Sticky header on scroll
- Row hover: `bg-hover`
- Sortable columns: chevron indicator
- Mobile: convert to stacked card list below `md`

### 7.6 Navigation

**Mobile bottom tabs (5 items):**

1. Home (Dashboard)
2. Fixtures
3. Bet Slip (with selection count badge)
4. Leaderboard
5. More (wallet, bets, settings)

**Desktop sidebar:** Full nav tree with icons + labels.

### 7.7 Modals & Drawers

- **Modal:** Centered, max-width 480px (forms) or 640px (confirmations)
- **Drawer:** Bottom sheet on mobile; right panel on desktop (bet slip)
- Backdrop: `overlay` with click-to-dismiss where safe

### 7.8 Charts (Recharts)

Shared theme wrapper `ChartContainer`:

| Chart | Feature | Colors |
|-------|---------|--------|
| Line | Form streak, P/L over time | `accent-primary`, `accent-win/loss` |
| Bar | League performance | `accent-secondary` |
| Area | Cumulative profit | gradient fill from `accent-win` |

- Grid lines: `border-subtle`
- Axis labels: `text-muted`, 12px
- Tooltip: `bg-elevated` card style

### 7.9 Skeleton Loaders

- Match layout of target component (not generic spinners for lists)
- Shimmer animation: subtle, 1.5s loop
- Respect `prefers-reduced-motion`: static gray blocks

### 7.10 Toast Notifications

- Position: top-center on mobile, top-right on desktop
- Variants: success (green), error (red), info (cyan)
- Auto-dismiss: 4s; pause on hover

---

## 8. Icons

**Library:** Heroicons v2

| Context | Style |
|---------|-------|
| Navigation | Outline, 24px |
| Buttons / emphasis | Solid, 20px |
| Inline status | Solid, 16px |

Custom sport icons (football) only when Heroicons lacks coverage; keep stroke weight consistent.

---

## 9. Motion & Animation

### 9.1 Framer Motion Presets

| Pattern | Duration | Easing |
|---------|----------|--------|
| Page enter | 200ms | ease-out |
| Drawer slide | 300ms | spring (stiffness 400) |
| Modal fade | 150ms | ease-out |
| List stagger | 50ms per item | ease-out |

### 9.2 CSS Transitions

- Button hover: 150ms background
- Card hover lift: 200ms transform + shadow
- Odds cells: **no Framer Motion** — CSS hover only

### 9.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Contrast | ≥ 4.5:1 body text; ≥ 3:1 large text |
| Focus | 2px `accent-primary` ring, offset 2px |
| Live regions | `aria-live="polite"` on bet confirmation toast |
| Forms | `<label>` linked to inputs; `aria-describedby` for errors |
| Landmarks | `<header>`, `<nav>`, `<main>` in layouts |
| Skip link | "Skip to main content" in MainLayout |

---

## 11. Domain-Specific UI Patterns

### 11.1 Odds Display

| Market | Format | Font |
|--------|--------|------|
| Malay | `+0.85`, `-0.92` | Mono |
| Handicap | `-0.5 @ 1.95` | Mono |
| Over/Under | `O 2.5 @ 1.88` | Mono |

Selected odds: `accent-primary` background tint + border.

### 11.2 Virtual Credits

- Always suffix with " credits" or icon (🪙 substitute: custom coin icon)
- Format: `10,000` with locale separators
- Never use `$` or currency symbols

### 11.3 Bet Slip

- Sticky footer with total stake + potential return
- Rule violation banner in `accent-warning`
- Daily big bet counter: "2 of 3 big bets used today"

---

## 12. Future Light Mode

Structure tokens so light mode is a `[data-theme="light"]` override without component changes. Default remains dark; toggle stored in `uiStore` (Phase 11+).

---

## 13. Related Documents

- `COMPONENT_GUIDELINES.md` — Implementation patterns for UI tiers
- `FOLDER_STRUCTURE.md` — `shared/components/ui/` organization
- `PROJECT_ARCHITECTURE.md` — Layout architecture overview
