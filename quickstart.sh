#!/bin/bash

# KodiVault Quick Start Script
# This script helps you get started with KodiVault development

set -e

echo "========================================="
echo "KodiVault Quick Start Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is installed"
    USE_DOCKER=true
else
    echo -e "${YELLOW}!${NC} Docker not found. Will setup manually."
    USE_DOCKER=false
fi

echo ""
echo "Choose setup method:"
echo "1. Docker (Recommended - All services in containers)"
echo "2. Manual (Local development environment)"
read -p "Enter choice [1-2]: " SETUP_CHOICE

if [ "$SETUP_CHOICE" == "1" ] && [ "$USE_DOCKER" == true ]; then
    echo ""
    echo "========================================="
    echo "Setting up with Docker"
    echo "========================================="
    
    # Create .env files from examples
    echo -e "${YELLOW}→${NC} Creating environment files..."
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    
    # Start Docker Compose
    echo -e "${YELLOW}→${NC} Starting Docker containers..."
    docker-compose up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}→${NC} Waiting for services to start..."
    sleep 10
    
    # Run migrations
    echo -e "${YELLOW}→${NC} Running database migrations..."
    docker-compose exec -T backend python manage.py migrate
    
    # Create superuser prompt
    echo ""
    echo -e "${GREEN}✓${NC} Setup complete!"
    echo ""
    echo "Services running:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8000/api"
    echo "  - Admin Panel: http://localhost:8000/admin"
    echo ""
    echo "To create an admin user, run:"
    echo "  docker-compose exec backend python manage.py createsuperuser"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker-compose down"
    
elif [ "$SETUP_CHOICE" == "2" ]; then
    echo ""
    echo "========================================="
    echo "Manual Setup Instructions"
    echo "========================================="
    echo ""
    echo "Please follow these steps:"
    echo ""
    echo "1. Backend Setup:"
    echo "   cd backend"
    echo "   python -m venv venv"
    echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
    echo "   pip install -r requirements.txt"
    echo "   cp .env.example .env"
    echo "   # Edit .env with your database credentials"
    echo "   python manage.py migrate"
    echo "   python manage.py createsuperuser"
    echo "   python manage.py runserver"
    echo ""
    echo "2. Frontend Setup (in new terminal):"
    echo "   cd frontend"
    echo "   npm install"
    echo "   cp .env.example .env"
    echo "   npm start"
    echo ""
    echo "3. Solana Smart Contract (in new terminal):"
    echo "   cd solana-contracts"
    echo "   anchor build"
    echo "   anchor deploy --provider.cluster devnet"
    echo "   # Update PROGRAM_ID in backend/.env and frontend/.env"
    echo ""
    echo "For detailed instructions, see SETUP_GUIDE.md"
    
else
    echo -e "${RED}✗${NC} Invalid choice or Docker not available"
    exit 1
fi

echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""
echo "1. Read the documentation: README.md"
echo "2. Check setup guide: SETUP_GUIDE.md"
echo "3. Deploy smart contract (see SETUP_GUIDE.md)"
echo "4. Configure SMS notifications (Africa's Talking)"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
