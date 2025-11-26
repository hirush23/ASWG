# AI Smart Wallet Guardian - Design Guidelines

## Design Approach

**Selected Framework**: Design System Approach using **Material Design** principles with influences from Linear's clarity and Stripe's trust-focused interface.

**Rationale**: Security dashboards demand immediate comprehension, clear visual hierarchy for risk levels, and consistent patterns users can trust. Material Design provides robust guidelines for data-heavy interfaces with strong visual feedback systems - essential for communicating transaction risk in real-time.

**Core Principles**:
- **Trust Through Clarity**: Every element reinforces security and transparency
- **Instant Risk Recognition**: Visual hierarchy that makes danger levels unmistakable
- **Information Density**: Maximum insight without cognitive overload
- **Purposeful Motion**: Subtle animations only for critical state changes

---

## Typography

**Font Stack**: Inter (via Google Fonts CDN)
- **Hero/Headers**: 700 weight, 2.5rem to 4rem (scale down to 2rem mobile)
- **Section Titles**: 600 weight, 1.5rem to 2rem
- **Body Text**: 400 weight, 1rem (dashboard content)
- **Data/Metrics**: 500 weight, 0.875rem to 1.125rem (transaction details)
- **Micro Labels**: 500 weight, 0.75rem (status badges, timestamps)
- **Monospace Data**: JetBrains Mono 400 weight for addresses, hashes, contract codes

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** consistently
- Component padding: `p-4` to `p-8`
- Section spacing: `space-y-8` to `space-y-12`
- Card gaps: `gap-4`
- Container margins: `mx-4` mobile, `mx-8` desktop

**Grid Structure**:
- Main dashboard: Sidebar (256px fixed) + Content area (flex-1)
- Transaction cards: Single column mobile, 2-column on md:, 3-column on xl:
- Metric panels: 2x2 grid on mobile, 4-column on desktop (grid-cols-4)

**Container Widths**:
- Dashboard content: `max-w-7xl mx-auto`
- Modal content: `max-w-2xl`
- Full-width panels: `w-full` with inner padding

---

## Component Library

### Navigation
**Top Bar**: Fixed header with wallet connection status, network indicator (Polygon logo), user address (truncated), disconnect button
**Sidebar**: Collapsed on mobile (hamburger), expanded on desktop with navigation items: Dashboard, Transaction History, Settings, Documentation

### Data Display

**Transaction Card**:
- Risk badge (prominent, top-right corner with blur backdrop when over images)
- Transaction type icon (left, 40x40px circle)
- Destination address (truncated with copy button)
- Amount and token symbol (large, bold)
- AI risk explanation (2-3 line summary, expandable)
- Timestamp (relative, e.g., "2 mins ago")
- Action buttons: "View Details" or "Block/Approve" pair

**Risk Score Indicator**:
- Circular progress ring (96px diameter) showing 0-100 score
- Large numerical score in center (2.5rem)
- Label beneath ("High Risk" / "Medium Risk" / "Safe")
- Positioned prominently in transaction cards and detail modals

**Metrics Dashboard (4 Cards)**:
- Total Transactions Scanned
- Threats Blocked
- Average Risk Score
- Active Protections
Each with large number (3rem), icon, and trend indicator

### Forms & Controls

**Wallet Connection**: 
- Prominent button with wallet icon, "Connect Wallet" text
- Shows connected state with truncated address and network badge
- Blur background when overlaid on hero image

**Transaction Approval Interface**:
- Two-column layout: Risk analysis (left) + Action panel (right)
- AI reasoning displayed in structured format with bullet points
- "Approve Transaction" (success style) and "Block & Report" (danger style) buttons
- "View Full Analysis" expandable accordion

### Overlays

**Risk Detail Modal**:
- Full screen on mobile, centered large modal on desktop (max-w-3xl)
- Header with risk score badge and transaction hash
- Tabbed content: Overview, Contract Analysis, AI Reasoning, Transaction Data
- Scrollable content area with sticky header
- Close button (top-right) and action footer (sticky bottom)

**Phishing Alert Toast**:
- Slide in from top-right
- Critical alert styling with icon
- Auto-dismiss after 10s or manual close
- Stacks multiple alerts vertically with gap-2

---

## Animations

**Minimal & Purposeful Only**:
- Risk score counter: Animated count-up on load (1s duration)
- Transaction card entry: Subtle fade-in when new transactions appear
- Status badge pulse: Gentle 2s pulse for "Analyzing..." state
- No hover animations on cards
- No scroll-triggered effects
- No decorative motions

---

## Images

**Hero Section Image**:
- Abstract digital security visualization (network nodes, shield motifs, blockchain grid patterns)
- Dimensions: Full-width, 60vh on desktop, 40vh on mobile
- Overlay: Dark gradient (bottom to top, 70% to 20% opacity) for text readability
- CTA buttons on hero use blur backdrop (backdrop-blur-md) with semi-transparent backgrounds

**Dashboard Placeholder Icons**:
- Use Heroicons library (via CDN)
- 24px standard size, 40px for transaction type icons
- Relevant icons: shield-check, exclamation-triangle, clock, check-circle, x-circle, document-text

**No Photography**: Entirely icon and illustration-based interface for clean, professional security aesthetic

---

## Page Structure

### Landing Page (Marketing)
1. **Hero Section** (60vh): "Protect Your Web3 Wallet with AI" + description + CTA buttons over abstract security image
2. **How It Works** (3 columns): Real-time Scanning, AI Analysis, Instant Protection
3. **Key Features** (4 feature cards with icons): Smart Contract Analysis, Phishing Detection, Transaction Scoring, Auto-Block
4. **Trust Indicators** (2 columns): Transactions Protected metric + Active Users
5. **Integration** (centered): Polygon logo showcase, "Built on Polygon PoS" badge
6. **CTA Section**: "Start Protecting Your Wallet Today" with demo button
7. **Footer**: Links (Docs, GitHub, Twitter), Polygon attribution

### Dashboard Application
- Clean utility interface with sidebar navigation
- Main content: Metrics overview (4 cards) + Live transaction feed (scrollable cards)
- No forced viewport heights - natural content flow
- Sticky header for persistent wallet status