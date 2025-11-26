# Smart Wallet Guardian

## Overview

Smart Wallet Guardian is a blockchain security application built for the Polygon network that provides real-time transaction analysis and threat detection for cryptocurrency wallets. The application uses advanced risk scoring algorithms to analyze smart contract interactions, detect phishing attempts, and identify malicious patterns before transactions are executed. It features a comprehensive dashboard for monitoring wallet security, viewing transaction history, managing security alerts, and configuring protection settings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design follows Material Design principles with influences from Linear and Stripe, emphasizing trust, clarity, and instant risk recognition.

**State Management**: TanStack Query (React Query) for server state management with optimistic updates and automatic cache invalidation. Client-side state is managed through React hooks and context providers.

**Routing**: Wouter for lightweight client-side routing with dedicated pages for:
- Landing page (public)
- Dashboard (protected)
- Transaction history (protected)
- Alerts management (protected)
- Settings (protected)

**Design System**: Custom theme system supporting light/dark modes with CSS variables. Typography uses Inter for UI elements and JetBrains Mono for monospace data (addresses, hashes). Spacing follows Tailwind's unit system (2, 4, 8, 12, 16) for consistency.

**Layout Pattern**: Dashboard layout uses a collapsible sidebar navigation with responsive header containing wallet connection and theme toggle controls. Main content area is constrained to max-width of 7xl with automatic centering.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript

**API Design**: RESTful endpoints organized by resource:
- `/api/transactions` - Transaction analysis and management
- `/api/stats` - Wallet statistics and metrics
- `/api/alerts` - Security alerts CRUD operations

**Development vs Production**: Separate entry points (`index-dev.ts`, `index-prod.ts`) with Vite integration for development HMR and static file serving for production builds.

**Data Storage**: In-memory storage implementation (`MemStorage` class) providing seed data for development. Schema is defined for future PostgreSQL integration using Drizzle ORM.

**Security Analysis Engine**: Multi-layered threat detection system:
- Smart contract bytecode analysis for honeypot, drainer, and rug pull patterns
- Phishing domain detection against known scam databases
- Advanced risk scoring algorithms
- Transaction parameter validation and sanitization

### Data Models

**Core Entities**:
- `TransactionAnalysis`: Complete transaction data with risk scoring, AI reasoning, threat indicators, and contract analysis
- `WalletStats`: Aggregated metrics including total transactions, blocked count, average risk score, threat detection rate
- `ContractAnalysis`: Smart contract inspection results with pattern detection flags
- `Alert`: Security notifications with type classification, read status, and transaction association

**Risk Levels**: Three-tier classification (safe, medium, high) used consistently across UI components for visual hierarchy and user decision-making.

### Blockchain Integration

**Wallet Connection**: MetaMask integration via Web3 window.ethereum provider with support for:
- Account connection/disconnection
- Network detection (Polygon mainnet/testnet)
- Chain switching functionality
- Address truncation utilities

**Network Support**: Primary focus on Polygon (chain ID 137) with testnet support (chain ID 80001). UI displays prominent warnings for incorrect network connections.

## External Dependencies

### Third-Party Services

**Risk Analysis Engine**: Optional enhanced analysis services can be configured for more detailed transaction risk analysis and reasoning generation.

**Database**: PostgreSQL via Neon serverless driver configured in `drizzle.config.ts`. Schema migrations managed through Drizzle Kit with output directory `./migrations`.

### UI Libraries

**Component Framework**: Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, tooltips, etc.)

**Styling**: Tailwind CSS with custom configuration extending the New York variant from shadcn/ui. Uses CSS variables for theming with HSL color space.

**Utilities**:
- `class-variance-authority` for component variant management
- `date-fns` for date formatting and relative time display
- `embla-carousel-react` for carousel functionality
- `lucide-react` for icon system

### Development Tools

**Build System**: Vite with plugins for:
- React fast refresh
- Runtime error overlay (Replit-specific)
- Cartographer code navigation (Replit development)
- Dev banner (Replit development)

**Type Safety**: TypeScript with strict mode enabled, path aliases configured for clean imports (@/, @shared/, @assets/)

**Code Quality**: ESM module system throughout, no-emit TypeScript checking, bundler module resolution

### Session Management

**Connect-pg-simple**: PostgreSQL session store for Express sessions (configured but implementation depends on database provisioning)