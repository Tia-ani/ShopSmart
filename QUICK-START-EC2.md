# ⚡ Quick Start - EC2 Deployment

## 1️⃣ Launch EC2 Instance (AWS Console)

1. Go to **EC2** → **Launch Instance**
2. Settings:
   - **Name**: `pawfect-server`
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance type**: t2.small
   - **Key pair**: Create new → `pawfect-key` → Download .pem file
   - **Security group**: Create new
     - Port 22 (SSH) - My IP
     - Port 80 (HTTP) - Anywhere
     - Port 3000 (Backend) - Anywhere
   - **Storage**: 20 GB
3. Click **Launch**
4. Copy **Public IPv4 address**

---

## 2️⃣ Connect to EC2

```bash
# Mac/Linux
chmod 400 ~/Downloads/pawfect-key.pem
ssh -i ~/Downloads/pawfect-key.pem ubuntu@YOUR_EC2_IP
```

---

## 3️⃣ Run Setup Script

```bash
# Download and run setup
curl -o setup.sh https://raw.githubusercontent.com/Tia-ani/ShopSmart/main/ec2-setup.sh
chmod +x setup.sh
./setup.sh

# Exit and reconnect
exit
ssh -i ~/Downloads/pawfect-key.pem ubuntu@YOUR_EC2_IP
```

---

## 4️⃣ Clone and Configure

```bash
# Clone repository
git clone https://github.com/Tia-ani/ShopSmart.git
cd ShopSmart

# Create server .env
echo "PORT=3000" > server/.env
echo "NODE_ENV=production" >> server/.env

# Create client .env (REPLACE YOUR_EC2_IP!)
echo "VITE_API_URL=http://YOUR_EC2_IP:3000" > client/.env
```

---

## 5️⃣ Deploy

```bash
# Build and start
docker-compose up -d --build

# Check status
docker ps

# View logs
docker-compose logs -f
```

---

## 6️⃣ Access Application

- **Frontend**: http://YOUR_EC2_IP
- **Backend**: http://YOUR_EC2_IP:3000

---

## 🔄 Update Deployment

```bash
cd ShopSmart
git pull origin main
docker-compose up -d --build
```

---

## 🛑 Stop Services

```bash
docker-compose down
```

---

## 📊 Monitor

```bash
# Check containers
docker ps

# View logs
docker-compose logs -f

# Check resources
docker stats
```

---

## ⚠️ Troubleshooting

**Can't connect?**
- Check security group has ports 80, 3000 open
- Check EC2 instance is running

**Docker permission denied?**
```bash
sudo usermod -aG docker ubuntu
exit
# Reconnect
```

**Port in use?**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

---

## 💰 Cost

- **t2.micro**: Free tier (750 hours/month)
- **t2.small**: ~$17/month
- **Stop when not using** to save money

---

## 🎯 Your Info

- **EC2 IP**: _______________
- **SSH**: `ssh -i pawfect-key.pem ubuntu@YOUR_IP`
- **Frontend**: `http://YOUR_IP`
- **Backend**: `http://YOUR_IP:3000`
