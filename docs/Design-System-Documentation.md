# Empleado V3 — Design System Documentation

> **Purpose:** This document describes the **observed** UI/UX design system of the Empleado V3 frontend as implemented in the repository. It covers **global CSS**, **per-view stylesheets**, **Tailwind/Material Tailwind** tokens, **inline/JS styles** (e.g. react-select), **Login vs shell** patterns, the **Career** submodule (HSL tokens + CVA/shadcn-style UI), and a **porting checklist** for reusing the same patterns in another project. **No application source code was modified** to produce this documentation.

### What you can promise when sharing this document

| Claim | Fair wording |
|--------|----------------|
| **“Complete CSS / layout for this repo”** | Accurate for **documented** layers: **global tokens**, **`index.css` utilities**, **shell layout**, **listed components**, **Career vs main-app split**, and **inventory of stylesheet files**. Individual screens may still use **extra one-off** Tailwind classes not enumerated line-by-line. |
| **“Another developer can match the same styling”** | **Yes**, if they implement **the same building blocks**: `tailwind.config.js` (or equivalent tokens), **`src/index.css`** (or merged rules), **Material Tailwind + `withMT`**, **Framer Motion** patterns where used, and **reference components** (`Header`, `SideMenu`, `CustomDrawer`, `CustomCard`, selects, etc.). This file is the **spec + map**; it is **not** a substitute for copying **config/CSS** or a **shared UI package**. |
| **“One CSS pattern for all my projects”** | Treat this doc plus **`tailwind.config` + `index.css` token subset** as your **canonical design contract**. For strict consistency, extract **tokens** (JSON/CSS variables) and **primitive components** into an **internal npm package** or monorepo library, and keep this document updated when tokens change. |

---

## 0. Quick reference — primitives (forms, cards, drawers)

| Building block | Main authenticated app (`src/` JSX) | Career (`View/Carrer/`) |
|----------------|-------------------------------------|-------------------------|
| **Forms** | **Material Tailwind** `Input`, `Textarea`, `Button`, `Select` patterns; **`react-hook-form` + Yup**; **`SearchReactSelect`** / **`prcFormSelectStyles`** for selects | **shadcn-style** `Input`, `Form`, `FormField`, **`cn()`**, tokens `border-input`, `ring-ring`, etc. |
| **Cards** | **MT `Card` + `CardBody`**, often `rounded-2xl shadow-card border border-gray-100`; **`CustomCard`** for dashboard tiles | **`cyber-card`**, gradient / glow utilities in Career `index.css` |
| **Drawers** | **`CustomDrawer`** (transparent overlay, gradient header) — global chrome; **`PortalDrawer`** (portal to `document.body`, biometric / some modals) — uses default MT overlay unless themed | **`Sheet`** / dialog components (CVA-based) in `components/ui/` |

---


## 1. Project Design Overview

### 1.1 Build & framework context

| Layer | Technology |
|--------|------------|
| **Bundler** | **Vite** (`vite`, `@vitejs/plugin-react`) — entry: `index.html` → `/src/index.jsx` |
| **UI library** | **React 18** |
| **CSS framework** | **Tailwind CSS v4** — `@import "tailwindcss"` in `src/index.css`, with `@config "../tailwind.config.js"` |
| **Tailwind integration** | **`@tailwindcss/vite`** plugin (see `package.json`) |
| **Component primitives** | **Material Tailwind React** (`@material-tailwind/react`) — `Navbar`, `Button`, `Card`, `Drawer`, `Avatar`, `Badge`, `IconButton`, `Typography`, `MenuItem`, etc. |
| **Theme merge** | `withMT` from `@material-tailwind/react/utils/withMT` wraps `tailwind.config.js` and merges Material Tailwind’s theme with the project `extend` block |
| **Animation** | **Framer Motion** — header menus, sidebar items, dashboard-style cards |
| **Selects** | **react-select** with inline `styles` objects (see `SearchReactSelect.jsx`) |
| **Toasts** | **react-toastify** — `ToastContainer` in `Toaster.jsx`, default React-Toastify CSS |
| **Forms** | **react-hook-form**, **Yup** (validation patterns vary by screen) |
| **Charts / calendars** | Chart.js + react-chartjs-2, react-datepicker, react-calendar (global overrides in `index.css`) |
| **Rich text** | Editor.js (padding overrides via utilities in `index.css`) |
| **Legacy / module CSS** | Some views use `.scss` or scoped `.css` (e.g. dashboard) — **secondary** to Tailwind in the main shell |
| **Career UI composition** | **`class-variance-authority`**, **`clsx`**, **`tailwind-merge`** (`cn()` in Career `lib/utils.ts`) — **shadcn-style** components under `View/Carrer/src/components/ui/` (see §10.5) |
| **External script** | **Flowbite** (`flowbite.min.js` in `index.html`) — **no `flowbite` class or import usage** was found under `src/`; treat as **unused or reserved** unless verified otherwise |

### 1.2 Visual direction (main application)

- **Light, enterprise SaaS** aesthetic: white surfaces, soft gray page background (**`background`** token), **blue brand** (`#3DA5F4` / `brand-500`) as the primary accent.
- **Heavy use of Tailwind utility classes** (`flex`, `gap-*`, `rounded-*`, `border-gray-100`, `shadow-card`, etc.) composed with **Material Tailwind** components.
- **Motion** is used for **feedback** (hover lift, scale on tap, short menu transitions) rather than full-page transitions.

### 1.3 Secondary surface: Career submodule (`src/View/Carrer/`)

The Career area includes its own **`index.css`** with a **separate “futuristic” dark theme** expressed as **CSS custom properties in HSL** (neon blue / purple / green accents, gradients, glow variables). This is **not** the same token set as the root `tailwind.config.js` theme. Treat it as an **isolated design island** when assessing consistency across the monorepo.

### 1.4 Meta & fonts (`index.html`)

- **`theme-color`:** `#3DA5F4` (aligns with brand primary).
- **Google Fonts loaded:** **Poppins** (full weight range), **Inter**, **Urbanist**.
- **Global enforcement:** `* { font-family: "Poppins", sans-serif !important; }` in `src/index.css` — **Poppins dominates** the main app regardless of other linked families.

---

## 2. Color Palette

Values below are taken from `tailwind.config.js`, `src/index.css`, `index.html`, and representative components.

### 2.1 Brand & semantic colors (`theme.extend.colors`)

| Token / name | Hex | Typical usage |
|--------------|-----|----------------|
| **primary** | `#3DA5F4` | Buttons, links, focus rings, brand accents |
| **secondary** | `#68BAA8` | Secondary semantic / success-adjacent |
| **danger** | `#F55E67` | Destructive / error emphasis |
| **warning** | `#FFC107` | Warnings |
| **success** | `#0acf97` | Success states |
| **surface** | `#ffffff` | Card / surface white |
| **background** | `#f3f4f6` | App content area behind cards (`bg-background`) |

### 2.2 Brand scale (`brand.*`)

| Step | Hex |
|------|-----|
| 50 | `#f0f9ff` |
| 100 | `#e0f2fe` |
| 200 | `#bae6fd` |
| 300 | `#7dd3fc` |
| 400 | `#38bdf8` |
| **500** | **`#3DA5F4`** (canonical brand) |
| 600 | `#0284c7` |
| 700 | `#0369a1` |
| 800 | `#075985` |
| 900 | `#0c4a6e` |

**Observed usage:** Sidebar active: `bg-brand-50 text-brand-600`; hovers: `hover:text-brand-600`, `text-brand-500`; header links: `text-brand-500 hover:text-brand-600`.

### 2.3 Neutrals & legacy aliases

| Token | Hex | Notes |
|-------|-----|--------|
| **customBlack.100** | `#474747` | Default body text (`text-customBlack-100` on `body`) |
| **customGray.100** | `#9b9b9b` | Muted text |
| **customGray.200** | `#f8f9fa` | Light fills |
| **customGray.300** | `#dee2e6` | Borders / dividers |
| **customGray.400** | `#545a5c` | Darker gray text |
| **customGray.500** | `#989898` | Mid gray |
| **customGray.blueGray** | `#6691cc` | Tinted gray |
| **customBlue** | `#3DA5F4` | Alias of primary |
| **blueCustom.100** | `#0185EA` | Deeper blue accent |
| **Red** / **customRed.100** | `#F55E67` / `#fc563b` | Error / red variants |
| **customGreen.100 / .200** | `#68BAA8` / `#0acf97` | Green / success family |
| **customPurple.500** | `#8770FF` | Purple accent |
| **customOrange.300 / .400** | `#FDB775` / `#ee963c` | Orange accent |
| **customYellow.100** | `#FFC107` | Warning alignment |
| **bgBlue** | `#3DA5F4` | Used e.g. on `CustomButton` (`bg-bgBlue`) |

### 2.4 Hard-coded colors in global CSS / utilities

| Location | Colors | Notes |
|----------|--------|--------|
| Scrollbar thumbs (`.customScroll`, etc.) | `#AAAAAA` | Consistent gray thumb |
| `.slider` track / thumb | `#e5e7eb` / **`#3b82f6`** | Tailwind **blue-500** — differs from brand `#3DA5F4` |
| `react-calendar` active tile | **`#3b82f6`** | Same blue-500 divergence |
| `.navLinkCustom.active` | background **`#3DA5F4`**, text white | Mobile drawer nav |
| `.navLinkCustomAdmin.active` | text **`#03a9f3`**, background `#fafafa` | Admin variant |
| Mobile nav inline (`SideMenuMobileView`) | `text-[#607d8b]`, `hover:text-[#03a9f3]` | Parallel palette to Tailwind `gray-*` |
| Employee profile | `background-color: #ffffff` on `body.employee-profile-page` | Full white shell |

### 2.5 RGB reference (design handoff)

| Hex | RGB |
|-----|-----|
| `#3DA5F4` | `rgb(61, 165, 244)` |
| `#474747` | `rgb(71, 71, 71)` |
| `#f3f4f6` | `rgb(243, 244, 246)` |
| `#68BAA8` | `rgb(104, 186, 168)` |
| `#F55E67` | `rgb(245, 94, 103)` |
| `#FFC107` | `rgb(255, 193, 7)` |
| `#0acf97` | `rgb(10, 207, 151)` |

### 2.6 Shadows (`theme.extend.boxShadow`)

| Name | Definition (summary) |
|------|----------------------|
| **soft** | Very light dual shadow for subtle elevation |
| **card** | Hairline border + soft drop shadow (`card` pattern on `CustomCard`, dashboards) |
| **card-hover** | Stronger elevation on hover |

### 2.7 Career submodule — HSL tokens (excerpt)

`src/View/Carrer/src/index.css` defines `:root` variables such as:

- **`--background`**, **`--foreground`** — dark base / light text  
- **`--primary`**, **`--secondary`**, **`--accent`** — neon blue / purple / green (HSL components only; consumed with `hsl(var(--primary))` patterns in that module)  
- **`--gradient-*`**, **`--glow-*`**, **`--transition-*`** — futuristic styling  

**Do not assume** these map 1:1 to main-app `brand-*` hex tokens without inspecting each Career component.

---

## 3. Typography System

### 3.1 Primary font

- **Poppins** — loaded from Google Fonts; applied via `body` (`font-poppins`) and a global `*` rule forcing Poppins.
- **Inter** and **Urbanist** — loaded but **overridden** for general UI by the global `*` rule.

### 3.2 Semantic HTML headings (`@layer base` in `src/index.css`)

| Element | Applied utilities |
|---------|-------------------|
| `h1` | `text-4xl font-bold` |
| `h2` | `text-3xl font-bold` |
| `h3` | `text-2xl font-bold` |
| `h4` | `text-xl font-semibold` |
| `h5` | `text-base font-semibold` |
| `h6` | `text-sm font-semibold` |

### 3.3 Line height & weight

- No custom `lineHeight` scale in `tailwind.config.js`; components use **Tailwind defaults** and utilities (`leading-tight`, etc.).
- Common weights: **`font-medium`**, **`font-semibold`**, **`font-bold`**; body is effectively **`font-normal`** unless overridden.

### 3.4 Typical UI sizes (observed)

| Context | Pattern |
|---------|---------|
| Sidebar labels | `text-sm font-medium`, `font-poppins` on labels |
| Header microcopy | `text-[10px]`, `text-[11px]`, `uppercase tracking-wider` |
| Drawer / data tables | `text-sm` body, `text-xs uppercase` headers |
| **SearchReactSelect** | Control `fontSize: 14`; options `fontSize: '14px'` |
| **CustomButton** | `text-[12px]`, `font-medium` |
| **CustomCard** title | `text-sm sm:text-[14px] font-semibold` |
| Mobile drawer links | `text-[14px]` |

---

## 4. Layout & Spacing Rules

### 4.1 Application shell (`App.jsx`)

| Region | Classes / behavior |
|--------|---------------------|
| **Root** | `flex flex-col h-screen w-full relative overflow-hidden bg-white` |
| **Header wrapper** | `flex-none z-50` |
| **Main row** | `flex flex-1 overflow-hidden relative` |
| **Desktop sidebar** | `hidden lg:block`, width **`w-64`** expanded vs **`w-20`** collapsed (`toggleState`), `border-r border-gray-100 bg-white shadow-sm z-40`, `transition-all duration-300` |
| **Scrollable content** | `flex-1 h-full overflow-y-auto p-6 bg-background transition-all duration-300 relative` |
| **Scroll class** | `customScroll` by default; **`employee-profile-scroll`** on employee profile routes (suppresses scrollbars) |
| **Career / login** | Routes starting with `/CareerApp/` or `/career-portal/` and login paths bypass the main chrome (see `App.jsx` logic) |

**Breakpoints:** Sidebar uses **`lg`** (`1024px`) for desktop rail vs mobile drawer; header content uses **`md`**, **`xl`** for progressive disclosure (e.g. admin tools, support block).

### 4.2 Spacing conventions

- **Page padding:** `p-6` on main content column.
- **Gaps:** `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6` in flex rows/columns.
- **Cards:** Often `rounded-2xl`, `p-4` / `p-6` on `CardBody`-style regions; `border border-gray-100` with `shadow-card`.
- **Header:** `px-4 py-3`; right cluster `gap-3 md:gap-5`.

### 4.3 Z-index layering (observed)

| Layer | Approximate z-index |
|-------|---------------------|
| Header | `z-50` |
| Sidebar | `z-40` |
| Header dropdown panels | `z-20` (Switch Access), `z-50` (profile menu) |
| Material Tailwind drawer (theme) | Drawer `z-[9999]`, overlay `z-[9995]` (`Theme.js`) |
| **CustomDrawer** overlay | `z-[9995]` (transparent overlay — see §5.8) |
| **ToastContainer** | `style={{ zIndex: 99999 }}` |

---

## 5. Component Design Breakdown

### 5.1 Navbar / Header (`src/Components/Header/Header.jsx`)

**Library:** Material Tailwind **`Navbar`**.

**Root structure**

- `fullWidth`, `sticky top-0 z-50`, `border-b border-gray-100`, `bg-white/90 backdrop-blur-md`, `px-4 py-3`, `shadow-sm`, `transition-all`.

**Layout**

- Outer: `flex items-center justify-between gap-4`.
- **Left:** Mobile `FaBars` (`block lg:hidden`), logo `h-8`, desktop sidebar toggle (`hidden lg:block`) with Tabler icons; gray default → **`hover:text-brand-500`**.
- **Admin (`xl+`):** “Machines / Live” **pill**: `bg-gray-50/50`, `rounded-full`, `border border-gray-200/60`, micro labels `text-[10px] uppercase tracking-wider`, live indicator with **green** ping animation.
- **Support / Report** (admin): `hidden lg:flex`, small text `text-[11px]`, brand link for Report.
- **Right:** Inbox + notifications as **`Badge` + `IconButton`** (red badge `bg-red-500`, white border), **Switch Access** `Button`, **Avatar** with profile menu.

**Responsiveness**

- Biometric pill: `hidden xl:flex`.
- Support block: `hidden lg:flex` (subset).
- Switch Access: `hidden sm:block`.
- Mobile navigation: **hamburger** opens **`CustomDrawer`** with **`SideMenuMobileView`** (see `App.jsx`), not a duplicate desktop menu.

### 5.2 Dropdowns — Header (Switch Access & Profile)

**Behavior**

- **Switch Access:** `onMouseEnter` / `onMouseLeave` on a `relative` wrapper — **hover-driven** menu.
- **Profile:** **Click** toggles; **click-outside** (`mousedown` on `document`) closes.

**Animation**

- **Framer Motion** `AnimatePresence` + `motion.div`.
- **Switch Access:** `initial={{ opacity: 0, y: 10 }}` → `animate` / `exit` with **`duration: 0.2`**.
- **Profile:** includes **`scale: 0.95 → 1`**, **`duration: 0.1`**.

**Positioning & surface**

- Switch Access: `absolute left-0 mt-1 w-48`, `rounded-xl border border-gray-100 bg-white p-2`, `shadow-lg shadow-blue-gray-500/10`, `z-20`.
- Profile: `absolute right-0 top-full mt-2 w-48 origin-top-right`, `rounded-xl border border-gray-100 bg-white p-2`, `shadow-xl shadow-blue-gray-500/10`, `z-50`.

**List items**

- Default: `rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600` (Switch Access).
- Profile: same base; **Logout** uses **`text-red-500 hover:bg-red-50`**.

### 5.3 Dropdowns — react-select (`SearchReactSelect.jsx`)

**Library:** `react-select`.

**Structure**

- **`IndicatorSeparator: null`** — no vertical bar between value and chevron (unless overridden).
- Optional **`hideDropdownIndicator`**, **`isMulti`** (hides multi-value UI via custom components), **`menuPortalTarget`**, **`menuPosition`**, **`menuPlacement`**.

**Base styles (inline `styles` prop)**

| Part | Key values |
|------|------------|
| **control** | `fontSize: 14`, `padding: 0 8px`, `boxShadow: none`, `border: 1px solid #B3B3B3`, `borderRadius: 5px`, `color: #495057` |
| **placeholder** | `#698592` |
| **menu** | `minWidth: 200px` |
| **menuList** | `maxHeight: 200px` |
| **option** | Selected `#f3f4f6`, focused `#f9fafb`, text `#111827` when selected |

**Overrides**

- If `cStyle` is true, merges **`propCustomStyles`** or **`useEmployees().customStyles`** from the hook — **per-screen or global** extension point.

### 5.4 Sidebar — Desktop (`src/Components/SideMenu/SideMenu.jsx`)

- Container: `flex flex-col w-full h-full bg-white`.
- Scroll: `flex-1 overflow-y-auto scrollbarHidden py-4 flex flex-col gap-1`.
- **NavLink** rows: `py-3 rounded-lg text-sm font-medium transition-all duration-200`.
- **Active:** `bg-brand-50 text-brand-600 shadow-sm`.
- **Inactive:** `text-gray-600 hover:bg-gray-50 hover:text-brand-600`.
- **Icons:** `text-gray-400` → active `text-brand-600`; collapsed mode uses larger icon size (`text-2xl` vs `text-lg`).
- **Motion:** `motion.div` with `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`.

### 5.5 Sidebar — Mobile drawer (`SideMenuMobileView.jsx`)

- Links: inline **`text-[#607d8b]`**, **`hover:text-[#03a9f3]`**, fixed padding **`px-[28px] py-[10px]`**, `gap-[10px]`, `text-[14px]`.
- Classes **`navLinkCustom`** / active/hover rules from **`index.css`** (scale + background) — **visual dialect differs** from desktop Tailwind-gray sidebar.

### 5.6 Buttons

| Pattern | Example |
|---------|---------|
| **Material Tailwind `Button`** | Switch Access: `rounded-lg border border-brand-200 bg-brand-50 text-brand-600`, `hover:bg-brand-100`, `size="sm"`, `font-medium normal-case` |
| **CustomButton** | `Button` with `capitalize py-2 px-4 font-medium text-[12px] bg-bgBlue`, optional `loading`, `icon` |
| **Icon buttons** | `IconButton variant="text" color="blue-gray"`, `rounded-full hover:bg-gray-100` |
| **Drawer close** | Native `button`: `p-2 -m-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100` |

### 5.7 Cards

**`CustomCard.jsx` (dashboard / navigation tiles)**

- **Material Tailwind** `Card` + `CardBody`.
- **Framer Motion** wrapper: `whileHover={{ y: -5 }}`, `transition={{ type: "spring", stiffness: 300 }}`.
- Surface: `shadow-card hover:shadow-card-hover`, `rounded-2xl`, `border border-gray-100`.
- Optional **count badge**: `absolute -top-2 -right-2`, small white text, `backgroundColor` prop default `#3DA5F4`.
- Title below: `text-sm sm:text-[14px] font-semibold text-gray-700 group-hover:text-brand-600`.

**Dashboard & content cards (`Dashboard.jsx` and similar)**

- Same **MT `Card` + `CardBody`** pattern with **`rounded-2xl shadow-card border border-gray-100`** (often `overflow-hidden`).
- **`CardBody`** padding varies by block: **`p-6`**, **`p-4`**, or **`p-0`** when inner layout controls spacing.
- **Stat / hero** cards may use **inline `style={{ background: … }}`** for colored gradients with **white** foreground text (decorative blobs `bg-white/10` in some widgets).

### 5.8 Drawers

**`CustomDrawer.jsx` (primary pattern for in-app drawer chrome)**

- Material Tailwind **`Drawer`**, `placement` from props (default **`right`**), `size` from **`resolveDrawerSizePx(widthSize)`**.
- Panel: `bg-white shadow-2xl border-l border-slate-100`, `flex flex-col overflow-hidden h-full`.
- **Overlay:** `!bg-transparent !backdrop-blur-none`, `z-[9995]` — **intentionally transparent** so the page remains visible (different from default MT overlay in `Theme.js`).
- **Header:** `border-b border-slate-100`, `bg-gradient-to-b from-white to-slate-50/50`, title `text-base font-semibold font-poppins text-slate-800`.
- **Content:** `flex-1 min-h-0 overflow-y-auto customDrwerScroll px-4 pb-4`.
- **Close behavior:** If `Toastify__toast` elements exist, close is **suppressed** to avoid accidental dismissal when toasts are visible.

**`PortalDrawer.jsx` (portal to `document.body` — e.g. Live Biometric Devices in `Header`)**

- **`ReactDOM.createPortal`** — renders **above** normal stacking context; optional **`zIndex`** via `style` prop.
- **Drawer** classes: `px-4 py-2 customDrwerScroll overflow-auto h-full max-w-[620px]` (scroll + max width).
- **Title:** `Typography` with **`text-[1.2vw] font-medium font-Urbanist text-[#474747]`** (viewport-based sizing). **`font-Urbanist`** is referenced here; **`Urbanist`** is loaded in `index.html` but **not** declared under `theme.extend.fontFamily` in root `tailwind.config.js` — when porting, either **add** `urbanist` to Tailwind fonts or **replace** with `font-poppins` for consistency.
- **Close:** `FaTimes`, `hover:text-red-500 hover:rotate-180 transition-all duration-300`.
- **Separator:** `<hr className='mb-2' />` under header.
- **Inline `<style>`:** `.portal-drawer-fit-content` forces **`height: fit-content`** / **`max-height: 100vh`** on drawer inner wrappers for certain layouts.
- Uses **default Material Tailwind drawer overlay** (not the transparent overlay hack of `CustomDrawer`) unless overridden by theme.

**`Theme.js` (Material Tailwind defaults)**

- Drawer: `z-[9999]`, white background, shadow; overlay `bg-black bg-opacity-60`, `backdrop-blur-xs`, `z-[9995]`.

### 5.9 Toasts (`Toaster.jsx`)

- **`ToastContainer`:** `position="top-right"`, **`autoClose={1500}`**, `newestOnTop`, `closeOnClick={false}`, `pauseOnHover`, `draggable`, **`zIndex: 99999`**.
- **`onClick`** on container stops propagation (avoids triggering drawer closes).
- Styling: default **React-Toastify** CSS import.

### 5.10 Forms (recurring patterns)

**Main app (Material Tailwind)**

- **Components:** `@material-tailwind/react` **`Input`**, **`Textarea`**, **`Button`**, **`Select`**, **`Popover`** (e.g. date pickers), often with **`color="blue"`** for MT’s blue theme.
- **Sizing overrides:** Many forms use **`className='!h-11 !rounded-6'`** (or similar) on inputs — **important** flags to override MT defaults.
- **Layout:** `form` commonly **`flex flex-col gap-4 sm:gap-6`**; **`w-full`** on field wrappers; responsive rows **`flex flex-col sm:flex-row justify-between gap-4`**.
- **Section titles:** e.g. **`h3`**: `text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 font-poppins`.
- **Native / hybrid inputs:** Same **gray border + brand focus** as below when not using MT.

**Inline / table-style inputs** (e.g. Header biometric drawer, quick edits)

- `rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500`.

**Selects**

- Default shared control: **`SearchReactSelect`** (see §5.3).
- Performance / review flows: **`prcFormSelectStyles`** — stronger shadow, brand selected state (see §11).

**Validation & state**

- **Yup + react-hook-form** widely used; **error message styling is not one global class** — each screen may use different text colors (`text-red-500`, helper text under field, etc.).

**Career submodule**

- **Radix/shadcn-style** **`Form`**, **`FormField`**, **`FormItem`**, **`FormLabel`**, **`FormControl`**, **`FormMessage`** with **`Input`** / **`Textarea`** using **`cn()`** and CSS variables (`bg-input`, `border-border`, `focus-visible:ring-ring`, etc.). **Do not mix** MT form components inside Career without visual review.

### 5.11 Scrollbars (global utilities in `index.css`)

| Class | Behavior |
|-------|----------|
| **`customScroll`** | 6px thumb `#AAAAAA`, white track |
| **`sideMenu` / `customDrwerScroll`** | Scrollbar hidden until hover |
| **`scrollbarHidden`** | Fully hidden scrollbar, still scrollable |
| **`employee-profile-scroll`** | Scrollbars suppressed (incl. nested `*`) for profile layout |

### 5.12 Third-party component overrides

- **react-calendar:** Borderless, Poppins, rounded tiles; active **`#3b82f6`** (see §2.4).
- **Editor.js:** `.editorjs-*` utilities zero padding.
- **Body overlays:** Rules targeting `body > div` overlays to mitigate stray Material Tailwind drawer overlay artifacts.

---

## 6. CSS Architecture & Class Patterns

### 6.1 Organization

1. **`src/index.css`** — Tailwind v4 import + config; **`@layer base`** for `body` and headings (headings appear in a **second** `@layer base` block after the global `*` font rule — order matters for cascade); **`@layer utilities`** appears **twice** (large block + Editor.js-only block) — both are valid layered CSS.
2. **`tailwind.config.js`** (repo root) — Extended colors, fonts, shadows; **`withMT`** merge. **`content`:** `./src/**/*.{html,js,jsx}` — TS/TSX under `src/` are **not** in this glob (Career may rely on its own config).
3. **Per-view styles** — `.scss` / `.css` imported by specific views (dashboard widgets, shift planner, etc.).
4. **Career** — `src/View/Carrer/src/index.css` + `src/View/Carrer/tailwind.config.ts` — separate Tailwind setup; **`src/View/Carrer/src/App.css`** is largely **Vite/React template leftovers** (`.logo`, `.card`, `logo-spin`) — **not** aligned with the main Empleado shell.

### 6.2 Complete inventory — stylesheets in this repo

| File | Role |
|------|------|
| **`src/index.css`** | **Primary global stylesheet** — Tailwind v4, scrollbars, calendar, slider, nav helpers, employee profile, Editor.js, body overlay hacks |
| **`src/View/Dashoboard/dashboard.scss`** | Nested **BEM-like** scaffold (`.dashboardContainer` …); mostly **commented** — minimal active rules |
| **`src/View/Dashoboard/AttendanceComp.css`** | **`.circle`** — round metric ring (`80px`, gray border `#eaeaea`, hover / success color `#0acf97`) |
| **`src/View/Dashoboard/TodayLateComers.css`**, **`LateComers7Days.css`**, **`EmployeesLimit.css`** | View-specific (import where used) |
| **`src/View/ShiftPlanners/EditMemberForm.css`** | **`.scrollbar-hide`** — same idea as global `scrollbarHidden` (Firefox + WebKit) |
| **`src/View/Carrer/src/index.css`** | Career **HSL design system**, `@layer base/components/utilities`, futuristic components |
| **`src/View/Carrer/src/App.css`** | Legacy Vite starter styles — optional cleanup if consolidating |
| **`src/View/Performance/prcFormSelectStyles.js`** | **Not CSS** — **react-select** `styles` object shared by PRC forms (brand-aligned selects) |

### 6.3 Naming conventions

- **Tailwind utilities** — dominant pattern; **CSS Modules** are not the default for the shell.
- **Custom global classes** — often **camelCase** or **descriptive phrases**: `customScroll`, `navLinkCustom`, `scrollbarHidden`, `employee-profile-page`, `bg-image-custom`, `editorjs-redactor`.
- **Limited BEM-like** names in legacy SCSS (e.g. `dashboardContainer` / `dashboardContainerHeader`).
- **Duplicate scrollbar naming:** **`scrollbarHidden`** / **`scrollbar-hide`** / **`.scrollbar-hide`** — same UX goal, **three spellings** across files.

### 6.4 Reusable utility patterns (Tailwind-heavy)

- **Flex layout:** `flex`, `items-center`, `justify-between`, `gap-*`, `flex-1`, `min-h-0` (scroll regions inside flex).
- **Brand interaction:** `text-brand-500`, `hover:text-brand-600`, `bg-brand-50`, `border-brand-200`, `focus:border-brand-500 focus:ring-1 focus:ring-brand-500`.
- **Neutrals:** `text-gray-600`, `border-gray-100`, `bg-gray-50`, `hover:bg-gray-50`, `text-slate-*` (drawer chrome).
- **Elevation:** `shadow-sm`, `shadow-card`, `hover:shadow-card-hover`, `shadow-lg`, `shadow-xl`.
- **Rounded UI:** `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`.
- **Responsive:** `sm:`, `md:`, `lg:`, `xl:` — shell breakpoints as documented in layout §4.
- **Arbitrary values:** frequent in one-off screens — e.g. `text-[10px]`, `text-[13px]`, `border-[#343A40]` on **Login**.

### 6.5 Global custom classes — reference (`src/index.css`)

Use this table when **porting** the shell to another codebase.

| Class | Purpose / behavior |
|-------|---------------------|
| **`customSVG`** | `transform: rotate(-90deg)` — circular progress / SVG orientation |
| **`customScroll`** | Always-visible **6px** gray scrollbar (`#AAAAAA` thumb, white track) |
| **`sideMenu`** | Scrollbar **hidden** until **hover** (then same thumb as above) |
| **`customDrwerScroll`** | Same hover-reveal scrollbar — used on **CustomDrawer** body |
| **`scrollbarHidden`** | Scrollbar fully hidden; content still scrolls (Firefox + WebKit) |
| **`bg-image-custom`** | `background-size: cover`, `center center` |
| **`slider`** | Range input: **8px** track `#e5e7eb`, thumb **`#3b82f6`**, 20px circle |
| **`navLinkCustom`** | Mobile nav: hover scale `1.1`, active **bg `#3DA5F4`** white text |
| **`navLinkCustomAdmin`** | Variant: active text **`#03a9f3`**, light gray bg |
| **`employee-profile-page`** | On `body`: `overflow: hidden`, **white** bg, `#root` **100vh** |
| **`employee-profile-scroll`** | Hides scrollbars on self + descendants |
| **`.react-calendar` / `__tile` / `__navigation`** | Calendar chrome: Poppins, no border, **active tile `#3b82f6`** |
| **`.editorjs-*`** | Strip default padding on Editor.js regions |
| **`body > div` overlay rules** | Hide orphaned fixed overlays (Material Tailwind drawer cleanup) |

**Note:** `@keyframes rotateZoomOut` in `index.css` is **structurally broken** (`.slider` rules are nested inside the keyframes block). Browsers may still apply `.slider` depending on parse recovery — when porting, **flatten** slider + keyframes into separate valid blocks.

### 6.6 Inline / JS styling (not in `.css` files)

| Source | Pattern |
|--------|---------|
| **`SearchReactSelect.jsx`** | Default **react-select** theme: gray border `#B3B3B3`, placeholder `#698592`, option grays |
| **`prcFormSelectStyles.js`** | **Alternate** select skin: **no** border on control, **shadow**, **brand `#3DA5F4`** selected option, **`#E3F1FF` / `#F0F8FF`** hover — matches **customBlack** / brand story |
| **Charts** | Chart.js / Recharts — colors from **inline options** or defaults, not central tokens |
| **Dashboard stat cards** | Some use **`style={{ background: ele.bgColor }}`** for gradient cards |

---

## 7. Pattern Identification (cross-cutting)

1. **Shell:** Fixed full-height column layout; **header + optional sidebar + scrolling main**; **main content** on **`bg-background`** with **`p-6`**.
2. **Primary actions:** Brand blues (`brand-*`, `bg-bgBlue` on legacy buttons) and light brand fills (`bg-brand-50`).
3. **Destructive:** Red text / `bg-red-50` / `bg-red-500` badges.
4. **Status chips (data tables / drawers):** Small **rounded** blocks with **semantic bg + border** — e.g. `rounded-lg bg-green-50 … border-green-100` (connected) vs `bg-red-50 … border-red-100` (disconnected); text `text-green-700` / `text-red-700`.
5. **Data tables (inline):** `w-full text-sm text-left`, `thead` `bg-gray-50 text-xs uppercase text-gray-700`, `tbody` `divide-y divide-gray-200`, row `hover:bg-gray-50`.
6. **Motion:** Framer Motion for **menus** and **sidebar**; **spring** on some cards; **durations ~0.1–0.2s** for overlays; Login uses **longer** stagger (**0.5s** duration, **0.1–0.7s** delays).
7. **Dropdowns:** Header uses **absolute positioning + Motion**; forms often use **react-select** via **`SearchReactSelect`** or **`prcFormSelectStyles`** for brand-heavy screens.
8. **Drawers:** Two visual systems — **transparent overlay** (`CustomDrawer`) vs **dark blurred overlay** (default MT theme in `Theme.js`).
9. **Dual nav styling:** Desktop sidebar uses **Tailwind `gray-*` + `brand-*`**; mobile drawer mixes **hex** + **`navLinkCustom`** classes.
10. **Dashboard widgets:** Optional **`.circle`** metric rings (`AttendanceComp.css`); **dashboard.scss** provides **nested BEM placeholders** — mostly commented, **Tailwind** used in JSX for live UI.

---

## 8. Reusability Guidelines (for designers & developers)

These are **descriptive** guidelines inferred from the codebase, not prescriptive product requirements.

1. **Prefer theme tokens** in `tailwind.config.js` (`brand-*`, `background`, `customBlack-*`, semantic colors) for the main shell; **minimize new arbitrary hex** unless matching documented exceptions (mobile nav, react-select).
2. **Surfaces:** White (`bg-white`, `surface`) on **`bg-background`**; cards often **`shadow-card`** + **`border-gray-100`**.
3. **Primary actions:** `brand-500` / `brand-600` / `bg-brand-50`; **destructive:** `text-red-500`, `hover:bg-red-50`, or semantic `danger` where mapped.
4. **Motion:** Keep menu transitions **short**; align new animations with existing Framer patterns.
5. **Selects:** Extend **`SearchReactSelect`** styles via `customStyles` / `cStyle` rather than one-off duplicate wrappers when possible.
6. **Career module:** Use **that subtree’s** CSS variables and components — **verify** tokens before reusing main-app classes inside `View/Carrer/`.
7. **Accessibility:** Many patterns rely on **color + hover**; **contrast and focus states** should be validated per new screen (especially light gray on white / gray-50).

---

## 9. Login & full-screen marketing patterns (`Login.jsx`)

The login route is **outside** the main chrome (`App.jsx`). Styling is **mostly Tailwind** with **Framer Motion** staggered reveals.

| Pattern | Classes / behavior |
|---------|---------------------|
| **Layout** | `h-screen grid grid-cols-2` — **50/50** split |
| **Left column** | `bg-black`, **full-bleed** `motion.div` with `absolute inset-0 bg-cover bg-center`, rotating **`images[]`** every 4s |
| **Right column** | `flex items-center justify-center bg-white` — form column |
| **Typography** | `text-[12px]`, `text-[13px]`, `text-[15px]` — **arbitrary pixel** scale (not `text-sm` tokens) |
| **Primary CTA** | `rounded-none border border-[#343A40]`, `hover:text-white hover:bg-[#343A40]`, `duration-1000` — **Bootstrap-like** dark outline button |
| **Store buttons** | Red outline **`#dc3545`** (Google Play), dark **`#343A40`** (App Store) — **material design–adjacent** palette |
| **Marketing accents** | `bg-[#007bff]`, `text-[#007BFF]` — **Bootstrap primary blue**, distinct from **brand `#3DA5F4`** |
| **Motion** | `initial={{ opacity: 0, y: 50 }}` → `animate` with **delays 0.1–0.7s**, cubic-bezier **`[0, 0.21, 0.2, 0.2]`** |

**Takeaway for porting:** Treat **Login** as a **separate visual dialect** (legacy marketing colors + arbitrary values), not the same token discipline as the authenticated shell.

---

## 10. Career submodule — CSS patterns (`View/Carrer/`)

### 10.1 Dual theme (HSL variables)

- **`:root`** — default **futuristic dark** (`--background` ~ `220 30% 5%`, neon **`--primary`**, **`--secondary`**, **`--accent`**).
- **`.light` / `:root:not(.dark)`** — **light** overrides (white cards, softer primary).
- **Body:** `background: var(--gradient-background)`, `min-height: 100vh`.
- **`*`:** `@apply border-border` — borders use **`hsl(var(--border))`** pattern.

### 10.2 Component-layer classes (`@layer components`)

| Class | Behavior |
|-------|----------|
| **`.cyber-card`** | Gradient card, `backdrop-filter: blur(10px)`, hover **lift** + `var(--glow-primary)` |
| **`.neon-button`** | `var(--gradient-primary)`, hover glow + `scale(1.05)` |
| **`.glow-text`** | Primary-colored text shadow |
| **`.cyber-border`** | Pseudo-element gradient border glow on hover |
| **`.fade-in` / `.slide-up`** | Tie to Tailwind **`animate-*`** utilities (defined in Career Tailwind config) |

### 10.3 Utility-layer (`@layer utilities`)

| Class | Behavior |
|-------|----------|
| **`.text-gradient`** | Gradient text via `background-clip: text` |
| **`.border-glow`** | Primary-tinted box-shadow ring |

### 10.4 Config

- **`src/View/Carrer/tailwind.config.ts`** — Career-specific **content paths**, **keyframes** (`fade-in`, `slide-up`), **theme extensions** — keep in sync when porting the Career app.

### 10.5 Component library pattern (Career only)

The Career app includes **shadcn-style** primitives under `View/Carrer/src/components/ui/`:

- **`class-variance-authority` (`cva`)** — variant props on **Button**, **Badge**, **Sheet**, **Toast**, **Toggle**, **Label**, **Alert**, **NavigationMenu**, **Sidebar** menu buttons, etc.
- **`clsx` + `tailwind-merge`** — combined in **`src/View/Carrer/src/lib/utils.ts`** as a **`cn()`** helper for conflict-safe class names.

This stack is **orthogonal** to Material Tailwind in the main app: Career builds UI from **CVA + tokens in `index.css`**, not from `@material-tailwind/react` components.

---

## 11. react-select — two official patterns in this project

| Variant | Location | Visual |
|---------|----------|--------|
| **Default** | `SearchReactSelect.jsx` | Flat border `#B3B3B3`, **no** shadow, minimal radius `5px`, gray selected row `#f3f4f6` |
| **PRC / brand** | `prcFormSelectStyles.js` | **Shadow** control, **`border-radius: 10px`**, selected **`#3DA5F4`**, focused **`#E3F1FF`**, hover **`#F0F8FF`**, **`zIndex` 9999–10000** on menu/portal |

**Porting:** Copy **one** object into the new project’s shared `selectStyles.ts` / `js` and import into both `Select` instances and wrapper components.

---

## 12. Porting this design system to another project (checklist)

Use this as a **recipe** — adjust package names if your stack differs (e.g. Next.js).

### 12.1 Dependencies (npm)

- **Tailwind CSS v4** + **`@tailwindcss/vite`** (or PostCSS equivalent for your bundler).
- **`@material-tailwind/react`** — wrap config with **`withMT`**.
- **Framer Motion**, **react-toastify**, **react-select** (if you use the same selects).
- **Fonts:** load **Poppins** (and optionally Inter/Urbanist) in HTML or `@import`.

### 12.2 Configuration files

1. Copy **`tailwind.config.js`** `theme.extend` block: **`colors`** (brand, semantic, legacy), **`fontFamily`**, **`boxShadow`** (`soft`, `card`, `card-hover`).
2. **`src/index.css`:** `@import "tailwindcss";` + `@config` path to your config.
3. **`withMT({ ... })`** — preserve Material Tailwind merge so **MT components** match Empleado.
4. **`Theme.js`** (or provider equivalent) — Material Tailwind **default theme** for drawers/overlays.

### 12.3 Global CSS to copy verbatim (or merge)

- **`@layer base`** — `body` (`bg-background text-customBlack-100 font-poppins`) + **heading** `h1`–`h6` scale.
- **Global** `* { font-family: Poppins !important; }` — only if you want **identical** font enforcement.
- **Scrollbar utilities:** `customScroll`, `scrollbarHidden`, `sideMenu`, `customDrwerScroll`, `employee-profile-*`.
- **Third-party:** `.react-calendar`, `.slider`, `.editorjs-*`, **overlay cleanup** rules for drawers.
- **Nav mobile:** `.navLinkCustom` / **Admin** variants.

### 12.4 Layout shell

- Replicate **`App.jsx`** structure: `flex flex-col h-screen`, header `z-50`, sidebar `lg` breakpoint + width `w-64` / `w-20`, main **`p-6 bg-background`** + **`customScroll`**.

### 12.5 Components to port as “design primitives”

- **`Header`** — Navbar + Badge + Motion dropdowns.
- **`SideMenu` / `SideMenuMobileView`** — desktop vs mobile **two dialects** (see §5.4–5.5).
- **`CustomDrawer`**, **`CustomCard`**, **`CustomButton`**, **`Toaster`**.
- **`SearchReactSelect`** + optional **`prcFormSelectStyles`**.

### 12.6 Optional / isolated

- **Career** subtree — copy **`tailwind.config.ts`** + **`index.css`** + **`App.css`** only if you port the Career module; it is **not** a drop-in with the main config alone.

### 12.7 Consistency recommendations

- Align **slider** and **calendar** active colors to **`#3DA5F4`** if you want a single brand blue (currently **`#3b82f6`** in CSS).
- Consolidate **`scrollbar-hide`** vs **`scrollbarHidden`** to **one** class name in the new project.

---

## 13. Appendix — Material Tailwind theme (`src/Theme/Theme.js`)

- **Drawer defaultProps:** `size: 300`, `placement: "left"`, `overlay: true`, **tween** transition **`duration: 0.4`**.
- **Drawer styles:** White drawer, **`z-[9999]`**, **`shadow-2xl shadow-blue-gray-900/10`**.
- **Overlay styles:** **`z-[9995]`**, **`bg-black`**, **`bg-opacity-60`**, **`backdrop-blur-xs`**.

---

*End of design system documentation.*
