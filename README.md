# Inversie

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
# Clone and navigate to project
cd inversie

# Run the setup and start script
./init.sh

# Or install dependencies only
./init.sh --install-only

# Start just the backend
./init.sh --backend

# Start just the frontend
./init.sh --frontend
```

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

## License

Proprietary - All rights reserved
