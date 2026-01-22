#!/bin/bash

# =============================================================================
# Claude Code Setup Script voor Bewindvoering App
# =============================================================================
# Dit script installeert alle benodigde configuraties voor Claude Code
# Voer uit met: chmod +x setup-claude-code.sh && ./setup-claude-code.sh
# =============================================================================

set -e  # Stop bij fouten

echo "🚀 Claude Code Setup voor Bewindvoering App"
echo "============================================"
echo ""

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is niet geïnstalleerd${NC}"
    echo "   Installeer Node.js via: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versie 18+ is vereist (huidige: $(node -v))${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is niet geïnstalleerd${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git is niet geïnstalleerd${NC}"
    exit 1
fi
echo -e "${GREEN}✓ git $(git --version | cut -d' ' -f3)${NC}"

echo ""

# Install Claude Code
echo "📦 Installing Claude Code..."
if command -v claude &> /dev/null; then
    echo -e "${YELLOW}⚠ Claude Code is al geïnstalleerd, updating...${NC}"
    npm update -g @anthropic-ai/claude-code
else
    npm install -g @anthropic-ai/claude-code
fi
echo -e "${GREEN}✓ Claude Code geïnstalleerd${NC}"

echo ""

# Check for API key
echo "🔑 Checking API key..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}⚠ ANTHROPIC_API_KEY is niet ingesteld${NC}"
    echo ""
    echo "   Je hebt een Anthropic API key nodig."
    echo "   1. Ga naar: https://console.anthropic.com/"
    echo "   2. Maak een account of log in"
    echo "   3. Kopieer je API key"
    echo ""
    read -p "   Voer je API key in (of druk Enter om over te slaan): " API_KEY
    
    if [ -n "$API_KEY" ]; then
        # Detect shell config file
        if [ -f "$HOME/.zshrc" ]; then
            SHELL_CONFIG="$HOME/.zshrc"
        elif [ -f "$HOME/.bashrc" ]; then
            SHELL_CONFIG="$HOME/.bashrc"
        else
            SHELL_CONFIG="$HOME/.profile"
        fi
        
        echo "export ANTHROPIC_API_KEY=\"$API_KEY\"" >> "$SHELL_CONFIG"
        export ANTHROPIC_API_KEY="$API_KEY"
        echo -e "${GREEN}✓ API key toegevoegd aan $SHELL_CONFIG${NC}"
        echo -e "${YELLOW}   Run 'source $SHELL_CONFIG' of herstart je terminal${NC}"
    else
        echo -e "${YELLOW}   Je moet de API key later handmatig instellen${NC}"
    fi
else
    echo -e "${GREEN}✓ ANTHROPIC_API_KEY is ingesteld${NC}"
fi

echo ""

# Create Claude config directories
echo "📁 Creating Claude config directories..."
mkdir -p ~/.claude/{agents,rules,commands,skills}
echo -e "${GREEN}✓ Directories aangemaakt in ~/.claude/${NC}"

echo ""

# Clone everything-claude-code repo
echo "📥 Downloading everything-claude-code configs..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

if git clone --depth 1 https://github.com/affaan-m/everything-claude-code.git 2>/dev/null; then
    echo -e "${GREEN}✓ Repository gecloned${NC}"
else
    echo -e "${RED}❌ Kon repository niet clonen${NC}"
    echo "   Controleer je internetverbinding"
    exit 1
fi

# Copy selected configs
echo ""
echo "📋 Copying essential configs..."

# Agents
echo "   → Agents..."
cp everything-claude-code/agents/planner.md ~/.claude/agents/ 2>/dev/null || true
cp everything-claude-code/agents/architect.md ~/.claude/agents/ 2>/dev/null || true
cp everything-claude-code/agents/code-reviewer.md ~/.claude/agents/ 2>/dev/null || true
cp everything-claude-code/agents/tdd-guide.md ~/.claude/agents/ 2>/dev/null || true

# Rules
echo "   → Rules..."
cp everything-claude-code/rules/security.md ~/.claude/rules/ 2>/dev/null || true
cp everything-claude-code/rules/coding-style.md ~/.claude/rules/ 2>/dev/null || true
cp everything-claude-code/rules/testing.md ~/.claude/rules/ 2>/dev/null || true

# Commands
echo "   → Commands..."
cp everything-claude-code/commands/plan.md ~/.claude/commands/ 2>/dev/null || true
cp everything-claude-code/commands/tdd.md ~/.claude/commands/ 2>/dev/null || true
cp everything-claude-code/commands/code-review.md ~/.claude/commands/ 2>/dev/null || true

# Skills
echo "   → Skills..."
if [ -d "everything-claude-code/skills/backend-patterns" ]; then
    cp -r everything-claude-code/skills/backend-patterns ~/.claude/skills/
fi

echo -e "${GREEN}✓ Configs gekopieerd${NC}"

# Cleanup
cd ~
rm -rf "$TEMP_DIR"

echo ""

# Create bewindvoering skill directory
echo "📋 Creating bewindvoering skill..."
mkdir -p ~/.claude/skills/bewindvoering

cat > ~/.claude/skills/bewindvoering/SKILL.md << 'SKILL_EOF'
---
name: bewindvoering
description: Domain knowledge for Dutch financial guardianship (bewindvoering) applications. Use when building features related to allowances, budgets, client management, or legal compliance.
---

# Bewindvoering Domain Expertise

## Key Concepts
- **Schuldenbewind**: For problematic debts
- **Beschermingsbewind**: For mental/physical limitations
- **Beheerrekening**: Main account (bewindvoerder controls)
- **Leefgeldrekening**: Client's spending account

## Amount Handling
- ALWAYS store in cents (integers)
- Display: €75,50 (comma as decimal)
- Format: `new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })`

## Communication
- Use simple Dutch (B1 level)
- Never just say "no" - explain and offer alternatives
- Sensitive data: BSN must be encrypted

## Status Flow
pending → approved → paid
pending → rejected
pending → cancelled (by client)
SKILL_EOF

echo -e "${GREEN}✓ Bewindvoering skill aangemaakt${NC}"

echo ""

# Create settings.json with hooks
echo "⚙️ Creating settings.json with hooks..."
cat > ~/.claude/settings.json << 'SETTINGS_EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\.(ts|tsx)$\"",
        "hooks": [
          {
            "type": "command",
            "command": "#!/bin/bash\nif grep -n ': any' \"$TOOL_INPUT_FILE_PATH\" 2>/dev/null | grep -v '// @ts-ignore' | head -3; then\n  echo '[Hook] Gevonden \"any\" type - gebruik proper TypeScript types' >&2\nfi"
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
            "command": "#!/bin/bash\nif grep -n 'console.log' \"$TOOL_INPUT_FILE_PATH\" 2>/dev/null | head -3; then\n  echo '[Hook] Vergeet niet console.log te verwijderen voor commit' >&2\nfi"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(git *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(grep *)",
      "Bash(find *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)",
      "Bash(curl * | bash)",
      "Bash(wget * | bash)"
    ]
  }
}
SETTINGS_EOF

echo -e "${GREEN}✓ Settings.json aangemaakt${NC}"

echo ""

# Summary
echo "============================================"
echo -e "${GREEN}✅ SETUP COMPLEET!${NC}"
echo "============================================"
echo ""
echo "Geïnstalleerd:"
echo "  ├── Claude Code CLI"
echo "  ├── 4 Agents (planner, architect, code-reviewer, tdd-guide)"
echo "  ├── 3 Rules (security, coding-style, testing)"
echo "  ├── 3 Commands (/plan, /tdd, /code-review)"
echo "  ├── 2 Skills (backend-patterns, bewindvoering)"
echo "  └── Settings met hooks"
echo ""
echo "Locatie: ~/.claude/"
echo ""
echo "============================================"
echo "VOLGENDE STAPPEN:"
echo "============================================"
echo ""
echo "1. Als je de API key net hebt ingesteld:"
echo "   ${YELLOW}source ~/.zshrc${NC}  (of ~/.bashrc)"
echo ""
echo "2. Ga naar je project folder:"
echo "   ${YELLOW}cd /pad/naar/bewindvoering-app${NC}"
echo ""
echo "3. Kopieer het CLAUDE.md bestand naar je project:"
echo "   ${YELLOW}(download van de gegenereerde bestanden)${NC}"
echo ""
echo "4. Start Claude Code:"
echo "   ${YELLOW}claude${NC}"
echo ""
echo "5. Plan je eerste feature:"
echo "   ${YELLOW}/plan [beschrijf je feature]${NC}"
echo ""
echo "============================================"
echo "HULP NODIG?"
echo "============================================"
echo ""
echo "• Documentatie: https://code.claude.com/docs"
echo "• everything-claude-code: https://github.com/affaan-m/everything-claude-code"
echo ""
echo "Succes met je bewindvoering app! 🚀"
