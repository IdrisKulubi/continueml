# DESIGN.md - continueml Design System

## Brand Identity

### Vision Statement

continueml is the memory layer for AI creativity. Our design reflects **persistence, intelligence, and creative freedom** - bridging the gap between chaotic AI generation and consistent world-building.

### Design Principles

1. **Clarity over Complexity** - Information should be immediately scannable
2. **Trust through Transparency** - Show the AI's work, don't hide it
3. **Creative but Professional** - Inspire without overwhelming
4. **Memory-First** - Every design decision reinforces continuity

---

## Color System

### Primary Palette

#### Brand Colors

```css
/* Indigo - Primary Brand Color (Intelligence, Trust) */
--indigo-50: #eef2ff;
--indigo-100: #e0e7ff;
--indigo-200: #c7d2fe;
--indigo-300: #a5b4fc;
--indigo-400: #818cf8;
--indigo-500: #6366f1; /* PRIMARY */
--indigo-600: #4f46e5; /* MAIN INTERACTIVE */
--indigo-700: #4338ca;
--indigo-800: #3730a3;
--indigo-900: #312e81;

/* Purple - Secondary Accent (Creativity, Magic) */
--purple-50: #faf5ff;
--purple-100: #f3e8ff;
--purple-200: #e9d5ff;
--purple-300: #d8b4fe;
--purple-400: #c084fc;
--purple-500: #a855f7; /* SECONDARY */
--purple-600: #9333ea;
--purple-700: #7e22ce;
--purple-800: #6b21a8;
--purple-900: #581c87;
```

#### Functional Colors

```css
/* Success - Green (Consistency, Match, Approval) */
--green-50: #f0fdf4;
--green-100: #dcfce7;
--green-500: #22c55e; /* Success states */
--green-600: #16a34a; /* Success hover */
--green-700: #15803d;

/* Warning - Amber (Attention, Partial Match) */
--amber-50: #fffbeb;
--amber-100: #fef3c7;
--amber-500: #f59e0b; /* Warning states */
--amber-600: #d97706; /* Warning hover */
--amber-700: #b45309;

/* Error - Red (Mismatch, Danger) */
--red-50: #fef2f2;
--red-100: #fee2e2;
--red-500: #ef4444; /* Error states */
--red-600: #dc2626; /* Error hover */
--red-700: #b91c1c;

/* Info - Blue */
--blue-50: #eff6ff;
--blue-100: #dbeafe;
--blue-500: #3b82f6;
--blue-600: #2563eb;
--blue-700: #1d4ed8;
```

#### Neutral Palette

```css
/* Gray Scale */
--gray-50: #f9fafb; /* App background */
--gray-100: #f3f4f6; /* Card hover, secondary bg */
--gray-200: #e5e7eb; /* Borders, dividers */
--gray-300: #d1d5db; /* Disabled borders */
--gray-400: #9ca3af; /* Placeholder text */
--gray-500: #6b7280; /* Secondary text */
--gray-600: #4b5563; /* Primary text (light bg) */
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827; /* Primary text, headers */

/* True Black & White */
--black: #000000;
--white: #ffffff;
```

### Color Usage Guidelines

#### Backgrounds

```css
/* Page Background */
background: var(--gray-50);

/* Card/Panel Background */
background: var(--white);
border: 1px solid var(--gray-100);

/* Interactive Hover States */
background: var(--gray-50); /* Subtle hover */
background: var(--indigo-50); /* Branded hover */

/* Glass Effect (for overlays, badges) */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

#### Text Hierarchy

```css
/* Headings */
--text-heading: var(--gray-900);

/* Body Text */
--text-primary: var(--gray-700);
--text-secondary: var(--gray-500);
--text-tertiary: var(--gray-400);

/* Interactive */
--text-link: var(--indigo-600);
--text-link-hover: var(--indigo-700);
```

#### Entity Type Colors

Entities should have consistent color coding:

```css
/* Character - Blue */
--entity-character: #3b82f6;

/* Location - Purple */
--entity-location: #a855f7;

/* Object - Orange */
--entity-object: #f97316;

/* Style - Pink */
--entity-style: #ec4899;

/* Custom - Gray */
--entity-custom: #6b7280;
```

---

## Typography

### Font Family

```css
/* Primary Font Stack */
font-family:
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Roboto",
  "Helvetica Neue",
  Arial,
  sans-serif;

/* Monospace (for code, IDs, technical data) */
font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
```

### Type Scale

```css
/* Display */
--text-display: 3.5rem; /* 56px - Hero text */
--text-display-lh: 1.1;

/* Headings */
--text-h1: 2.25rem; /* 36px */
--text-h1-lh: 1.2;

--text-h2: 1.875rem; /* 30px */
--text-h2-lh: 1.3;

--text-h3: 1.5rem; /* 24px */
--text-h3-lh: 1.4;

--text-h4: 1.25rem; /* 20px */
--text-h4-lh: 1.5;

/* Body */
--text-base: 1rem; /* 16px - Default */
--text-base-lh: 1.6;

--text-sm: 0.875rem; /* 14px - Secondary text */
--text-sm-lh: 1.5;

--text-xs: 0.75rem; /* 12px - Captions, labels */
--text-xs-lh: 1.4;
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400; /* Body text */
--font-medium: 500; /* Emphasized text, buttons */
--font-semibold: 600; /* Subheadings */
--font-bold: 700; /* Headings, important text */
--font-extrabold: 800; /* Display text */
```

### Typography Usage Examples

```css
/* Page Title */
.page-title {
  font-size: var(--text-h1);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  line-height: var(--text-h1-lh);
}

/* Section Heading */
.section-heading {
  font-size: var(--text-h3);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}

/* Body Text */
.body-text {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  color: var(--gray-700);
  line-height: var(--text-base-lh);
}

/* Caption / Meta Info */
.caption {
  font-size: var(--text-sm);
  color: var(--gray-500);
}
```

---

## Spacing System

### Scale (Based on 4px base unit)

```css
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px - Base */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### Component Spacing Guidelines

```css
/* Card Padding */
padding: var(--space-6); /* 24px */

/* Button Padding */
padding: var(--space-3) var(--space-4); /* 12px 16px */

/* Section Margins */
margin-bottom: var(--space-8); /* 32px */

/* Grid Gaps */
gap: var(--space-6); /* 24px between cards */

/* Input Padding */
padding: var(--space-3) var(--space-4); /* 12px 16px */
```

---

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem; /* 4px - Small elements */
--radius-md: 0.5rem; /* 8px - Buttons, inputs */
--radius-lg: 0.75rem; /* 12px - Cards */
--radius-xl: 1rem; /* 16px - Large cards */
--radius-2xl: 1.5rem; /* 24px - Hero sections */
--radius-full: 9999px; /* Fully rounded (pills, avatars) */
```

### Usage

- **Buttons**: `--radius-md` (8px)
- **Input Fields**: `--radius-md` (8px)
- **Cards**: `--radius-xl` (16px)
- **Modal/Panels**: `--radius-xl` (16px)
- **Badges/Tags**: `--radius-full` (pill shape)
- **Avatars**: `--radius-full` (circle)

---

## Shadows

```css
/* Shadow Scale */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

/* Special Shadows */
--shadow-focus: 0 0 0 3px rgba(99, 102, 241, 0.2); /* Indigo focus ring */
--shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.2); /* Card hover */
```

### Usage

- **Cards (default)**: `--shadow-sm`
- **Cards (hover)**: `--shadow-hover`
- **Dropdowns/Modals**: `--shadow-lg`
- **Input Focus**: `--shadow-focus`
- **Floating Action Button**: `--shadow-xl`

---

## Component Design Patterns

### Buttons

#### Primary Button

```css
.btn-primary {
  background: var(--indigo-600);
  color: var(--white);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--indigo-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button

```css
.btn-secondary {
  background: var(--white);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
}

.btn-secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}
```

#### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: var(--indigo-600);
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-medium);
}

.btn-ghost:hover {
  background: var(--indigo-50);
}
```

### Cards

#### Standard Card

```css
.card {
  background: var(--white);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
```

#### Entity Card

```css
.entity-card {
  background: var(--white);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.entity-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--indigo-200);
}

/* Entity Card Image */
.entity-card-image {
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, var(--gray-700), var(--gray-900));
  position: relative;
}

/* Entity Type Badge */
.entity-type-badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--entity-character);
  color: var(--white);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}
```

### Inputs

#### Text Input

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--gray-900);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--indigo-500);
  box-shadow: var(--shadow-focus);
}

.input::placeholder {
  color: var(--gray-400);
}
```

#### Select Dropdown

```css
.select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--white);
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: var(--indigo-500);
  box-shadow: var(--shadow-focus);
}
```

### Badges & Tags

#### Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

/* Status Badges */
.badge-success {
  background: var(--green-100);
  color: var(--green-700);
}

.badge-warning {
  background: var(--amber-100);
  color: var(--amber-700);
}

.badge-error {
  background: var(--red-100);
  color: var(--red-700);
}

.badge-info {
  background: var(--blue-100);
  color: var(--blue-700);
}
```

#### Tag (for entity attributes)

```css
.tag {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
}
```

### Consistency Score Indicator

```css
.consistency-score {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

/* High Consistency (90-100%) */
.consistency-high {
  background: var(--green-50);
  color: var(--green-700);
}

.consistency-high::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-500);
}

/* Medium Consistency (70-89%) */
.consistency-medium {
  background: var(--amber-50);
  color: var(--amber-700);
}

.consistency-medium::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--amber-500);
}

/* Low Consistency (<70%) */
.consistency-low {
  background: var(--red-50);
  color: var(--red-700);
}

.consistency-low::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red-500);
}
```

---

## Layout Patterns

### Container Widths

```css
/* Max widths for content areas */
--container-sm: 640px; /* Single column content */
--container-md: 768px; /* Forms, narrow content */
--container-lg: 1024px; /* Default page width */
--container-xl: 1280px; /* Dashboard, wide content */
--container-2xl: 1536px; /* Maximum width */

/* Standard Container */
.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
}
```

### Grid Patterns

```css
/* Dashboard Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

/* Entity Grid */
.entity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}

/* Two Column Layout (Detail Pages) */
.two-column {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .two-column {
    grid-template-columns: 1fr;
  }
}
```

### Navigation

```css
/* Top Navigation */
.navbar {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-4) var(--space-6);
  position: sticky;
  top: 0;
  z-index: 50;
}

/* Sidebar Navigation */
.sidebar {
  width: 280px;
  background: var(--white);
  border-right: 1px solid var(--gray-200);
  padding: var(--space-6);
  height: 100vh;
  position: sticky;
  top: 0;
}
```

---

## Gradients

### Brand Gradients

```css
/* Primary Gradient (Indigo to Purple) */
background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);

/* Hero Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Card Accent Gradients */
.gradient-purple {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
}

.gradient-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}

.gradient-amber {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.gradient-slate {
  background: linear-gradient(135deg, #475569 0%, #1e293b 100%);
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Animations & Transitions

### Standard Transitions

```css
/* Default transition for interactive elements */
transition: all 0.2s ease;

/* Hover lift effect */
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* Fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease forwards;
}

/* Pulse (for loading states) */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Spin (for loading spinners) */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}
```

### Micro-interactions

```css
/* Button press */
.btn:active {
  transform: scale(0.98);
}

/* Checkbox/Toggle */
.toggle {
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.toggle:checked {
  background-color: var(--indigo-600);
}

/* Progress bar fill */
.progress-bar {
  transition: width 0.5s ease;
}
```

---

## Iconography

### Icon Guidelines

- **Size Scale**: 16px, 20px, 24px, 32px
- **Stroke Width**: 2px (standard), 1.5px (thin), 2.5px (bold)
- **Style**: Outline/stroke icons (use Lucide React or Heroicons)
- **Color**: Match text color or use brand colors for emphasis

```css
/* Icon Sizes */
.icon-sm {
  width: 16px;
  height: 16px;
}
.icon-md {
  width: 20px;
  height: 20px;
}
.icon-lg {
  width: 24px;
  height: 24px;
}
.icon-xl {
  width: 32px;
  height: 32px;
}

/* Icon in Button */
.btn-with-icon {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
```

### Common Icons Map

```
- Lightning bolt: Generation/AI action
- Eye: View/Preview
- Sparkles: AI enhancement
- Branch: Version control/Branches
- Target: Consistency check
- Image: Entity/Media
- Users: Characters
- Map Pin: Locations
- Cube: Objects
- Palette: Style
- Clock: History/Time
- Settings: Configuration
- Download: Export
- Upload: Import
- Plus: Add new
- X: Close/Remove
- Check: Success/Confirm
- Alert Triangle: Warning
- Alert Circle: Error
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base: 0-639px (Mobile) */

/* Small (sm): 640px+ (Large mobile/Small tablet) */
@media (min-width: 640px) {
}

/* Medium (md): 768px+ (Tablet) */
@media (min-width: 768px) {
}

/* Large (lg): 1024px+ (Desktop) */
@media (min-width: 1024px) {
}

/* Extra Large (xl): 1280px+ (Large desktop) */
@media (min-width: 1280px) {
}

/* 2X Large (2xl): 1536px+ (Wide screen) */
@media (min-width: 1536px) {
}
```

### Mobile Adaptations

```css
/* Stack grids on mobile */
@media (max-width: 768px) {
  .entity-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Hide sidebar, show hamburger menu */
  .sidebar {
    display: none;
  }

  /* Reduce padding */
  .container {
    padding: 0 var(--space-4);
  }
}
```

---

## Special UI Elements

### Loading States

#### Skeleton Loader

```css
.skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

#### Spinner

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--indigo-600);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### Empty States

```css
.empty-state {
  text-align: center;
  padding: var(--space-16);
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  color: var(--gray-300);
}

.empty-state-title {
  font-size: var(--text-h4);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--gray-500);
  margin-bottom: var(--space-6);
}
```

### Toasts/Notifications

```css
.toast {
  min-width: 320px;
  padding: var(--space-4);
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--gray-200);
  display: flex;
  align-items: start;
  gap: var(--space-3);
}

.toast-success {
  border-left: 4px solid var(--green-500);
}

.toast-error {
  border-left: 4px solid var(--red-500);
}

.toast-warning {
  border-left: 4px solid var(--amber-500);
}

.toast-info {
  border-left: 4px solid var(--blue-500);
}
```

---

## Accessibility

### Focus States

```css
*:focus-visible {
  outline: 2px solid var(--indigo-500);
  outline-offset: 2px;
}

/* For dark backgrounds */
.dark *:focus-visible {
  outline-color: var(--indigo-400);
}
```

### ARIA Live Regions

- Use `aria-live="polite"` for status updates (generation complete)
- Use `aria-live="assertive"` for errors
- Always include `role` attributes on custom components

### Color Contrast

All text must meet WCAG AA standards:

- **Normal text**: 4.5:1 contrast ratio
- **Large text** (18px+): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

### Screen Reader Text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Dark Mode (Future Enhancement)

```css
/* Dark Mode Variables */
:root[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;

  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;

  --border: #334155;
  --border-hover: #475569;
}
```

---

## Design Checklist for Components

When designing a new component, ensure:

- [ ] Uses design system colors
- [ ] Follows spacing scale (4px base)
- [ ] Has hover/focus/active states
- [ ] Has loading state
- [ ] Has error state
- [ ] Has empty state
- [ ] Is responsive (mobile-first)
- [ ] Meets accessibility standards
- [ ] Uses consistent border radius
- [ ] Uses appropriate shadows
- [ ] Has smooth transitions (0.2-0.3s)
- [ ] Uses semantic HTML
- [ ] Includes appropriate ARIA labels

---

## Design Tools & Resources

### Figma Setup

1. Install Inter font
2. Import color variables from this doc
3. Create component library with buttons, cards, inputs
4. Set up 4px grid

### Development Setup

```bash
# Tailwind CSS already includes these patterns
# Custom CSS variables in globals.css

:root {
  --indigo-600: #4f46e5;
  --purple-600: #9333ea;
  /* ... rest of variables */
}
```

---

## Brand Assets

### Logo Usage

- **Primary Logo**: "continueml" in gradient text (indigo to purple)
- **Logo Mark**: Abstract memory wave symbol (TBD)
- **Minimum Size**: 120px width for logo
- **Clear Space**: Equal to height of "C" in logo

### Brand Voice

- **Tone**: Intelligent, confident, empowering
- **Language**: Clear, concise, avoids jargon
- **Personality**: Professional but creative, trustworthy but innovative

---
