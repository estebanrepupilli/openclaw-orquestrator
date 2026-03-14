#!/bin/bash

# ==============================================================================
# Openclaw Orchestrator Provisioning Script
# Target OS: Ubuntu 22.04 or superior
# Purpose: Prepares the server with Docker, UFW security, and required folders.
# ==============================================================================

# Fail-fast: Stop execution on any error
set -euo pipefail

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run as root (using sudo)."
  exit 1
fi

echo "--- Starting Provisioning for Openclaw Orchestrator ---"

# 1. Update System and Install Basic Dependencies
echo "Step 1: Updating system and installing basic dependencies..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw

# 2. Install Docker and Docker Compose v2 (Official Repository)
echo "Step 2: Installing Docker and Docker Compose v2..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version

# 3. Security Configuration (UFW Firewall)
echo "Step 3: Configuring UFW Firewall..."
# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow specific ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Enable UFW (implicitly assumes user is connected via SSH, will prompt in interactive mode,
# but we use --force for unattended script)
ufw --force enable
ufw status verbose

# 4. Directory Structure Creation
echo "Step 4: Creating directory structure in /opt/openclaw-orchestrator/..."
BASE_DIR="/opt/openclaw-orchestrator"

mkdir -p "$BASE_DIR/panel_data"
mkdir -p "$BASE_DIR/traefik_data"
mkdir -p "$BASE_DIR/volumes"

# 5. Permissions and Security Hardening
echo "Step 5: Setting permissions and security hardening..."

# Ensure the base directory and subdirectories are owned by root but accessible only by root
chown -R root:root "$BASE_DIR"
chmod -R 700 "$BASE_DIR"

# Create a restricted user for the panel if it doesn't exist (optional but recommended)
PANEL_USER="openclaw-panel"
if ! id "$PANEL_USER" &>/dev/null; then
    useradd -r -s /bin/false "$PANEL_USER"
    echo "Created non-privileged user '$PANEL_USER' for the panel."
fi

# Example: If there's a sensitive config file, we set it to 600
# touch "$BASE_DIR/traefik_data/acme.json"
# chmod 600 "$BASE_DIR/traefik_data/acme.json"

echo "--- Provisioning Complete ---"
echo "Your server is now secured and ready to host Openclaw."
echo "Base directory: $BASE_DIR"
echo "Firewall: UFW enabled (22, 80, 443 open)"
echo "Docker & Docker Compose: Installed and running"
