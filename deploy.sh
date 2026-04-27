#!/bin/bash

# Pawfect FurEver - AWS Deployment Script
# This script automates the AWS ECS deployment setup

set -e

echo "🐾 Pawfect FurEver - AWS Deployment Setup"
echo "=========================================="

# Variables
AWS_REGION="us-east-1"
CLUSTER_NAME="pawfect-cluster"
CLIENT_REPO="pawfect-client"
SERVER_REPO="pawfect-server"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"

# Step 1: Create ECR Repositories
echo ""
echo "Step 1: Creating ECR Repositories..."
aws ecr create-repository --repository-name $CLIENT_REPO --region $AWS_REGION 2>/dev/null || echo "Client repo already exists"
aws ecr create-repository --repository-name $SERVER_REPO --region $AWS_REGION 2>/dev/null || echo "Server repo already exists"
echo "✅ ECR Repositories created"

# Step 2: Create ECS Cluster
echo ""
echo "Step 2: Creating ECS Cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION 2>/dev/null || echo "Cluster already exists"
echo "✅ ECS Cluster created"

# Step 3: Create Task Execution Role
echo ""
echo "Step 3: Creating Task Execution Role..."
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://task-execution-role.json 2>/dev/null || echo "Role already exists"

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || echo "Policy already attached"
echo "✅ Task Execution Role created"

# Step 4: Create CloudWatch Log Groups
echo ""
echo "Step 4: Creating CloudWatch Log Groups..."
aws logs create-log-group --log-group-name /ecs/pawfect-server --region $AWS_REGION 2>/dev/null || echo "Server log group already exists"
aws logs create-log-group --log-group-name /ecs/pawfect-client --region $AWS_REGION 2>/dev/null || echo "Client log group already exists"
echo "✅ CloudWatch Log Groups created"

# Step 5: Update Task Definition files with Account ID
echo ""
echo "Step 5: Updating Task Definitions with Account ID..."
sed -i.bak "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" server-task-definition.json
sed -i.bak "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" client-task-definition.json
echo "✅ Task Definitions updated"

# Step 6: Register Task Definitions
echo ""
echo "Step 6: Registering Task Definitions..."
aws ecs register-task-definition --cli-input-json file://server-task-definition.json --region $AWS_REGION
aws ecs register-task-definition --cli-input-json file://client-task-definition.json --region $AWS_REGION
echo "✅ Task Definitions registered"

echo ""
echo "=========================================="
echo "✅ AWS Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Get your VPC subnet and security group IDs:"
echo "   aws ec2 describe-subnets --query 'Subnets[0].SubnetId' --output text"
echo "   aws ec2 describe-security-groups --query 'SecurityGroups[0].GroupId' --output text"
echo ""
echo "2. Create ECS Services (replace subnet-xxxxx and sg-xxxxx):"
echo "   aws ecs create-service --cluster $CLUSTER_NAME --service-name pawfect-server-service --task-definition pawfect-server-task --desired-count 1 --launch-type FARGATE --network-configuration \"awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}\""
echo ""
echo "3. Add GitHub Secrets:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo ""
echo "4. Push to GitHub to trigger CI/CD pipeline"
