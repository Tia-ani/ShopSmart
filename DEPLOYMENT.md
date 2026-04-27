# 🚀 Quick Deployment Guide

## What You Have Now

✅ **Dockerfiles** (Section 3.1)
- `client/Dockerfile` - Multi-stage build with nginx
- `server/Dockerfile` - Node.js production image

✅ **CI/CD Workflow** (Section 3.2)
- `.github/workflows/ci-cd.yml` - Automated pipeline

✅ **Build & Push** (Section 3.3)
- Automatic Docker build and push to ECR
- Tagging: `<commit-sha>` and `latest`

✅ **Full Automation** (Section 3.4)
- Auto-deploy on push to main
- ECS service updates

## Quick Start (5 Minutes)

### 1. Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Region: us-east-1
# Output format: json
```

### 2. Run Automated Setup
```bash
./deploy.sh
```

This creates:
- ✅ ECR Repositories (Section 1.1, 1.2)
- ✅ ECS Cluster (Section 2.1)
- ✅ Task Definitions (Section 2.2)
- ✅ IAM Roles
- ✅ CloudWatch Logs

### 3. Get VPC Details
```bash
# Get subnet ID
aws ec2 describe-subnets --query 'Subnets[0].SubnetId' --output text

# Get security group ID
aws ec2 describe-security-groups --query 'SecurityGroups[0].GroupId' --output text
```

### 4. Create ECS Services (Section 2.3)

**Server Service:**
```bash
aws ecs create-service \
    --cluster pawfect-cluster \
    --service-name pawfect-server-service \
    --task-definition pawfect-server-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[YOUR_SUBNET_ID],securityGroups=[YOUR_SG_ID],assignPublicIp=ENABLED}"
```

**Client Service:**
```bash
aws ecs create-service \
    --cluster pawfect-cluster \
    --service-name pawfect-client-service \
    --task-definition pawfect-client-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[YOUR_SUBNET_ID],securityGroups=[YOUR_SG_ID],assignPublicIp=ENABLED}"
```

### 5. Add GitHub Secrets

Go to: `https://github.com/Tia-ani/ShopSmart/settings/secrets/actions`

Add:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### 6. Push and Deploy
```bash
git add .
git commit -m "feat: add AWS ECS deployment configuration"
git push origin main
```

## Rubrics Coverage

### Section 1: Amazon ECR (3 Marks)
- ✅ 1.1 ECR Repo Setup: `deploy.sh` creates repos
- ✅ 1.2 Image Pushed: CI/CD pushes images automatically
- ✅ 1.3 Tagging Strategy: `<commit-sha>` + `latest`

### Section 2: Amazon ECS (3 Marks)
- ✅ 2.1 ECS Cluster: `pawfect-cluster`
- ✅ 2.2 Task Definition: JSON files for client/server
- ✅ 2.3 Service Running: Created via AWS CLI

### Section 3: CI/CD Pipeline (4 Marks)
- ✅ 3.1 Dockerfile: Simple, production-ready
- ✅ 3.2 Workflow File: GitHub Actions with AWS integration
- ✅ 3.3 Build & Push: Automated to ECR
- ✅ 3.4 Full Automation: Push to main = auto-deploy

## Verify Deployment

```bash
# Check services
aws ecs describe-services --cluster pawfect-cluster --services pawfect-server-service pawfect-client-service

# Check tasks
aws ecs list-tasks --cluster pawfect-cluster

# View logs
aws logs tail /ecs/pawfect-server --follow
```

## Get Public URLs

```bash
# Get task IDs
aws ecs list-tasks --cluster pawfect-cluster --query 'taskArns[0]' --output text

# Get task details (includes public IP)
aws ecs describe-tasks --cluster pawfect-cluster --tasks <TASK_ARN>
```

Access:
- Frontend: `http://<client-public-ip>`
- Backend: `http://<server-public-ip>:3000`
