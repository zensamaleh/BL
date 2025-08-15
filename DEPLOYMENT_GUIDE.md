# Deployment Guide: BL Management Application on VPS (Without Nginx)

This guide provides step-by-step instructions for deploying the BL Management application on a VPS without using Nginx.

## Application Architecture

The application consists of two main components:
1. **Frontend**: React/Vite application (runs on port 5173 in development, 80/443 in production)
2. **Backend**: Node.js/Express API (runs on port 3001)

## Prerequisites

- A VPS with Ubuntu 20.04 or later
- Root or sudo access
- A domain name (optional but recommended)
- Firewall configured to allow necessary ports

## Step-by-Step Deployment

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager for Node.js applications)
sudo npm install -g pm2

# Install build tools
sudo apt install -y build-essential

# Install Git
sudo apt install -y git

# Verify installations
node --version
npm --version
```

### 2. Clone the Application

```bash
# Create application directory
sudo mkdir -p /var/www/bl-management
sudo chown $USER:$USER /var/www/bl-management

# Clone the repository (adjust URL as needed)
cd /var/www/bl-management
git clone <repository-url> .

# Or if deploying from a local copy, upload files to this directory
```

### 3. Backend Deployment

```bash
# Navigate to backend directory
cd /var/www/bl-management/backend

# Install backend dependencies
npm install

# Create production environment file
cp .env .env.production

# Edit the production environment file
nano .env.production
```

Update the following values in `.env.production`:
```
# Server configuration
PORT=3001
NODE_ENV=production

# Security
JWT_SECRET=your_secure_jwt_secret_here
CORS_ORIGIN=https://yourdomain.com  # Or http://your-vps-ip if no domain

# Supabase configuration (keep existing values or update if needed)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

```bash
# Build the backend application
npm run build

# Start backend with PM2
pm2 start dist/server.js --name "bl-backend" -e /var/log/bl-backend-err.log -o /var/log/bl-backend-out.log

# Check if the backend is running
pm2 status

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### 4. Frontend Deployment

```bash
# Navigate to frontend directory
cd /var/www/bl-management

# Install frontend dependencies
npm install

# Update the API base URL in the frontend
nano src/backend/api.ts
```

Change line 46 from:
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

To:
```typescript
const API_BASE_URL = 'http://your-vps-ip:3001/api';
// Or if you have a domain:
// const API_BASE_URL = 'https://yourdomain.com:3001/api';
```

```bash
# Build the frontend application
npm run build

# The build output will be in the 'dist' directory
# For direct access without Nginx, we'll serve it with Express
```

### 5. Serve Frontend Build with Express

Since we're not using Nginx, we need to serve the frontend build with Express:

```bash
# Create a simple Express server for the frontend
nano /var/www/bl-management/serve-frontend.js
```

Add the following content:
```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 80;

// Enable CORS for API requests
app.use(cors());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve the index.html file for any route (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
});
```

```bash
# Install Express and CORS for the frontend server
npm install express cors

# Start frontend with PM2
pm2 start serve-frontend.js --name "bl-frontend" -e /var/log/bl-frontend-err.log -o /var/log/bl-frontend-out.log

# Check if the frontend is running
pm2 status

# Save PM2 configuration
pm2 save
```

### 6. Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 3001  # Backend API
sudo ufw allow 443   # HTTPS (if using SSL)
sudo ufw --force enable
```

### 7. Set Up Auto-Restart and Monitoring

```bash
# Set up PM2 to restart processes if they crash
pm2 startup
pm2 save

# Monitor the applications
pm2 monit
```

### 8. Configure Environment Variables for Production

Ensure your environment variables are properly set for production:

1. Backend `.env.production` should contain:
   - Secure JWT secret
   - Correct CORS origin
   - Production database credentials
   - Proper port configuration

2. Frontend API URL should point to your VPS IP or domain

### 9. Testing the Deployment

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Check if frontend is being served
curl http://your-vps-ip

# Check PM2 status
pm2 status
pm2 logs
```

### 10. SSL Certificate (Optional but Recommended)

For production use, you should set up SSL. You can use Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot

# Obtain SSL certificate (you'll need a domain)
sudo certbot certonly --standalone -d yourdomain.com

# Update the Express server to use HTTPS
```

## Updating the Application

To update the application:

```bash
# Pull the latest code
cd /var/www/bl-management
git pull

# Update backend
cd backend
npm install
npm run build
pm2 restart bl-backend

# Update frontend
cd ..
npm install
npm run build
pm2 restart bl-frontend
```

## Troubleshooting

1. **Check application logs**:
   ```bash
   pm2 logs
   ```

2. **Check if ports are in use**:
   ```bash
   sudo netstat -tulpn | grep :3001
   sudo netstat -tulpn | grep :80
   ```

3. **Restart applications**:
   ```bash
   pm2 restart all
   ```

4. **Check application status**:
   ```bash
   pm2 status
   pm2 monit
   ```

## Security Considerations

1. Use strong, unique passwords for all services
2. Keep your system and packages updated
3. Use a firewall to restrict access to only necessary ports
4. Use environment variables for sensitive configuration
5. Consider implementing rate limiting and other security measures
6. Regularly backup your data and configuration files

## Backup and Recovery

1. Regularly backup your:
   - Application code
   - Environment files
   - Database (if using local database)
   - PM2 configuration

2. Create backup scripts:
   ```bash
   # Backup script example
   tar -czf bl-management-backup-$(date +%Y%m%d).tar.gz /var/www/bl-management
   ```

This deployment guide provides a complete solution for running the BL Management application on a VPS without Nginx. The application will be accessible via your VPS IP address or domain name.