# SkoolZoom Design Guidelines

## Design Approach

**Selected Approach**: Design System-Based (Professional Admin Interface)

**Rationale**: SkoolZoom is a utility-focused, information-dense school management system requiring consistency across 14+ modules. The priority is efficiency, learnability, and data management over visual creativity.

**Primary Inspiration**: Modern SaaS admin dashboards (Linear, Notion, Vercel Dashboard) combined with Material Design principles for enterprise applications.

**Key Principles**:
- Consistency across all modules
- Information hierarchy and scannability
- Efficient data entry and navigation
- Professional, trustworthy aesthetic
- Module-specific visual identification

---

## Core Design Elements

### A. Typography

**Font Family**: 
- Primary: Inter (via Google Fonts CDN) - all UI text
- Monospace: JetBrains Mono - for codes, IDs, numbers

**Typography Scale**:
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base font-normal (16px)
- Table Headers: text-sm font-medium uppercase tracking-wide (14px)
- Labels/Captions: text-sm font-medium (14px)
- Table Data: text-sm font-normal (14px)
- Metadata/Timestamps: text-xs (12px)

---

### B. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** consistently
- Tight spacing: p-2, gap-2
- Default spacing: p-4, gap-4, mb-6
- Section spacing: p-6, p-8, mb-8
- Page margins: p-8, p-12
- Large gaps: gap-12, gap-16

**Grid System**:
- Sidebar: Fixed width 240px (w-60)
- Main Content: Remaining width with max-w-7xl container
- Dashboard Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Data Tables: Full width within container
- Forms: Two-column layout on desktop (grid-cols-1 md:grid-cols-2 gap-6)

---

### C. Component Library

#### Navigation & Layout

**Sidebar Navigation**:
- Fixed left sidebar (240px wide, full height)
- Module logo/name at top with icon
- Navigation items with icons (Heroicons) and labels
- Active state: background highlight with left border accent
- Hover state: subtle background change
- Logout at bottom, separated by divider
- Collapsible on mobile (hamburger menu)

**Top Bar**:
- Module name/breadcrumb on left
- User profile dropdown on right (avatar, name, role)
- Search bar in center (when applicable)
- Height: 64px (h-16)

#### Dashboard Components

**Metric Cards**:
- Rounded corners (rounded-lg)
- Shadow: shadow-sm with hover:shadow-md transition
- Padding: p-6
- Layout: Icon top-left, metric value (text-3xl font-bold), label (text-sm), optional trend indicator
- Border: subtle border on all cards

**Data Tables**:
- Striped rows for better readability
- Sticky header (position-sticky top-0)
- Hover state on rows
- Action buttons (View/Edit/Delete) aligned right, icon-based
- Search bar above table (w-full md:w-96)
- Filters as dropdown buttons or pill buttons
- Pagination at bottom (showing "1-10 of 234" format)
- Checkbox column for bulk actions when needed

**Forms**:
- Input fields: Full-width, border, rounded-md, px-4 py-2
- Labels: Above inputs, font-medium, mb-2
- Required fields: Red asterisk
- Field groups: Organized in sections with section headers
- Form sections: Separated by border-t and mt-8 pt-6
- Action buttons: Right-aligned, Save (primary) + Cancel (secondary)
- Validation errors: Red text below field with icon

#### Interactive Elements

**Buttons**:
- Primary: Solid background, rounded-md, px-4 py-2, font-medium
- Secondary: Border style, same dimensions
- Icon buttons: p-2, rounded-md
- Sizes: Small (px-3 py-1.5 text-sm), Default (px-4 py-2), Large (px-6 py-3)

**Badges/Status Indicators**:
- Pill-shaped (rounded-full)
- Small text (text-xs)
- Padding: px-2.5 py-0.5
- Different colors for status types (Active, Pending, Paid, Unpaid, etc.)

**Modals/Dialogs**:
- Overlay: Semi-transparent dark backdrop
- Modal: Centered, max-w-2xl, rounded-lg, shadow-xl
- Header with title and close button
- Content area with appropriate padding
- Footer with action buttons (right-aligned)

**Tabs**:
- Horizontal tab list with border-b
- Active tab: Border-b accent, font-medium
- Inactive tabs: Hover state
- Tab panels: pt-6

#### Data Visualization

**Profile Views**:
- Two-column layout: Left sidebar (photo, basic info), Right content (tabs with detailed info)
- Info rows: Label (font-medium) + Value pairs in grid
- Section dividers with headers

**Date/Time Pickers**: 
- Use HTML5 date/time inputs with custom styling
- Calendar icon as visual indicator

**Grid/Calendar Views** (for Timetable):
- Header row: Days of week
- Left column: Period/time slots
- Grid cells: Subject + Teacher name, hover highlight
- Cells: border, p-2, min-height for readability

---

### D. Module Differentiation

Each module uses a distinct accent color applied to:
- Sidebar active state left border
- Primary buttons
- Links and interactive elements
- Module header/logo area

**Suggested Module Colors**:
- Student: Blue
- HR/Staff: Purple
- Fee: Green
- Payroll: Teal
- Finance: Indigo
- Attendance: Orange
- Timetable: Pink
- Date Sheet: Red
- Curriculum: Violet
- POS: Emerald
- Library: Amber
- Transport: Cyan
- Hostel: Lime

---

### E. Icons

**Icon Library**: Heroicons (via CDN) exclusively
- Use outline style for navigation and actions
- Use solid style for status indicators and badges
- Size: w-5 h-5 for most UI elements, w-6 h-6 for larger contexts

---

## Login Pages

**Layout**: Centered card on full-height page
- Card: max-w-md, centered, shadow-lg, p-8
- Logo/module name at top
- Form fields: Email, Password with appropriate input types
- "Remember me" checkbox
- Primary login button (full-width)
- No background images - clean, professional solid background

---

## Animations

**Minimal Animations Only**:
- Hover transitions on cards/buttons: transition-all duration-200
- Modal fade-in: fade and scale effect
- Dropdown menus: slide-down effect
- No page transitions, parallax, or decorative animations

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (single column, hamburger menu)
- Tablet: 768px - 1024px (some two-column layouts)
- Desktop: > 1024px (full layouts)

**Mobile Adaptations**:
- Sidebar becomes drawer/overlay
- Dashboard cards stack vertically
- Tables become horizontally scrollable or card-based list
- Two-column forms become single column