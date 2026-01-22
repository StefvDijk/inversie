# Claude Code Setup Handleiding voor Bewindvoering App

*Complete gids voor beginners - Van nul naar professionele ontwikkelomgeving*

---

## 📋 Inhoudsopgave

1. [Wat is Claude Code en waarom gebruiken?](#wat-is-claude-code)
2. [Installatie Stap voor Stap](#installatie)
3. [De everything-claude-code repo begrijpen](#everything-claude-code)
4. [Wat je WEL en NIET nodig hebt](#wat-je-nodig-hebt)
5. [Complete Setup voor jouw Bewindvoering App](#complete-setup)
6. [Dagelijkse Workflow](#dagelijkse-workflow)
7. [Veelvoorkomende Problemen](#problemen)

---

## Wat is Claude Code?

### Claude Code vs. Cursor

Je gebruikt nu **Cursor** - een code editor met AI. **Claude Code** is iets anders:

| Aspect | Cursor | Claude Code |
|--------|--------|-------------|
| **Wat is het?** | Code editor (zoals VS Code) | Terminal/CLI tool |
| **Hoe gebruik je het?** | GUI met klikken | Terminal commando's |
| **AI integratie** | Copilot-achtig | Agent-gebaseerd |
| **Beste voor** | Snel code schrijven | Complexe taken, automatisering |

**Goed nieuws:** Je kunt BEIDE gebruiken! Cursor voor dagelijkse editing, Claude Code voor complexe taken.

### Waarom Claude Code voor jouw app?

1. **Agents:** Gespecialiseerde AI's voor specifieke taken (code review, testen, planning)
2. **Consistentie:** Dezelfde regels en patronen door je hele project
3. **Automatisering:** Hooks die automatisch dingen checken
4. **Professional:** Battle-tested door een Anthropic hackathon winnaar

---

## Installatie

### Stap 1: Prerequisites

```bash
# Check of je Node.js hebt (versie 18+)
node --version

# Zo niet, installeer via:
# macOS: brew install node
# Windows: https://nodejs.org/

# Check of je een Anthropic API key hebt
# Ga naar: https://console.anthropic.com/
```

### Stap 2: Claude Code Installeren

```bash
# Installeer Claude Code globaal
npm install -g @anthropic-ai/claude-code

# Configureer je API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Voor permanente configuratie (macOS/Linux), voeg toe aan ~/.zshrc of ~/.bashrc:
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc

# Windows (PowerShell):
# [Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-...", "User")
```

### Stap 3: Test de installatie

```bash
# Start Claude Code in je project folder
cd /pad/naar/je/bewindvoering-app

# Start Claude Code
claude

# Je zou nu een interactieve terminal moeten zien
# Type "help" voor commando's
```

---

## everything-claude-code Begrijpen

De repository van Affaan Mustafa bevat **8 type configuraties**. Hier is wat elk doet:

### 🤖 Agents (Subagents)

**Wat:** Gespecialiseerde AI assistenten voor specifieke taken

**Waarom belangrijk:** In plaats van één AI die alles doet, heb je experts:
- `planner.md` - Plant features voordat er code geschreven wordt
- `code-reviewer.md` - Controleert code kwaliteit en security
- `architect.md` - Maakt architectuur beslissingen
- `tdd-guide.md` - Begeleidt test-driven development

**Hoe het werkt:**
```
Jij: "Bouw een leefgeld aanvraag feature"
     ↓
Claude Code: "Dit is complex, ik roep de planner agent aan"
     ↓
Planner Agent: Maakt gedetailleerd implementatieplan
     ↓
Claude Code: "Plan goedgekeurd, nu ga ik bouwen"
     ↓
Code Reviewer Agent: Controleert de code automatisch
```

### 📜 Rules (Regels)

**Wat:** Richtlijnen die ALTIJD gevolgd worden

**Relevante regels voor jou:**
- `security.md` - Geen hardcoded secrets, input validatie
- `coding-style.md` - Code stijl, file grootte limieten
- `testing.md` - Test requirements (80% coverage)
- `git-workflow.md` - Commit format, PR process

### ⚡ Commands (Slash Commando's)

**Wat:** Snelkoppelingen die je typt als `/command`

**Handige commando's:**
- `/plan` - Maak implementatieplan
- `/tdd` - Start test-driven development
- `/code-review` - Review je code
- `/build-fix` - Fix build errors

### 🎯 Skills (Vaardigheden)

**Wat:** Domeinkennis en workflows die Claude kan gebruiken

**Relevante skills:**
- `backend-patterns.md` - API, database, caching patronen
- `frontend-patterns.md` - React, Next.js patronen
- `coding-standards.md` - Best practices per taal

### 🔗 Hooks (Automatische triggers)

**Wat:** Scripts die automatisch draaien bij bepaalde events

**Voorbeeld:**
```json
{
  "matcher": "tool == \"Edit\"",
  "hooks": [{
    "type": "command",
    "command": "grep -n 'console.log' \"$file_path\" && echo 'Verwijder console.log!'"
  }]
}
```
→ Waarschuwt automatisch als je console.log achterlaat

### 🔌 MCP Configs (Model Context Protocol)

**Wat:** Externe tool integraties (GitHub, databases, etc.)

**⚠️ WAARSCHUWING van Affaan:**
> "Don't enable all MCPs at once. Your 200k context window can shrink to 70k with too many tools enabled."

**Regel:** Max 10 MCPs actief per project, max 80 tools totaal.

---

## Wat je WEL en NIET nodig hebt

### ✅ MOET JE INSTALLEREN (voor jouw app)

```
~/.claude/
├── agents/
│   ├── planner.md           ← Feature planning
│   ├── architect.md         ← Architectuur beslissingen
│   ├── code-reviewer.md     ← Code review
│   └── tdd-guide.md         ← Test-driven development
│
├── rules/
│   ├── security.md          ← Security checks
│   ├── coding-style.md      ← Code stijl
│   └── testing.md           ← Test requirements
│
├── commands/
│   ├── plan.md              ← /plan commando
│   ├── tdd.md               ← /tdd commando
│   └── code-review.md       ← /code-review commando
│
├── skills/
│   ├── backend-patterns/    ← API & database patterns
│   │   └── SKILL.md
│   └── bewindvoering/       ← Custom skill (maken we hieronder)
│       └── SKILL.md
│
└── settings.json            ← Hooks configuratie
```

### ❌ NIET NODIG (voor nu)

- `e2e-runner.md` - Playwright E2E tests (later toevoegen)
- `clickhouse-io.md` - ClickHouse analytics (niet relevant)
- `refactor-cleaner.md` - Dead code cleanup (later)
- Alle MCP servers behalve GitHub

### ⏳ LATER TOEVOEGEN

- `security-reviewer.md` - Voor productie
- `doc-updater.md` - Als documentatie groeit

---

## Complete Setup voor jouw Bewindvoering App

### Stap 1: Clone de everything-claude-code repo

```bash
# Clone naar een tijdelijke locatie
cd ~
git clone https://github.com/affaan-m/everything-claude-code.git

# Maak de Claude config folders
mkdir -p ~/.claude/{agents,rules,commands,skills}
```

### Stap 2: Kopieer alleen wat je nodig hebt

```bash
# Agents (de belangrijkste)
cp ~/everything-claude-code/agents/planner.md ~/.claude/agents/
cp ~/everything-claude-code/agents/architect.md ~/.claude/agents/
cp ~/everything-claude-code/agents/code-reviewer.md ~/.claude/agents/
cp ~/everything-claude-code/agents/tdd-guide.md ~/.claude/agents/

# Rules
cp ~/everything-claude-code/rules/security.md ~/.claude/rules/
cp ~/everything-claude-code/rules/coding-style.md ~/.claude/rules/
cp ~/everything-claude-code/rules/testing.md ~/.claude/rules/

# Commands
cp ~/everything-claude-code/commands/plan.md ~/.claude/commands/
cp ~/everything-claude-code/commands/tdd.md ~/.claude/commands/
cp ~/everything-claude-code/commands/code-review.md ~/.claude/commands/

# Skills (als folder)
cp -r ~/everything-claude-code/skills/backend-patterns ~/.claude/skills/
```

### Stap 3: Maak je project-specifieke CLAUDE.md

In je **project root** (waar je app staat), maak een `CLAUDE.md` file:

```bash
cd /pad/naar/bewindvoering-app
touch CLAUDE.md
```

Inhoud van `CLAUDE.md`:

```markdown
# Bewindvoering App - Project Guidelines

## Project Overview
Dit is een webapp voor bewindvoerders en hun cliënten. Cliënten kunnen:
- Leefgeld aanvragen
- Saldo bekijken
- Berichten sturen naar bewindvoerder

Bewindvoerders kunnen:
- Aanvragen goedkeuren/afkeuren
- Cliënten beheren
- Budgetplannen maken

## Tech Stack
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** NestJS, PostgreSQL, Prisma ORM
- **Auth:** JWT met SMS OTP verificatie
- **API:** REST met OpenAPI documentatie

## Code Conventions

### TypeScript
- Strict mode enabled
- No `any` types - use proper typing
- Interfaces voor data shapes, types voor unions

### File Structure
- Max 400 lines per file (800 absolute max)
- One component per file
- Colocate tests: `component.tsx` → `component.test.tsx`

### Naming
- Components: PascalCase (e.g., `LeefgeldAanvraag.tsx`)
- Utilities: camelCase (e.g., `formatCurrency.ts`)
- API routes: kebab-case (e.g., `/api/allowance-requests`)

### Dutch vs English
- UI tekst: Nederlands
- Code, comments, commits: Engels
- Variable names: Engels

## Important Patterns

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

### Error Handling
- Always use try-catch in async functions
- Log errors with context
- Return user-friendly messages in Dutch

### Security Requirements
- NEVER store plain text passwords
- ALWAYS validate and sanitize input
- BSN numbers must be encrypted at rest
- All API endpoints require authentication (except /auth/*)

## Database

### Key Tables
- `clients` - Cliënten onder bewind
- `users` - Bewindvoerders (staff)
- `allowance_requests` - Leefgeld aanvragen
- `transactions` - Bank transacties
- `messages` - Chat berichten

### Relations
- Client belongs to Organization
- Client has many AllowanceRequests
- AllowanceRequest has one Approver (User)

## Testing Requirements
- Minimum 80% code coverage
- Unit tests for all utilities
- Integration tests for API endpoints
- E2E tests for critical flows (login, leefgeld aanvraag)

## Available Agents
Use these agents proactively:
- `planner` - Before implementing any new feature
- `architect` - For database changes or new integrations
- `code-reviewer` - After completing any code changes
- `tdd-guide` - When writing new features

## Commands
- `/plan <feature>` - Create implementation plan
- `/tdd <feature>` - Start test-driven development
- `/code-review` - Review recent changes
```

### Stap 4: Maak een custom Bewindvoering Skill

```bash
mkdir -p ~/.claude/skills/bewindvoering
```

Maak `~/.claude/skills/bewindvoering/SKILL.md`:

```markdown
---
name: bewindvoering
description: Domain knowledge for Dutch financial guardianship (bewindvoering) applications. Use when building features related to allowances, budgets, client management, or legal compliance.
---

# Bewindvoering Domain Knowledge

## What is Bewindvoering?
Bewindvoering (financial guardianship) is a Dutch legal protection measure where a court-appointed administrator manages finances for people who cannot do so themselves.

## Key Concepts

### Schuldenbewind (Debt Guardianship)
- For people with problematic debts
- Bewindvoerder manages all finances
- Goal: stabilize finances, work towards debt resolution

### Beschermingsbewind (Protective Guardianship)
- For people who cannot manage finances due to mental/physical limitations
- More permanent arrangement
- Focus on financial stability and protection

## Financial Structure

### Beheerrekening (Management Account)
- Main account controlled by bewindvoerder
- All income flows here
- Fixed costs paid from here

### Leefgeldrekening (Allowance Account)
- Client's spending money account
- Weekly/monthly allowance transferred here
- Client has debit card access

### Spaarrekening (Savings Account)
- For reserved funds (vacation, unexpected costs)
- Client cannot access directly

## Leefgeld (Allowance) Workflow

### Standard Flow
1. Client has weekly/monthly budget (e.g., €75/week)
2. Regular transfers happen automatically
3. Extra requests need approval

### Extra Request Reasons
Common valid reasons:
- Medical costs (not covered by insurance)
- Essential household items
- Travel for medical appointments
- Birthday/holiday gifts (within reason)

Red flags to watch:
- Frequent extra requests
- Vague descriptions
- Amounts don't match stated purpose
- Requests for cash

## Legal Requirements

### Privacy (AVG/GDPR)
- BSN numbers are highly sensitive
- Must be encrypted at rest
- Access logging required
- Data retention: 7 years after end of bewind

### Rechtbank Reporting
- Annual accounts to court
- Major decisions need court approval
- Client has right to object

## Communication Best Practices

### With Clients
- Use simple, clear Dutch (B1 level)
- Avoid financial jargon
- Be respectful and patient
- Confirm understanding

### Rejection Messages
Never just say "no". Always:
1. Acknowledge the request
2. Explain why it cannot be approved
3. Offer alternatives if possible
4. Invite questions

Example:
```
Beste [naam],

Bedankt voor je aanvraag voor €150 voor een nieuwe telefoon.

Helaas kan ik dit nu niet goedkeuren. De reden is dat er vorige maand 
al €200 extra is uitgegeven voor kleding, en je budget voor dit kwartaal 
is daarmee al overschreden.

Wat ik wel kan doen:
- Volgende maand €50 extra reserveren voor de telefoon
- Kijken naar een goedkoper alternatief (refurbished)

Heb je vragen? Stuur me gerust een bericht.

Met vriendelijke groet,
[bewindvoerder naam]
```

## Technical Implementation Notes

### Amounts
- Always store in cents (integers)
- Display with € symbol and comma as decimal separator
- Format: €75,50 (not €75.50)

### Dates
- Store in UTC
- Display in Europe/Amsterdam timezone
- Format: "15 januari 2026" or "15-01-2026"

### Status Values
```typescript
enum AllowanceRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  PAID = 'paid'
}
```

### Budget Calculations
```typescript
// Weekly allowance from monthly
weeklyAllowance = monthlyAllowance / 4.33

// Remaining budget
remainingBudget = monthlyAllowance - sumOfApprovedRequests - regularPayments
```
```

### Stap 5: Configureer Settings (Hooks)

Maak `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\.(ts|tsx)$\"",
        "hooks": [
          {
            "type": "command",
            "command": "#!/bin/bash\nif grep -n 'any' \"$TOOL_INPUT_FILE_PATH\" 2>/dev/null | grep -v '// @ts-ignore'; then\n  echo '[Hook] Found \"any\" type - please use proper TypeScript types' >&2\nfi"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "tool == \"Edit\"",
        "hooks": [
          {
            "type": "command",
            "command": "#!/bin/bash\nif grep -n 'console.log' \"$TOOL_INPUT_FILE_PATH\" 2>/dev/null; then\n  echo '[Hook] Remember to remove console.log before committing' >&2\nfi"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git *)",
      "Bash(npx prisma *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ]
  }
}
```

### Stap 6: Project-level configuratie

In je project folder, maak `.claude/` folder:

```bash
cd /pad/naar/bewindvoering-app
mkdir -p .claude
```

Maak `.claude/settings.json` (project-specifiek):

```json
{
  "disabledMcpServers": [
    "clickhouse",
    "kubernetes",
    "terraform"
  ],
  "model": "sonnet",
  "subagentModel": "sonnet"
}
```

---

## Dagelijkse Workflow

### Nieuwe Feature Bouwen

```bash
# 1. Start Claude Code in je project
cd /pad/naar/bewindvoering-app
claude

# 2. Plan de feature eerst
> /plan Ik wil een scherm maken waar cliënten hun uitgavenhistorie kunnen zien

# Claude roept de planner agent aan en maakt een gedetailleerd plan
# WACHT op je goedkeuring voordat er code geschreven wordt

# 3. Na goedkeuring, bouw met TDD
> /tdd Implementeer het uitgavenhistorie scherm volgens het plan

# 4. Review de code
> /code-review

# 5. Commit (in je normale terminal of Cursor)
git add .
git commit -m "feat: add expense history screen for clients"
```

### Bug Fixen

```bash
# Start Claude Code
claude

# Beschrijf het probleem
> Er is een bug: als een cliënt twee keer snel op "Aanvragen" klikt, 
> worden er twee aanvragen aangemaakt. Fix dit.

# Claude analyseert en fixt automatisch
# Review de fix
> /code-review
```

### Architectuur Beslissing

```bash
claude

# Vraag om architectuur advies
> Ik wil real-time notificaties toevoegen. Moet ik WebSockets gebruiken 
> of Server-Sent Events? Wat past het beste bij onze stack?

# Claude roept de architect agent aan voor een onderbouwd advies
```

---

## Cursor + Claude Code Samenwerking

Je kunt beide tools gebruiken:

### Gebruik Cursor voor:
- Snel kleine edits maken
- File navigatie
- Inline code completion
- Git operations (GUI)

### Gebruik Claude Code voor:
- Nieuwe features plannen
- Complexe refactoring
- Code reviews
- Architectuur beslissingen
- TDD workflows

### Workflow Voorbeeld

```
1. Open Cursor met je project
2. Open een terminal IN Cursor (View → Terminal)
3. Type `claude` in de terminal
4. Werk met Claude Code voor complexe taken
5. Zie de file changes live in Cursor
6. Gebruik Cursor voor kleine tweaks
7. Commit via Cursor's Git panel
```

---

## Veelvoorkomende Problemen

### "Command not found: claude"

```bash
# Herinstalleer
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code

# Check PATH
echo $PATH
# Node global bin moet erin staan
```

### "API key not set"

```bash
# Check of de key is ingesteld
echo $ANTHROPIC_API_KEY

# Als leeg, stel opnieuw in
export ANTHROPIC_API_KEY="sk-ant-..."

# Permanent (voeg toe aan ~/.zshrc of ~/.bashrc)
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc
```

### "Context window te klein"

Dit gebeurt als je te veel MCPs hebt ingeschakeld.

```bash
# Check actieve MCPs
claude mcp list

# Disable ongebruikte MCPs
# In .claude/settings.json:
{
  "disabledMcpServers": ["server1", "server2"]
}
```

### "Agent niet gevonden"

```bash
# Check of agents bestaan
ls -la ~/.claude/agents/

# Herstart Claude Code na wijzigingen
# (gewoon afsluiten en opnieuw starten)
```

### "Hooks werken niet"

```bash
# Valideer JSON syntax
cat ~/.claude/settings.json | python -m json.tool

# Check file permissions
chmod 644 ~/.claude/settings.json
```

---

## Checklist voor Productie-klare App

### Voordat je live gaat:

- [ ] Alle agents geïnstalleerd en getest
- [ ] Security rules actief
- [ ] Code coverage > 80%
- [ ] Alle `console.log` verwijderd
- [ ] Geen `any` types in TypeScript
- [ ] BSN encryptie geïmplementeerd
- [ ] Error handling overal
- [ ] API rate limiting ingesteld
- [ ] Logging configuratie klaar
- [ ] Database backups geconfigureerd

### Claude Code commando's voor finale check:

```bash
claude

> /code-review Check de hele codebase voor security issues
> Zijn er plekken waar BSN of andere gevoelige data niet goed beveiligd is?
> Check of alle API endpoints authenticatie vereisen
> Zoek naar hardcoded credentials of API keys
```

---

## Samenvatting

### Wat je hebt geïnstalleerd:

1. **Claude Code CLI** - De basis tool
2. **4 Agents** - Planner, Architect, Code Reviewer, TDD Guide
3. **3 Rules** - Security, Coding Style, Testing
4. **3 Commands** - /plan, /tdd, /code-review
5. **2 Skills** - Backend Patterns, Bewindvoering (custom)
6. **Hooks** - Automatische TypeScript en console.log checks
7. **Project CLAUDE.md** - Je project-specifieke richtlijnen

### Dagelijks gebruiken:

```bash
# Start je dag
cd bewindvoering-app
claude

# Plan nieuwe feature
> /plan [feature beschrijving]

# Bouw met tests
> /tdd [implementatie]

# Review voor commit
> /code-review

# Commit in Cursor of terminal
git commit -m "feat: ..."
```

### Belangrijkste tips van Affaan:

1. **Lees eerst, bouw dan** - Gebruik /plan voor elke feature
2. **Context is kostbaar** - Niet te veel MCPs tegelijk
3. **Agents zijn je team** - Laat ze hun werk doen
4. **Pas aan naar jouw workflow** - Dit zijn startpunten, niet regels

---

*Succes met je bewindvoering app! 🚀*

*Vragen? Vraag Claude Code zelf - hij kent nu je hele setup!*
