# BMV Staff Portal — Design System v1.0

## Document Control

| Field | Value |
|---|---|
| Document | BMV Staff Portal — Design System |
| Version | 1.0 |
| Status | Draft for review |
| Owner | Product/IT Leadership, BMV Bender Medical Vertrieb GmbH (maintained day-to-day by `agent_designer`, §8.2 of the master guide) |
| Parent document | [`docs/master-product-guide.md`](master-product-guide.md) — this document implements the "Medical Corporate" direction and the WCAG 2.2 AA mandate set there (§8.2, REQ-NFR-16); it does not redefine scope or requirements |
| Applicable standards | WCAG 2.2 AA, DSGVO/GDPR (no design decision here may reintroduce individual performance data into a UI surface — REQ-NFR-01), ISO 13485 change-control discipline (REQ-NFR-09) |
| Last updated | 2026-09-23 |

**Version history:**

| Version | Date | Summary | Approved by |
|---|---|---|---|
| 1.0 | 2026-09-23 | Initial token set, component states, and density model — closes the gap flagged against master guide §8.2 (agent_designer had a stated aesthetic direction but no concrete tokens to build against) | — |

**Why this document exists.** The master guide gives `agent_designer` a direction — "frictionless Medical Corporate interfaces," evaluated from two perspectives — but no tokens. Without a fixed palette, type scale, spacing system, and component state set, every screen across four pillars and two personas would be invented independently, and visual drift between them is guaranteed by Gate 3. This document is that fixed set. Any change to a token below is a change to every screen already built against it — treat edits here with the same change-control discipline as the master guide (version bump, summary, approver), and route them through `agent_compliance`/a design-literate human reviewer, not silent code-review adjustment.

**Scope note on IT ticket states.** REQ-IT-03 requires ticket status be driven by admin-configurable lookup tables, not hard-coded enums — so this document does not hard-code a color per named IT status. Instead, §6.3 below defines five *semantic* status categories that any configured lookup value must be mapped to at data-entry time (when an admin defines a new ticket state, they pick which of the five it behaves like). The HR, Fleet, and Asset state machines *are* fixed in the master guide (REQ-HR-01, REQ-FL, REQ-AS-01), so those get direct name-to-color mappings.

---

## 1. Design Principles

Two personas, stated in the master guide §8.2, drive every decision below rather than a single generic "clean UI" goal:

- **The employee under time pressure** (leave requests, ticket submission, notice board, own device/vehicle view) needs low cognitive load: generous spacing, large touch targets, minimal simultaneous choices, plain-language status, forgiving error recovery. This persona uses the **Comfortable** density mode (§4).
- **The IT/Fleet/Asset admin doing high-density, keyboard-first triage** (ticket queues, fleet registry, asset lifecycle tables) needs information density and speed: compact rows, visible keyboard affordances, scannable tabular data, minimal chrome. This persona uses the **Compact** density mode (§4).

A third constant, not a persona: every screen is built as if a Works Council representative and an ISO 13485 auditor will both review it. That means status is always shown with text and/or an icon, never color alone (§7.4), and nothing on an admin screen aggregates into a per-person ranking even if no requirement explicitly forbids that specific view (REQ-NFR-01 is a design constraint, not just a backend one).

"Medical Corporate" concretely means: clinical rather than playful, high-contrast, restrained color (color reserved for status and primary actions, not decoration), no illustration or imagery that reads as marketing, and typography/spacing precise enough to feel like instrument-panel software rather than a consumer app.

---

## 2. Color System

All pairings below are chosen to clear WCAG 2.2 AA contrast (≥ 4.5:1 for body text, ≥ 3:1 for large text ≥ 24px/19px-bold and for UI component boundaries/focus indicators). Treat the ratios as the acceptance bar, not the two example tools cited: verify the actual rendered pairing with a contrast checker (e.g. the WebAIM Contrast Checker or the axe DevTools contrast tool) at implementation time before merge, since font-rendering and anti-aliasing can shift real-world results slightly from a raw hex calculation — this is a Gate 1 exit-criterion check, not optional polish.

### 2.1 Neutrals (`--neutral-*`)

Used for backgrounds, borders, and the bulk of text. Slightly cool/clinical, not pure gray.

| Token | Hex | Typical use |
|---|---|---|
| `neutral-0` | `#FFFFFF` | App background (Comfortable), card/surface background |
| `neutral-50` | `#F7F9FB` | App background (Compact/admin), subtle section fill |
| `neutral-100` | `#EEF1F5` | Hover fill on neutral rows, disabled field background |
| `neutral-200` | `#DFE4EA` | Borders, dividers, table gridlines |
| `neutral-300` | `#C4CCD6` | Disabled borders, input borders (resting) |
| `neutral-500` | `#78C879` | Placeholder text, disabled text, secondary icons |
| `neutral-700` | `#3F4A5A` | Secondary body text |
| `neutral-900` | `#161C24` | Primary body text, headings |

### 2.2 Brand (`--brand-*`)

The one accent color used for primary actions, active navigation state, links, and focus rings — a restrained clinical blue rather than a saturated corporate blue.

| Token | Hex | Typical use |
|---|---|---|
| `brand-50` | `#EDF3FA` | Selected-row fill, info banner background |
| `brand-100` | `#D3E3F3` | Hover fill on brand-tinted elements |
| `brand-300` | `#7CA9D6` | Disabled-primary-button fill |
| `brand-500` | `#215B8F` | **Primary** — buttons, links, active nav item, focus ring base |
| `brand-600` | `#1A4A76` | Primary button hover |
| `brand-700` | `#123657` | Primary button active/pressed, text-on-brand-50 |

### 2.3 Status (`--status-*`)

One family per semantic status. These back both the fixed HR/Fleet/Asset state machines (§6.3 table) and the five configurable-ticket-state categories (§6.3).

| Token | Hex (fill/border) | Hex (text, on `-50` background) | Semantic meaning |
|---|---|---|---|
| `status-neutral` | `#7C8798` / bg `#F7F9FB` | `#3F4A5A` | Draft, unstarted, informational-only |
| `status-pending` | `#B7791B` / bg `#FCF3E3` | `#7A4E0E` | Awaiting action from someone else (Pending Manager, In Progress, In Repair) |
| `status-success` | `#1E7A52` / bg `#E7F5EE` | `#175C3E` | Approved, Resolved/Closed, In Stock, Active/Assigned |
| `status-danger` | `#B3261E` / bg `#FBEAE9` | `#8C1D17` | Rejected, expired/overdue (TÜV/insurance, license renewal), damage/loss report |
| `status-info` | `#215B8F` / bg `#EDF3FA` | `#123657` | Cancelled (neutral-but-distinguishable outcome), system notices |

Every status token ships as a *pair* — a `-50` background and a `-700`-equivalent text/border color — so a status pill never relies on the fill color alone to carry meaning; see §6.3 for the pill component spec (icon + label + color, always).

### 2.4 What's explicitly out

No secondary brand hue, no gradient tokens, no decorative accent palette. If a future screen seems to need a color not listed above, that's a signal to route it through `agent_designer`/a human design reviewer and add it here with a version bump — not to pick one inline.

---

## 3. Typography

**Family:** Inter, with the system UI stack as fallback (`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). Inter was chosen specifically because it has full glyph support for German (Ä/Ö/Ü/ß) at every weight used below, and its numeral set (tabular figures available) suits the dense admin tables and the billing/odometer/VIN fields.

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `text-display` | 36px / 44px | 600 | Page-level hero heading (rare — most screens start at h1) |
| `text-h1` | 30px / 38px | 600 | Page title |
| `text-h2` | 24px / 32px | 600 | Section heading |
| `text-h3` | 20px / 28px | 600 | Card/panel heading |
| `text-h4` | 18px / 26px | 600 | Sub-panel/table-group heading |
| `text-body-lg` | 16px / 24px | 400 | Comfortable-density default body text |
| `text-body` | 14px / 20px | 400 | Compact-density default body text; form field values |
| `text-small` | 13px / 18px | 400 | Helper text, table cell secondary line |
| `text-caption` | 12px / 16px | 500, uppercase, +0.02em tracking | Field labels, table column headers, status pill text |

**Localization note (REQ-NFR-17):** UI chrome ships in German first with an English toggle. German strings run 20–35% longer than English on average — every button, tab, and nav label must be tested at German length before it's considered done; don't design a component that only fits the English string. Numeric and date formatting follows German convention in the German locale (`DD.MM.YYYY`, comma as decimal separator — relevant to REQ-IT-06 billing amounts and REQ-FL odometer readings) and the corresponding English convention in the English locale.

---

## 4. Spacing, Grid & Density

**Base unit:** 4px. All spacing tokens are multiples of it: `space-1` (4px) through `space-16` (64px), standard linear scale — no arbitrary values in component code.

**Density modes** are the concrete mechanism behind the two-persona principle in §1. Both modes use the same color and spacing *tokens*; only which size preset a component defaults to changes.

| Aspect | Comfortable (employee-facing) | Compact (admin/IT triage) |
|---|---|---|
| Base body text | `text-body-lg` (16px) | `text-body` (14px) |
| Form input height | 40px | 32px |
| Table row height | N/A (cards preferred over dense tables) | 36px |
| Vertical rhythm between form fields | `space-6` (24px) | `space-3` (12px) |
| Default page container | max-width 768px, centered | fluid to 1600px |
| Primary interaction | Pointer, large touch targets (min 24×24px per WCAG 2.2 target-size, generally larger) | Keyboard-first: full tab order, visible focus, row-level keyboard shortcuts where the admin view defines them |

**Grid:** 12-column, 24px gutter at desktop widths. Breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px — standard Tailwind defaults, not customized, so Shadcn's default responsive utilities work without overrides.

**Radius:** `radius-sm` 4px (inputs, badges), `radius-md` 8px (buttons, cards), `radius-lg` 12px (modals/dialogs, panels). Kept small and consistent — "clinical," not rounded/playful.

**Elevation:** two shadow levels only — `shadow-sm` for cards resting on the page background, `shadow-md` for anything floating above content (dropdowns, popovers, dialogs). No decorative shadow beyond that; flat, high-contrast borders (`neutral-200`) do most of the separation work instead of shadow, which reads calmer at high information density.

---

## 5. Iconography

`lucide-react` — it's Shadcn UI's default icon set, so no second dependency. Stroke width fixed at `1.75` across the app (don't mix 1.5/2). Sizes: `icon-sm` 16px (inline with `text-body`/`text-small`), `icon-md` 20px (buttons, nav), `icon-lg` 24px (empty states, page-level). Every status pill (§6.3) pairs an icon with its color + label; the icon-to-status mapping (e.g. clock for pending, check-circle for success, x-circle for danger) must stay identical everywhere that status appears, so an icon alone is enough to recognize state once a user has learned the system.

---

## 6. Components (Shadcn UI)

Built on Shadcn primitives, themed through the CSS variables in §8 rather than one-off Tailwind classes in component code. Every interactive component below is specified with its full state set — Shadcn's default variants cover most of these but the state list must be exhaustively implemented, not left at whatever the unstyled primitive defaults to.

### 6.1 Button

Variants: `primary` (brand-500 fill), `secondary` (neutral-0 fill, neutral-300 border), `destructive` (status-danger fill — used only for irreversible actions: cancel a submitted leave request, retire a device, never for routine negative actions like "close ticket"), `ghost` (no fill/border, used for low-emphasis actions in dense admin toolbars), `link`.

States, required for every variant: `default`, `hover` (brand-600/equivalent −1 step), `focus-visible` (2px `brand-500` outline, 2px offset — keyboard-only, never on mouse click), `active/pressed` (−2 step), `disabled` (neutral-300 fill/text, `cursor-not-allowed`, never the only cue that an action is unavailable — pair with helper text explaining why when it's not obvious), `loading` (spinner replaces label, button stays disabled, width does not reflow).

### 6.2 Form fields (Input, Select, Textarea, Checkbox, Radio, Date picker)

States: `default` (neutral-300 border), `hover` (neutral-500 border), `focus` (brand-500 border + 2px brand-100 ring), `filled` (same as default, distinguishable from placeholder only by color per §7.4 not required — text content itself is the distinguishing cue), `disabled` (neutral-100 fill, neutral-300 text, no hover/focus change), `error` (status-danger border + ring, error icon inside the field, error message in `text-small`/`status-danger` text directly below the field, and the field's `aria-invalid`/`aria-describedby` wired to that message — a red border alone is not a compliant error state).

Every field has a persistent label above it (not placeholder-as-label) — required for both screen-reader users and for the German-string-length problem in §3, where a placeholder-only field truncates the longer German label invisibly.

### 6.3 Status pill / badge

The single most-reused component, backing every state machine in the master guide. Structure: icon (§5) + label text (`text-caption`) + `status-*` color pair (§2.3), pill shape (`radius-sm`, not fully rounded — keeps it legible at Compact density in a table cell).

Fixed mappings (master guide state machines, §3.1/§3.3/§3.4):

| Domain | State | Pill category |
|---|---|---|
| Leave (REQ-HR-01) | Draft | `neutral` |
| | Pending Manager | `pending` |
| | Approved | `success` |
| | Rejected | `danger` |
| | Cancelled | `info` |
| Device (REQ-AS-01) | In Stock | `success` |
| | Assigned | `info` |
| | Maintenance/Repair | `pending` |
| | Retired | `neutral` |
| Fleet/compliance alerts (REQ-FL-03) | ≥15 days to expiry | `pending` |
| | <5 days / expired | `danger` |

Configurable mapping (REQ-IT-03 ticket states, and any future admin-defined lookup value): when an admin defines a new lookup-table state, the config screen requires them to pick one of the five semantic categories in §2.3 for it — the state's display name stays free text, but its pill color/icon is always inherited from that category. This is what keeps a ticketing system with admin-editable states from drifting into ungoverned colors screen by screen.

### 6.4 Table (Compact-density admin views — ticket queue, fleet registry, asset registry)

Row height per §4 (36px Compact). States: `default` (alternating fill optional, off by default — use `neutral-200` bottom border per row instead, calmer at high density), `hover` (`neutral-50` fill, whole row), `selected` (`brand-50` fill + `brand-500` left border, 3px), `focus` (full-row keyboard focus ring, since Compact-density admin use is keyboard-first per §1). Sticky header row. Sort/filter affordances live in the `text-caption` column header, not a separate toolbar row, to keep vertical density.

### 6.5 Card / panel

`neutral-0` background, `neutral-200` 1px border, `shadow-sm`, `radius-md`. The default container for Comfortable-density employee screens (leave request form, ticket submission, device detail) — used in place of dense tables there, per §4.

### 6.6 Alert / inline banner and Toast

Same `status-*` pairs as §6.3, always icon + heading + body text, never color-only. Toasts (Shadcn `sonner`) auto-dismiss only for `success`/`info`; `danger`/`pending` toasts (e.g. a failed submission) persist until manually dismissed — an auto-dismissing error is an accessibility failure by omission.

### 6.7 Dialog / modal

`radius-lg`, `shadow-md`, focus-trapped, `Escape` closes unless the dialog represents a destructive confirmation with typed confirmation required (e.g. retiring a device, cancelling a submitted leave request) — matching the master guide's Review Gate philosophy of friction being proportional to irreversibility (§8, Review Gates).

### 6.8 Navigation

Two distinct shells, not one responsive layout pretending to be both (REQ-IT-01 requires this structurally, and it holds for every pillar's employee/admin split, not just IT):

- **Employee shell:** top nav, four or five items max (Home, Leave, Tickets, Fleet/Assets if assigned to them, Notices), Comfortable density throughout.
- **Admin shell:** persistent left sidebar (collapsible to icons-only at `lg` and below), Compact density, breadcrumb trail for the deeper triage/config screens, keyboard shortcut hints visible in tooltips.

---

## 7. Accessibility (WCAG 2.2 AA — REQ-NFR-16)

This section is the checklist `agent_designer` and `agent_compliance` both review a screen against before Gate 1 sign-off (master guide §7, Gate 1 exit criteria).

1. **Contrast:** ≥4.5:1 body text, ≥3:1 large text and UI component boundaries/focus indicators (§2 tokens are pre-checked; any new pairing gets verified before merge).
2. **Target size:** interactive targets ≥24×24px (WCAG 2.2 SC 2.5.8), met by the Comfortable-density presets in §4 by default; Compact-density admin controls that go smaller (e.g. a 32px table-row icon button) must keep effective hit area ≥24px via padding even if the visible icon is smaller.
3. **Focus visibility:** every interactive element has a visible `focus-visible` state (§6.1/§6.2 tokens) that never relies on browser default outline alone, and focus order follows visual/reading order — critical for the Compact admin shell, which is keyboard-first by design (§1).
4. **No color-only meaning:** every status pill, alert, and form error pairs color with an icon and/or text label (§6.3, §6.6, §6.2) — this is a hard rule, not a preference, because it's also what keeps status legible for the ~8% of men with red-green color vision deficiency without singling that out as a special case.
5. **Consistent, redundant labeling:** every form field has a persistent visible label (§6.2); icon-only buttons (common in the Compact admin toolbar) carry an `aria-label` and a tooltip with the same text.
6. **Language of parts:** the `lang` attribute is set per the active locale for chrome, but user-generated content (ticket descriptions, notice-board posts, REQ-NFR-17) is not forced into that `lang` value since it may be authored in either language — screen readers should not mispronounce German UI chrome as English or vice versa.

---

## 8. Implementation Notes (Tailwind + Shadcn)

Tokens above are implemented as CSS custom properties on `:root`, following Shadcn's own `--background`/`--foreground`/`--primary`/etc. convention so Shadcn's unstyled primitives inherit them with zero per-component overrides:

```css
:root {
  --background: 0 0% 100%;          /* neutral-0 */
  --foreground: 220 26% 9%;         /* neutral-900 */
  --primary: 209 62% 34%;           /* brand-500 */
  --primary-foreground: 0 0% 100%;
  --destructive: 4 71% 40%;         /* status-danger */
  --border: 216 16% 87%;            /* neutral-200 */
  --radius: 0.5rem;                 /* radius-md */
  /* status-*, neutral-*, brand-* full scale extended in tailwind.config.ts theme.extend.colors */
}
```

Density (§4) is implemented as a `data-density="comfortable" | "compact"` attribute on the shell root (employee shell vs. admin shell), with component size props (Shadcn's `size` variant on `Button`/`Input`/etc.) reading off it rather than two parallel component sets — one component library, two size presets, per §1.

Dark mode is **out of scope for v1.0** — nothing in the master guide requests it, and specifying it here without a stated requirement would be scope invented at the design layer rather than decided at Gate 0. If it's wanted later, it's a master-guide-first change (new REQ- ID), not a silent addition to this document.

---

## 9. Governance

This document is cited by `agent_designer`'s `SKILL.md` as `Full spec: docs/design-system.md`, the same pointer pattern the master guide uses for itself (master guide §9, step 2) — the citation only resolves if this file stays committed at `docs/design-system.md` alongside `docs/master-product-guide.md`. Any change to a token, state, or mapping in this document cascades to every screen already built against it, so changes go through the same discipline as the master guide: a version bump and summary row above, `agent_compliance`/a design-literate human reviewer in the loop (`CODEOWNERS`, per `CONTRIBUTING.md`), and — because it touches every pillar — should not be made mid-Gate-3 for a single pillar without checking whether it invalidates already-approved screens in earlier pillars.
