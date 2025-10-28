#!/bin/bash

# SaaS Wildcard Subdomain Setup Script
# This script sets up DNS wildcard, SSL certificates, and Nginx configuration
# for automatic multi-tenant subdomain routing

set -e

echo "🚀 Setting up SaaS Wildcard Subdomain System"
echo "============================================="

# Configuration
DOMAIN="aoseudispor.com.br"
EMAIL="admin@aoseudispor.com.br"  # Change this to your email
NGINX_CONF="/etc/nginx/sites-available/saas-wildcard"
APP_PORT="3000"  # Change if your app runs on different port

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo_error "This script should not be run as root"
   exit 1
fi

# Function to check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo_error "$1 is not installed"
        return 1
    fi
    return 0
}

# Check prerequisites
echo_info "Checking prerequisites..."

if ! check_command "nginx"; then
    echo_error "Nginx is required but not installed"
    echo "Install with: sudo apt update && sudo apt install nginx"
    exit 1
fi

if ! check_command "certbot"; then
    echo_warning "Certbot not found. Installing..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

echo_success "Prerequisites check complete"

# Step 1: DNS Configuration Check
echo ""
echo_info "Step 1: Checking DNS Configuration"
echo "================================================"

echo "Checking if wildcard DNS is configured..."

# Test if wildcard DNS is working
if nslookup "test.$DOMAIN" > /dev/null 2>&1; then
    WILDCARD_IP=$(nslookup "test.$DOMAIN" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    MAIN_IP=$(nslookup "app.$DOMAIN" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    
    if [ "$WILDCARD_IP" = "$MAIN_IP" ]; then
        echo_success "Wildcard DNS is configured correctly"
    else
        echo_warning "Wildcard DNS may not be configured correctly"
        echo "Wildcard IP: $WILDCARD_IP"
        echo "Main app IP: $MAIN_IP"
    fi
else
    echo_error "Wildcard DNS is not configured"
    echo ""
    echo "You need to configure DNS with these records:"
    echo "Type: A"
    echo "Name: *.$DOMAIN"
    echo "Value: [YOUR_SERVER_IP]"
    echo ""
    echo "Type: A"
    echo "Name: app.$DOMAIN"
    echo "Value: [YOUR_SERVER_IP]"
    echo ""
    echo "Please configure DNS and run this script again."
    exit 1
fi

# Step 2: SSL Certificate Generation
echo ""
echo_info "Step 2: SSL Certificate Setup"
echo "============================================"

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo_success "SSL certificate already exists"
else
    echo_info "Generating wildcard SSL certificate..."
    echo_warning "You will need to add a TXT record to your DNS manually"
    
    sudo certbot certonly \
        --manual \
        --preferred-challenges dns \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --domains "*.$DOMAIN,$DOMAIN"
    
    if [ $? -eq 0 ]; then
        echo_success "SSL certificate generated successfully"
    else
        echo_error "SSL certificate generation failed"
        exit 1
    fi
fi

# Step 3: Nginx Configuration
echo ""
echo_info "Step 3: Nginx Configuration"
echo "=========================================="

# Backup existing configuration if it exists
if [ -f "$NGINX_CONF" ]; then
    echo_info "Backing up existing configuration..."
    sudo cp "$NGINX_CONF" "$NGINX_CONF.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy our configuration
echo_info "Installing Nginx configuration..."
sudo cp nginx-saas-wildcard.conf "$NGINX_CONF"

# Replace placeholders in the configuration
sudo sed -i "s/aoseudispor\.com\.br/$DOMAIN/g" "$NGINX_CONF"
sudo sed -i "s/localhost:3000/localhost:$APP_PORT/g" "$NGINX_CONF"

# Test Nginx configuration
echo_info "Testing Nginx configuration..."
if sudo nginx -t; then
    echo_success "Nginx configuration is valid"
else
    echo_error "Nginx configuration is invalid"
    exit 1
fi

# Enable the site
if [ -f "/etc/nginx/sites-enabled/saas-wildcard" ]; then
    echo_info "Site already enabled"
else
    echo_info "Enabling site..."
    sudo ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/saas-wildcard
fi

# Disable default site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo_info "Disabling default site..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Reload Nginx
echo_info "Reloading Nginx..."
sudo systemctl reload nginx

echo_success "Nginx configuration complete"

# Step 4: Application Configuration
echo ""
echo_info "Step 4: Application Setup"
echo "========================================"

if [ -f "package.json" ]; then
    echo_info "Installing npm dependencies..."
    npm install
    
    echo_info "Building application..."
    npm run build
    
    echo_success "Application built successfully"
else
    echo_warning "No package.json found. Make sure you're in the correct directory."
fi

# Step 5: Testing
echo ""
echo_info "Step 5: Testing Configuration"
echo "============================================"

echo_info "Testing main app..."
if curl -s -o /dev/null -w "%{http_code}" "https://app.$DOMAIN" | grep -q "200\|301\|302"; then
    echo_success "Main app is accessible"
else
    echo_warning "Main app may not be accessible"
fi

echo_info "Testing wildcard subdomain..."
if curl -s -o /dev/null -w "%{http_code}" "https://test.$DOMAIN" | grep -q "200\|301\|302"; then
    echo_success "Wildcard subdomain is working"
else
    echo_warning "Wildcard subdomain may not be working"
fi

# Step 6: SSL Certificate Auto-renewal
echo ""
echo_info "Step 6: SSL Auto-renewal Setup"
echo "=============================================="

# Add cron job for certificate renewal if not exists
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    echo_info "Setting up SSL certificate auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
    echo_success "SSL auto-renewal configured"
else
    echo_success "SSL auto-renewal already configured"
fi

# Final Summary
echo ""
echo "🎉 SaaS Wildcard Subdomain Setup Complete!"
echo "=========================================="
echo ""
echo_success "Your SaaS system is now configured with:"
echo "• Wildcard DNS: *.$DOMAIN"
echo "• SSL Certificate: *.${DOMAIN}"
echo "• Nginx Routing: Automatic subdomain detection"
echo "• Auto-renewal: SSL certificates"
echo ""
echo_info "URLs that should work:"
echo "• https://app.$DOMAIN (Admin interface)"
echo "• https://[tenant].$DOMAIN (Tenant catalogs)"
echo ""
echo_info "Next steps:"
echo "1. Test subdomain routing with your application"
echo "2. Configure tenants in your admin panel"
echo "3. Test with actual tenant subdomains"
echo ""
echo_warning "Remember to:"
echo "• Update your application's environment variables if needed"
echo "• Test all functionality thoroughly"
echo "• Monitor logs in /var/log/nginx/"
echo ""
echo_success "Setup complete! 🚀"
