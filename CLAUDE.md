# Bewindvoering App - Project Guidelines

> Dit bestand wordt automatisch geladen door Claude Code. Het bevat alle project-specifieke richtlijnen.

## Project Overview

Dit is een webapp voor bewindvoerders en hun cliënten.

**Cliënten kunnen:**
- Leefgeld aanvragen (extra geld bovenop wekelijks budget)
- Saldo en transacties bekijken
- Berichten sturen naar bewindvoerder
- Maandoverzicht inzien

**Bewindvoerders kunnen:**
- Aanvragen goedkeuren/afkeuren
- Cliënten beheren
- Budgetplannen maken
- Bank koppelingen beheren

## Tech Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL met Prisma ORM |
| Auth | JWT + SMS OTP verificatie |
| API | REST met OpenAPI/Swagger documentatie |
| Real-time | WebSocket (Socket.io) |
| Automations | n8n workflows |

## Code Conventions

### TypeScript
```typescript
// ✅ GOED: Proper typing
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  weeklyAllowance: number; // in cents
}

// ❌ FOUT: any types
function process(data: any) { ... }
```

### File Structure
- **Max 400 lines per file** (800 absolute maximum)
- One component per file
- Colocate tests: `Component.tsx` → `Component.test.tsx`

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `LeefgeldAanvraag.tsx` |
| Utilities | camelCase | `formatCurrency.ts` |
| API routes | kebab-case | `/api/allowance-requests` |
| Database tables | snake_case | `allowance_requests` |
| Environment vars | SCREAMING_SNAKE | `DATABASE_URL` |

### Language Rules
- **UI tekst:** Nederlands
- **Code, comments, commits:** Engels
- **Variable names:** Engels

## API Response Format

```typescript
// Altijd dit format gebruiken
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;      // Machine-readable: "INSUFFICIENT_FUNDS"
    message: string;   // Human-readable (Nederlands voor client-facing)
  };
  meta?: {
    page?: number;
    totalPages?: number;
    totalItems?: number;
  };
}
```

## Error Handling

```typescript
// ✅ GOED: Proper error handling
async function approveRequest(id: string): Promise<ApiResponse<AllowanceRequest>> {
  try {
    const request = await prisma.allowanceRequest.findUnique({ where: { id } });
    
    if (!request) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Aanvraag niet gevonden' }
      };
    }
    
    // ... logic
    
    return { success: true, data: updatedRequest };
  } catch (error) {
    logger.error('Failed to approve request', { id, error });
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Er ging iets mis. Probeer het later opnieuw.' }
    };
  }
}
```

## Security Requirements

### MUST DO
- [ ] Hash passwords with bcrypt (min 12 rounds)
- [ ] Encrypt BSN numbers at rest (AES-256)
- [ ] Validate ALL input (Zod schemas)
- [ ] Sanitize output to prevent XSS
- [ ] Use parameterized queries (Prisma does this)
- [ ] Implement rate limiting on auth endpoints
- [ ] Log all access to sensitive data

### NEVER DO
- [ ] Store plain text passwords
- [ ] Log BSN numbers or passwords
- [ ] Expose internal error messages to clients
- [ ] Use `eval()` or `new Function()`
- [ ] Trust client-side data without validation

## Database Schema (Key Tables)

```
┌─────────────────┐       ┌─────────────────┐
│  organizations  │       │     users       │
│─────────────────│       │─────────────────│
│  id (PK)        │◄──────│  org_id (FK)    │
│  name           │       │  email          │
│  settings       │       │  role           │
└─────────────────┘       └─────────────────┘
                                 │
                                 │ manages
                                 ▼
┌─────────────────┐       ┌─────────────────┐
│     clients     │       │allowance_requests│
│─────────────────│       │─────────────────│
│  id (PK)        │◄──────│  client_id (FK) │
│  org_id (FK)    │       │  amount         │
│  first_name     │       │  reason         │
│  bsn_encrypted  │       │  status         │
│  weekly_allowance│      │  approved_by    │
└─────────────────┘       └─────────────────┘
```

## Amount Handling

```typescript
// ALTIJD opslaan in CENTEN (integers)
const amountInCents = 7550;  // = €75,50

// Display formatting
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100);
}
// Output: "€ 75,50"

// Input parsing
function parseCurrency(input: string): number {
  const cleaned = input.replace(/[€\s.]/g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned) * 100);
}
```

## Date/Time Handling

```typescript
// Store: UTC (Prisma default)
// Display: Europe/Amsterdam

import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

function formatDate(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: nl });
}
// Output: "15 januari 2026"

function formatDateTime(date: Date): string {
  return format(date, 'd MMM yyyy HH:mm', { locale: nl });
}
// Output: "15 jan 2026 14:30"
```

## Status Enums

```typescript
enum AllowanceRequestStatus {
  PENDING = 'pending',      // Wacht op goedkeuring
  APPROVED = 'approved',    // Goedgekeurd, wacht op betaling
  REJECTED = 'rejected',    // Afgewezen
  CANCELLED = 'cancelled',  // Geannuleerd door cliënt
  PAID = 'paid'            // Uitbetaald
}

enum UserRole {
  ADMIN = 'admin',              // Kan alles
  BEWINDVOERDER = 'bewindvoerder',  // Kan cliënten beheren
  VIEWER = 'viewer'             // Alleen lezen
}

enum ClientStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  ONBOARDING = 'onboarding'
}
```

## Testing Requirements

- **Minimum coverage:** 80%
- **Unit tests:** All utilities and services
- **Integration tests:** All API endpoints
- **E2E tests:** Login flow, leefgeld aanvraag flow

```bash
# Run tests
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report
```

## Git Workflow

### Branch Naming
```
feature/add-expense-history
bugfix/double-submit-prevention
hotfix/security-patch
```

### Commit Messages (Conventional Commits)
```
feat: add expense history screen
fix: prevent double submission of requests
refactor: extract currency formatting to utility
docs: update API documentation
test: add unit tests for budget calculation
chore: update dependencies
```

### PR Process
1. Create feature branch from `develop`
2. Make changes, ensure tests pass
3. Run `/code-review` in Claude Code
4. Create PR with description
5. Get approval from team member
6. Squash merge to `develop`

## Available Agents

Claude Code heeft toegang tot deze agents. Gebruik ze proactief:

| Agent | Wanneer gebruiken |
|-------|-------------------|
| `planner` | ALTIJD voor nieuwe features |
| `architect` | Database wijzigingen, nieuwe integraties |
| `code-reviewer` | Na elke code wijziging |
| `tdd-guide` | Bij nieuwe features of bugfixes |

### Hoe aan te roepen:
```
> /plan Ik wil een functie toevoegen waar cliënten hun wekelijkse transacties kunnen filteren

> Gebruik de architect agent om te bepalen hoe we notificaties moeten opslaan

> /code-review
```

## Slash Commands

| Command | Beschrijving |
|---------|-------------|
| `/plan <feature>` | Maak implementatieplan voordat je begint |
| `/tdd <feature>` | Start test-driven development workflow |
| `/code-review` | Review recent geschreven code |

## External Integrations

### OnView API (Read-only)
- Cliënt synchronisatie
- Budget import

### PSD2 / Open Banking (TODO)
- Real-time transacties
- Saldo updates

### Rechtspraak.nl (TODO - low priority)
- Jurisprudentie kennisbank

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="..."
JWT_EXPIRY="7d"

# SMS (Twilio)
TWILIO_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+31..."

# Encryption
ENCRYPTION_KEY="..." # 32 bytes hex

# OnView (optional)
ONVIEW_USERNAME="..."
ONVIEW_PASSWORD="..."
ONVIEW_COMPANY_GUID="..."
```

## Folder Structure

```
bewindvoering-app/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── api/                 # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   ├── common/
│       │   └── main.ts
│       └── prisma/
├── packages/
│   └── shared/              # Shared types & utilities
├── CLAUDE.md                # This file
└── .claude/                 # Project-level Claude config
    └── settings.json
```

---

## Quick Reference

### Nieuwe feature starten:
```bash
claude
> /plan [beschrijf feature]
# Wacht op goedkeuring
> /tdd [implementeer volgens plan]
> /code-review
```

### Bug fixen:
```bash
claude
> Er is een bug: [beschrijf probleem]
> /code-review
```

### Architectuur vraag:
```bash
claude
> Gebruik de architect agent: [vraag]
```
