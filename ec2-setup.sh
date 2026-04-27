#!/bin/bash

# Pawfect FurEver - EC2 Setup Script
# Run this script on your EC2 instance after connecting via SSH

set -e

echo "🐾 Pawfect FurEver - EC2 Setup"
echo "================================"

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "📚 Installing Git..."
sudo apt install -y git

# Verify installations
echo ""
echo "✅ Installation Complete!"
echo "========================="
docker --version
docker-compose --version
git --version

echo ""
echo "⚠️  IMPORTANT: Log out and log back in for Docker permissions to take effect"
echo ""
echo "Next steps:"
echo "1. Exit and reconnect: exit"
echo "2. Clone repo: git clone https://github.com/Tia-ani/ShopSmart.git"
echo "3. cd ShopSmart"
echo "4. Create .env files (see EC2-DEPLOYMENT.md)"
echo "5. Run: docker-compose up -d --build"
