# Smart Wallet Guardian

A blockchain security application for the Polygon network that provides real-time transaction analysis and threat detection for cryptocurrency wallets.

## Overview

Smart Wallet Guardian helps protect your crypto assets from scams, phishing attempts, and malicious smart contracts by analyzing transactions before they're executed. The application uses advanced risk scoring algorithms to evaluate smart contract bytecode, detect suspicious patterns, and provide detailed threat analysis.

## Features

- **Smart Contract Analysis**: Deep bytecode analysis detects honeypots, drainers, and rug pull patterns
- **Phishing Detection**: Real-time URL and domain checking against known scam databases
- **Risk Scoring**: Advanced risk scoring from 0-100 with detailed reasoning for every transaction
- **Auto-Block Protection**: Automatically block high-risk transactions with configurable settings
- **Transaction History**: Complete history of all analyzed transactions with status tracking
- **Security Alerts**: Real-time notifications for detected threats and security events
- **Multi-Wallet Support**: Connect MetaMask, Trust Wallet, or Coinbase Wallet

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** components built on Radix UI
- **TanStack Query** for server state management
- **Wouter** for client-side routing

### Backend
- **Express.js** with TypeScript
- **Netlify Functions** for serverless deployment
- **Drizzle ORM** for database operations (optional PostgreSQL)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- A Web3 wallet (MetaMask, Trust Wallet, or Coinbase Wallet)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/smart-wallet-guardian.git
cd smart-wallet-guardian
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
# Optional: Database connection (for persistent storage)
DATABASE_URL=postgresql://...

# Optional: OpenAI API key (for enhanced analysis)
OPENAI_API_KEY=sk-...
```

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
3. Deploy!

The project includes a `netlify.toml` configuration file that handles:
- Serverless functions for the API
- SPA redirects for client-side routing
- Security headers

### Manual Build

```bash
# Build for production
npm run build

# The output will be in the dist/ directory
# - dist/public/ contains the frontend
# - dist/index.js contains the backend
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and hooks
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
├── server/                 # Backend Express application
│   ├── routes.ts           # API route handlers
│   ├── storage.ts          # Data storage layer
│   └── app.ts              # Express app configuration
├── shared/                 # Shared types and schemas
├── netlify/                # Netlify serverless functions
│   └── functions/          # API function handlers
└── attached_assets/        # Images and static files
```

## API Endpoints

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/analyze` - Analyze a new transaction
- `POST /api/transactions/:id/approve` - Approve a transaction
- `POST /api/transactions/:id/block` - Block a transaction

### Phishing
- `POST /api/phishing/check` - Check URL for phishing

### Alerts
- `GET /api/alerts` - List all alerts
- `POST /api/alerts/:id/read` - Mark alert as read
- `POST /api/alerts/read-all` - Mark all alerts as read
- `DELETE /api/alerts/:id` - Delete an alert

### Stats
- `GET /api/stats` - Get wallet statistics

## Risk Score Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| Safe | 0-39 | No significant threats detected |
| Medium | 40-69 | Some risk indicators present, review recommended |
| High | 70-100 | Significant threats detected, blocking recommended |

## Threat Detection

The application detects various threat patterns:

### Honeypot Patterns
- `onlyOwner` restrictions
- Blacklist mechanisms
- Hidden functions

### Drainer Patterns
- Token approval requests
- `transferFrom` operations
- `setApprovalForAll` calls

### Rug Pull Patterns
- Mint functions
- Tax/fee setters
- Ownership renunciation

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Brave

## Security Considerations

- Private keys are never stored or transmitted
- All wallet interactions happen client-side
- Transaction data is analyzed but not permanently stored
- Security headers protect against common web vulnerabilities

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact support@smartwalletguardian.com.

## Disclaimer

Smart Wallet Guardian is a security tool designed to help identify potential risks in blockchain transactions. While it provides valuable analysis, it should not be considered a guarantee of transaction safety. Always do your own research and exercise caution when interacting with smart contracts.
