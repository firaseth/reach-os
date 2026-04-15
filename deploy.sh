#!/bin/bash

# Reach OS — Automated Deployment Script
# This script automates the process of pulling the latest code, 
# rebuilding the Docker containers, and applying database migrations.

set -e

echo "🚀 Starting deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# 2. Rebuild and restart containers
echo "🏗️ Rebuilding Docker containers..."
docker-compose up -d --build

# 3. Wait for database to be ready (optional but good practice)
echo "⏳ Waiting for application to initialize..."
sleep 5

# 4. Cleanup old images
echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo "✅ Deployment successful!"
echo "📍 Reach OS is running at: http://localhost (via Caddy)"
