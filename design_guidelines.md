# Push Notification Management Platform - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from OneSignal and Mailchimp's dashboard interfaces, combined with modern SaaS dashboard patterns from Linear and Notion. This platform prioritizes data clarity, efficient workflows, and intuitive campaign management.

**Core Principles**:
- Information density balanced with breathing room
- Workflow-optimized layouts that minimize clicks
- Real-time preview integration throughout
- Clear visual hierarchy for complex data structures

---

## Typography System

**Font Stack**: Inter (primary), SF Pro Display (headings), Roboto (data tables)

**Hierarchy**:
- Dashboard Headers: 2xl (24px), font-semibold, tracking-tight
- Page Titles: xl (20px), font-semibold  
- Section Headers: lg (18px), font-medium
- Card Titles: base (16px), font-medium
- Body Text: sm (14px), font-normal
- Data Tables: sm (14px), font-normal, tabular-nums
- Labels/Meta: xs (12px), font-medium, uppercase tracking-wide
- Stats/Metrics: 3xl-4xl (30-36px), font-bold, tabular-nums

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16 consistently
- Component padding: p-4 to p-6
- Card spacing: p-6 to p-8  
- Section margins: mb-8 to mb-12
- Grid gaps: gap-4 to gap-6

**Dashboard Structure**:
- Fixed sidebar: w-64 with dark background treatment
- Main content area: flex-1 with max-w-7xl container
- Top navigation bar: h-16 with breadcrumbs and user menu
- Content padding: p-8 for main area, p-6 for cards

**Grid Patterns**:
- Stats overview: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Campaign cards: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3
- Analytics widgets: grid-cols-1 lg:grid-cols-2
- Data tables: Full width with horizontal scroll on mobile

---

## Component Library

### Navigation
**Sidebar Navigation**:
- Logo at top (h-16, p-4)
- Navigation items with icons (h-10, px-4, rounded-lg)
- Active state: Background treatment, border-l-4 accent
- Grouped sections with dividers
- Collapsed state on mobile with overlay

**Top Bar**:
- Breadcrumb navigation (left-aligned)
- Quick actions dropdown (center)
- Notifications bell + user avatar menu (right-aligned)
- Search command palette trigger (⌘K shortcut)

### Dashboard Cards
**Standard Card Pattern**:
- Rounded corners: rounded-xl
- Border treatment: border with subtle shadow
- Header section: px-6 py-4 with border-b
- Content padding: p-6
- Footer actions: px-6 py-4 with border-t (when needed)

**Widget Variations**:
- **Stat Cards**: Large metric display, trend indicator, sparkline chart
- **List Cards**: Scrollable list with avatar/icon, title, meta, action menu
- **Chart Cards**: Header with timeframe selector, full-width chart area
- **Preview Cards**: Split layout - controls left, live preview right

### Campaign Builder
**Multi-Step Layout**:
- Progress stepper at top showing 4 steps (Content → Schedule → Target → Review)
- Left panel (w-2/3): Form inputs and rich text editor
- Right panel (w-1/3): Fixed live notification preview that updates in real-time
- Navigation: Back/Next buttons at bottom, Save Draft in header

**Form Elements**:
- Input fields: h-10, px-4, rounded-lg with focus ring
- Text areas: min-h-32, p-4
- Select dropdowns: Custom styled with chevron icon
- Toggle switches for features (sound, badge, etc.)
- Icon picker: Grid of selectable icons with search

### Data Tables
**Structure**:
- Sticky header row with sort indicators
- Row height: h-14 for comfortable scanning
- Zebra striping for alternate rows
- Hover state: Subtle background change
- Checkbox column (w-12), expandable actions menu (w-10)
- Pagination controls at bottom with items-per-page selector

**Table Features**:
- Column resize handles
- Filter dropdowns in header cells
- Bulk action bar appears when items selected
- Empty state with illustration and CTA

### Analytics Dashboard
**Chart Components**:
- Line charts for delivery/engagement trends over time
- Donut charts for browser/device distribution
- Bar charts for campaign performance comparison
- Real-time counter animations for key metrics

**Layout**:
- Top row: 4 stat cards (total subscribers, delivered, clicked, CTR)
- Second row: Large line chart (full width, h-96)
- Third row: 2-column grid (browser breakdown + top campaigns table)

### Modals & Overlays
**Modal Pattern**:
- Centered overlay: max-w-2xl for forms, max-w-4xl for complex workflows
- Header: px-6 py-4 with title and close button
- Content: px-6 py-4 with max-h-[70vh] overflow-y-auto
- Footer: px-6 py-4 with action buttons (right-aligned)

**Slide-over Panel**:
- Fixed right side: w-96 to w-1/3
- Used for subscriber details, notification preview, settings
- Close on overlay click or escape key

### Subscriber Management
**List View**:
- Filterable table with search bar
- Quick filters: Browser type, status (active/inactive), segments
- Bulk actions: Add to segment, send notification, export CSV
- Row expansion shows subscription details and notification history

**Subscriber Card**:
- Avatar/browser icon + name/email
- Subscription date and last active timestamp
- Tags for segments (pill-shaped, dismissible)
- Activity timeline showing notifications received

---

## Images

**Dashboard Imagery**:
- **Empty States**: Custom illustrations (400x300px) for zero-data states (e.g., "No campaigns yet", "No subscribers")
- **Notification Previews**: Mock device screenshots showing how notifications appear on Chrome/Firefox/Safari
- **Onboarding**: Step-by-step screenshots during setup wizard
- **Icon Assets**: Use Heroicons for all UI icons (outline style for navigation, solid for emphasis)

**No Hero Section**: This is a dashboard application, not a marketing site. The main interface loads directly into the functional workspace.

---

## Responsive Behavior

**Breakpoints**:
- Mobile (< 768px): Stack all columns, hide sidebar (hamburger menu), simplified tables
- Tablet (768-1024px): 2-column grids, collapsible sidebar
- Desktop (> 1024px): Full layout with fixed sidebar, 3-4 column grids

**Mobile Optimizations**:
- Bottom navigation bar for main actions
- Swipeable cards for campaign browsing
- Simplified form layouts (single column)
- Sheet-style modals instead of centered overlays

---

## Interaction Patterns

**Loading States**:
- Skeleton screens for data tables and cards
- Progress bars for campaign sending status
- Inline spinners for button actions

**Feedback**:
- Toast notifications (top-right) for success/error messages
- Inline validation for forms (real-time)
- Confirmation modals for destructive actions

**Animations**: Minimal, performance-focused
- Fade-in for page transitions (150ms)
- Slide-in for sidebar/panels (200ms)
- No scroll-triggered animations
- Smooth number counter for metrics

---

## Special Features

**Notification Preview Panel**:
- Fixed position in campaign builder
- Device selector tabs (Desktop/Mobile, Chrome/Firefox/Safari)
- Real-time rendering as user types
- Background selector (light/dark mode preview)

**RSS Feed Integration Section**:
- URL input with validation and preview
- Feed item list showing recent entries
- Auto-notification toggle per feed
- Template configuration for automated messages

**A/B Testing Interface**:
- Side-by-side variant comparison
- Traffic split slider (0-100%)
- Win metric selector
- Results dashboard with statistical significance indicator

This design creates a professional, data-rich dashboard that prioritizes usability and workflow efficiency while maintaining visual polish throughout the experience.