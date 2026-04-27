# AWS Deployment Guide - Pawfect FurEver

## Prerequisites
- AWS Account
- AWS CLI installed and configured
- GitHub repository secrets configured

## Step 1: Create ECR Repositories

```bash
# Create ECR repository for client
aws ecr create-repository \
    --repository-name pawfect-client \
    --region us-east-1

# Create ECR repository for server
aws ecr create-repository \
    --repository-name pawfect-server \
    --region us-east-1
```

## Step 2: Create ECS Cluster

```bash
aws ecs create-cluster \
    --cluster-name pawfect-cluster \
    --region us-east-1
```

## Step 3: Create Task Execution Role

```bash
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://task-execution-role.json

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

## Step 4: Register Task Definitions

### Server Task Definition
```bash
aws ecs register-task-definition \
    --cli-input-json file://server-task-definition.json
```

### Client Task Definition
```bash
aws ecs register-task-definition \
    --cli-input-json file://client-task-definition.json
```

## Step 5: Create ECS Services

### Server Service
```bash
aws ecs create-service \
    --cluster pawfect-cluster \
    --service-name pawfect-server-service \
    --task-definition pawfect-server-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}"
```

### Client Service
```bash
aws ecs create-service \
    --cluster pawfect-cluster \
    --service-name pawfect-client-service \
    --task-definition pawfect-client-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}"
```

## Step 6: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

## Step 7: Push to GitHub

```bash
git add .
git commit -m "feat: add AWS ECS deployment"
git push origin main
```

The CI/CD pipeline will automatically:
1. Run tests
2. Build Docker images
3. Push to ECR with tags (commit SHA + latest)
4. Update ECS services with new images

## Tagging Strategy

- **Commit SHA**: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/pawfect-client:abc123`
- **Latest**: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/pawfect-client:latest`

## Monitoring

Check deployment status:
```bash
# Check ECS services
aws ecs describe-services --cluster pawfect-cluster --services pawfect-server-service pawfect-client-service

# Check running tasks
aws ecs list-tasks --cluster pawfect-cluster

# View logs
aws logs tail /ecs/pawfect-server --follow
aws logs tail /ecs/pawfect-client --follow
```
