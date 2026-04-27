# 🚀 EC2 Deployment Guide - Pawfect FurEver

## Step-by-Step EC2 Deployment Process

### **Step 1: Launch EC2 Instance**

1. Go to AWS Console → Search **"EC2"** → Click "EC2"
2. Click **"Launch Instance"**
3. Fill in:

   **Name and tags:**
   - Name: `pawfect-server`

   **Application and OS Images (AMI):**
   - Select: **Ubuntu Server 22.04 LTS** (Free tier eligible)

   **Instance type:**
   - Select: **t2.micro** (Free tier eligible)
   - Or **t2.small** (better performance)

   **Key pair (login):**
   - Click **"Create new key pair"**
   - Key pair name: `pawfect-key`
   - Key pair type: RSA
   - Private key format: .pem
   - Click **"Create key pair"**
   - **SAVE THE .pem FILE** - you'll need it to SSH

   **Network settings:**
   - Click **"Edit"**
   - Auto-assign public IP: **Enable**
   - Firewall (security groups): **Create security group**
   - Security group name: `pawfect-sg`
   - Description: `Security group for Pawfect FurEver`
   
   **Add these inbound rules:**
   - Rule 1: SSH, Port 22, Source: My IP (for your access)
   - Rule 2: HTTP, Port 80, Source: Anywhere (0.0.0.0/0)
   - Rule 3: Custom TCP, Port 3000, Source: Anywhere (0.0.0.0/0)
   - Rule 4: Custom TCP, Port 5173, Source: Anywhere (0.0.0.0/0)

   **Configure storage:**
   - Size: **20 GB** (minimum)
   - Volume type: gp3

4. Click **"Launch instance"**
5. Wait for instance state to be **"Running"**
6. **Copy the Public IPv4 address** (e.g., 54.123.45.67)

---

### **Step 2: Connect to EC2 Instance**

**On Mac/Linux:**
```bash
# Move key to safe location
mv ~/Downloads/pawfect-key.pem ~/.ssh/
chmod 400 ~/.ssh/pawfect-key.pem

# Connect to EC2
ssh -i ~/.ssh/pawfect-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**On Windows (PowerShell):**
```powershell
ssh -i C:\path\to\pawfect-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

### **Step 3: Install Docker on EC2**

Once connected to EC2, run these commands:

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and log back in for group changes
exit
```

**Reconnect to EC2:**
```bash
ssh -i ~/.ssh/pawfect-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

### **Step 4: Install Git and Clone Repository**

```bash
# Install Git
sudo apt install -y git

# Clone your repository
git clone https://github.com/Tia-ani/ShopSmart.git
cd ShopSmart

# Verify files
ls -la
```

---

### **Step 5: Set Up Environment Variables**

```bash
# Create server .env file
cat > server/.env << EOF
PORT=3000
NODE_ENV=production
EOF

# Create client .env file
cat > client/.env << EOF
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:3000
EOF
```

**Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP!**

---

### **Step 6: Build and Run with Docker Compose**

```bash
# Build and start all services
docker-compose up -d --build

# Check running containers
docker ps

# View logs
docker-compose logs -f
```

---

### **Step 7: Access Your Application**

- **Frontend**: `http://YOUR_EC2_PUBLIC_IP` (port 80)
- **Backend API**: `http://YOUR_EC2_PUBLIC_IP:3000`

---

## **Useful Commands**

### Check Status
```bash
# Check running containers
docker ps

# Check all containers
docker ps -a

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart server
docker-compose restart client
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Update Code
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a
```

---

## **Troubleshooting**

### Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Permission Denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Container Won't Start
```bash
# Check logs
docker-compose logs server
docker-compose logs client

# Rebuild from scratch
docker-compose down
docker-compose up --build
```

### Can't Access from Browser
1. Check EC2 security group has ports 80, 3000 open
2. Check EC2 instance is running
3. Check containers are running: `docker ps`
4. Check firewall: `sudo ufw status`

---

## **Production Best Practices**

### 1. Set Up SSL (HTTPS)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com
```

### 2. Set Up Auto-Restart
```bash
# Create systemd service
sudo nano /etc/systemd/system/pawfect.service
```

Add:
```ini
[Unit]
Description=Pawfect FurEver
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/ShopSmart
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable pawfect
sudo systemctl start pawfect
```

### 3. Set Up Monitoring
```bash
# Install monitoring tools
docker run -d --name=cadvisor \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest
```

---

## **Cost Optimization**

- Use **t2.micro** for testing (free tier)
- Use **t2.small** for production ($0.023/hour)
- Stop instance when not in use
- Use Elastic IP to keep same IP address

---

## **Quick Reference**

| Service | Port | URL |
|---------|------|-----|
| Frontend | 80 | http://YOUR_EC2_IP |
| Backend | 3000 | http://YOUR_EC2_IP:3000 |
| MongoDB | 27017 | Internal only |

**Your EC2 Public IP:** _______________
**SSH Command:** `ssh -i ~/.ssh/pawfect-key.pem ubuntu@YOUR_EC2_IP`
