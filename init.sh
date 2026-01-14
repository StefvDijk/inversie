#!/bin/bash

# Inversie Development Environment Setup Script
# This script sets up and runs the development environment for the Inversie app

set -e

echo "=================================================="
echo "  Inversie - Financial Guardianship App"
echo "  Development Environment Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        echo "Please install Node.js 20+ from https://nodejs.org"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        echo -e "${RED}Error: Node.js 20+ is required (found v$NODE_VERSION)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
}

# Check npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
}

# Install dependencies
install_deps() {
    echo ""
    echo -e "${YELLOW}Installing dependencies...${NC}"

    # Backend dependencies
    if [ -d "backend" ]; then
        echo "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi

    # Frontend dependencies
    if [ -d "frontend" ]; then
        echo "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi

    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Setup database
setup_database() {
    echo ""
    echo -e "${YELLOW}Setting up database...${NC}"

    if [ -d "backend" ]; then
        cd backend

        # Run Prisma migrations
        if [ -f "prisma/schema.prisma" ]; then
            npx prisma generate
            npx prisma db push
            echo -e "${GREEN}✓ Database schema applied${NC}"
        fi

        # Seed database if seed script exists
        if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
            npx prisma db seed
            echo -e "${GREEN}✓ Database seeded${NC}"
        fi

        cd ..
    fi
}

# Start development servers
start_servers() {
    echo ""
    echo -e "${YELLOW}Starting development servers...${NC}"
    echo ""

    # Start backend in background
    if [ -d "backend" ]; then
        echo "Starting backend server..."
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        sleep 2
    fi

    # Start frontend
    if [ -d "frontend" ]; then
        echo "Starting frontend (Expo)..."
        cd frontend
        npm start &
        FRONTEND_PID=$!
        cd ..
    fi

    echo ""
    echo "=================================================="
    echo -e "${GREEN}Development servers are running!${NC}"
    echo "=================================================="
    echo ""
    echo "Access the application:"
    echo "  - Backend API: http://localhost:3000"
    echo "  - Expo DevTools: http://localhost:8081"
    echo ""
    echo "For mobile testing:"
    echo "  - Install Expo Go on your phone"
    echo "  - Scan the QR code shown in terminal"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    echo ""

    # Wait for interrupt
    trap cleanup INT
    wait
}

cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Servers stopped${NC}"
    exit 0
}

# Main execution
main() {
    # Navigate to project root
    cd "$(dirname "$0")"

    check_node
    check_npm

    # Parse arguments
    case "${1:-}" in
        --install-only)
            install_deps
            setup_database
            echo ""
            echo -e "${GREEN}Setup complete! Run './init.sh' to start the servers.${NC}"
            ;;
        --backend)
            cd backend
            npm run dev
            ;;
        --frontend)
            cd frontend
            npm start
            ;;
        *)
            install_deps
            setup_database
            start_servers
            ;;
    esac
}

main "$@"
