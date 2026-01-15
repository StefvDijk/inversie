# Inversie

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/StefvDijk/inversie)

A revolutionary mobile-first app for the Dutch bewindvoering (financial guardianship) sector that empowers vulnerable individuals with autonomy, financial insight, and genuine connection to their bewindvoerder.

## Overview

Inversie functions as a "Real-time Life Coach" combining hard financial data with soft, pedagogical functions like guided decision-making, reflection, and personal development tools. Instead of treating clients as passive recipients, the app gives vulnerable individuals (including those with mild intellectual disabilities - LVB) the tools to understand and participate in their financial lives.

## Core Features

- **Beslis-Protocol**: Guided decision-making with reflection
- **Potjes System**: Virtual budget categories with visual progress
- **Lees Simpel**: AI-powered document translation to simple language
- **Geld Verzoek**: Money requests with photo context
- **Transacties**: Read-only transaction overview
- **Spaardoelen**: Visual savings goals with celebration
- **Toolbox Surveys**: Periodic autonomy and wellbeing check-ins
- **Agenda**: Calendar integration and appointment booking

## Tech Stack

### Frontend
- React Native (Expo)
- NativeWind (TailwindCSS for React Native)
- Zustand (state management)
- React Navigation
- React Hook Form

### Backend
- Node.js with Express
- SQLite (development) / PostgreSQL (production)
- Prisma ORM
- OpenAI API (document translation)
- Google Calendar & Microsoft Graph API

## Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI
- SQLite3
- OpenAI API key (for Lees Simpel feature)
- Google/Microsoft API credentials (for calendar integration)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/StefvDijk/inversie.git
cd inversie

# Run the setup and start script (installs dependencies and starts both servers)
./init.sh

# Or install dependencies only
./init.sh --install-only

# Start just the backend (runs on http://localhost:3000)
./init.sh --backend

# Start just the frontend (runs on http://localhost:8082 for web)
./init.sh --frontend
```

### Environment Setup

Create a `.env` file in the `backend` directory:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-secret-key-here"

# OpenAI API (for Lees Simpel feature)
OPENAI_API_KEY="your-openai-api-key"

# Google Calendar API (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Microsoft Graph API (optional)
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
```

The frontend will automatically connect to `http://localhost:3000/api` (configured in `frontend/app.json`).

## Project Structure

```
inversie/
├── frontend/          # Expo React Native app
│   ├── app/           # App screens (Expo Router)
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── stores/        # Zustand state stores
│   ├── services/      # API client services
│   ├── utils/         # Utility functions
│   └── i18n/          # Internationalization
├── backend/           # Node.js Express API
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── middleware/# Auth, validation middleware
│   │   ├── services/  # Business logic
│   │   └── utils/     # Utility functions
│   └── prisma/        # Database schema and migrations
├── shared/            # Shared types and utilities
└── init.sh            # Development environment script
```

## Languages Supported

- Dutch (nl) - Primary
- English (en)
- Arabic (ar)
- Turkish (tr)

## Design System

The app uses a Neo-brutalism design with friendly warmth:
- Primary: #d6453a (Inversie Red)
- Accent: #f76a0c (Orange)
- Background: #F4F0E6 (Warm Cream)
- Hard shadows, thick borders, large touch targets

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Database Management
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## User Types

1. **Client**: Individuals under financial guardianship. Uses mobile app for all interactions.
2. **Bewindvoerder**: Financial guardian. Receives notifications, approves requests, manages calendar. Actual financial transactions are executed outside the app via banking systems.

## Security

- Biometric authentication (Face ID / Fingerprint) with PIN fallback
- 30-minute session timeout
- Role-based access control
- Secure API endpoints

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and PIN
- `POST /api/auth/logout` - Logout (requires token)
- `GET /api/auth/me` - Get current user (requires token)

### Money Requests
- `GET /api/money-requests` - List money requests (requires token)
- `POST /api/money-requests` - Create money request (requires token)
- `GET /api/money-requests/:id` - Get money request details (requires token)
- `PATCH /api/money-requests/:id/approve` - Approve request (bewindvoerder only)
- `PATCH /api/money-requests/:id/reject` - Reject request (bewindvoerder only)

### Savings Goals
- `GET /api/savings-goals` - List savings goals (requires token)
- `POST /api/savings-goals` - Create savings goal (requires token)
- `PATCH /api/savings-goals/:id` - Update savings goal (requires token)
- `DELETE /api/savings-goals/:id` - Delete savings goal (requires token)

### Transactions
- `GET /api/transactions` - List transactions (requires token)
- `GET /api/transactions/:id` - Get transaction details (requires token)

### Clients (Bewindvoerder only)
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client details

See `backend/src/routes/` for complete API documentation.

## Troubleshooting

### Frontend shows blank screen
- Make sure the backend is running on port 3000
- Check browser console for errors
- Clear cache: `cd frontend && npx expo start --web --clear`

### Database errors
- Run migrations: `cd backend && npx prisma migrate dev`
- Reset database: `cd backend && npx prisma migrate reset`

### Port already in use
- Backend: Change port in `backend/src/index.ts`
- Frontend: Expo will automatically use next available port

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - All rights reserved
