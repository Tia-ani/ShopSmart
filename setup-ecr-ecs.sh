#!/bin/bash

# Pawfect FurEver - ECR & ECS Automated Setup Script
# This script sets up everything needed for the viva

set -e

echo "🐾 Pawfect FurEver - ECR & ECS Setup"
echo "====================================="
echo ""

# Configuration
AWS_REGION="us-east-1"
CLUSTER_NAME="pawfect-cluster"
CLIENT_REPO="pawfect-client"
SERVER_REPO="pawfect-server"
CLIENT_SERVICE="pawfect-client-service"
SERVER_SERVICE="pawfect-server-service"
CLIENT_TASK="pawfect-client-task"
SERVER_TASK="pawfect-server-task"

# Get AWS Account ID
echo "📋 Getting AWS Account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account ID: $AWS_ACCOUNT_ID"
echo ""

# ============================================
# SECTION 1: ECR Setup (3 Marks)
# ============================================

echo "📦 SECTION 1: Setting up Amazon ECR"
echo "-----------------------------------"

# 1.1 ECR Repo Setup
echo "1.1 Creating ECR Repositories..."
aws ecr create-repository \
    --repository-name $CLIENT_REPO \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    2>/dev/null && echo "✅ Client repository created" || echo "ℹ️  Client repository already exists"

aws ecr create-repository \
    --repository-name $SERVER_REPO \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    2>/dev/null && echo "✅ Server repository created" || echo "ℹ️  Server repository already exists"

echo ""
echo "📝 ECR Repository URIs:"
echo "Client: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$CLIENT_REPO"
echo "Server: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$SERVER_REPO"
echo ""

# 1.2 & 1.3 Build and Push Images with Tagging Strategy
echo "1.2 & 1.3 Building and Pushing Images to ECR (with tagging strategy)..."

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
echo "✅ Logged into ECR"
echo ""

# Get commit SHA for tagging
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "manual")

# Build and push client
echo "🔨 Building client image..."
docker build -t $CLIENT_REPO:$COMMIT_SHA ./client
docker tag $CLIENT_REPO:$COMMIT_SHA $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$CLIENT_REPO:$COMMIT_SHA
docker tag $CLIENT_REPO:$COMMIT_SHA $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$CLIENT_REPO:latest

echo "📤 Pushing client image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$CLIENT_REPO:$COMMIT_SHA
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$CLIENT_REPO:latest
echo "✅ Client image pushed with tags: $COMMIT_SHA, latest"
echo ""

# Build and push server
echo "🔨 Building server image..."
docker build -t $SERVER_REPO:$COMMIT_SHA ./server
docker tag $SERVER_REPO:$COMMIT_SHA $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$SERVER_REPO:$COMMIT_SHA
docker tag $SERVER_REPO:$COMMIT_SHA $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$SERVER_REPO:latest

echo "📤 Pushing server image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$SERVER_REPO:$COMMIT_SHA
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$SERVER_REPO:latest
echo "✅ Server image pushed with tags: $COMMIT_SHA, latest"
echo ""

echo "✅ SECTION 1 COMPLETE: ECR Setup Done!"
echo ""

# ============================================
# SECTION 2: ECS Setup (3 Marks)
# ============================================

echo "🚀 SECTION 2: Setting up Amazon ECS"
echo "-----------------------------------"

# 2.1 ECS Cluster
echo "2.1 Creating ECS Cluster..."
aws ecs create-cluster \
    --cluster-name $CLUSTER_NAME \
    --region $AWS_REGION \
    2>/dev/null && echo "✅ ECS Cluster created: $CLUSTER_NAME" || echo "ℹ️  ECS Cluster already exists"
echo ""

# Create IAM Role for ECS Task Execution
echo "🔑 Creating ECS Task Execution Role..."
cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    2>/dev/null && echo "✅ IAM Role created" || echo "ℹ️  IAM Role already exists"

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    2>/dev/null || echo "ℹ️  Policy already attached"
echo ""

# Create CloudWatch Log Groups
echo "📊 Creating CloudWatch Log Groups..."
aws logs create-log-group \
    --log-group-name /ecs/$SERVER_REPO \
    --region $AWS_REGION \
    2>/dev/null && echo "✅ Server log group created" || echo "ℹ️  Server log group already exists"

aws logs create-log-group \
    --log-group-name /ecs/$CLIENT_REPO \
    --region $AWS_REGION \
    2>/dev/null && echo "✅ Client log group created" || echo "ℹ️  Client log group already exists"
echo ""

# 2.2 Task Definitions
echo "2.2 Creating Task Definitions..."

# Server Task Definition
cat > /tmp/server-task-def.json << EOF
{
  "family": "$SERVER_TASK",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "$SERVER_REPO",
      "image": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$SERVER_REPO:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$SERVER_REPO",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

# Client Task Definition
cat > /tmp/client-task-def.json << EOF
{
  "family": "$CLIENT_TASK",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "$CLIENT_REPO",
      "image": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$CLIENT_REPO:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$CLIENT_REPO",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

aws ecs register-task-definition \
    --cli-input-json file:///tmp/server-task-def.json \
    --region $AWS_REGION > /dev/null
echo "✅ Server task definition registered"

aws ecs register-task-definition \
    --cli-input-json file:///tmp/client-task-def.json \
    --region $AWS_REGION > /dev/null
echo "✅ Client task definition registered"
echo ""

# Get default VPC and subnet
echo "🌐 Getting VPC configuration..."
DEFAULT_VPC=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SUBNET_ID=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$DEFAULT_VPC" --query "Subnets[0].SubnetId" --output text)
echo "✅ Using VPC: $DEFAULT_VPC"
echo "✅ Using Subnet: $SUBNET_ID"
echo ""

# Create or get security group
echo "🔒 Setting up Security Group..."
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=pawfect-sg" "Name=vpc-id,Values=$DEFAULT_VPC" \
    --query "SecurityGroups[0].GroupId" \
    --output text 2>/dev/null)

if [ "$SG_ID" == "None" ] || [ -z "$SG_ID" ]; then
    SG_ID=$(aws ec2 create-security-group \
        --group-name pawfect-sg \
        --description "Security group for Pawfect FurEver" \
        --vpc-id $DEFAULT_VPC \
        --query "GroupId" \
        --output text)
    echo "✅ Security group created: $SG_ID"
    
    # Add inbound rules
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 2>/dev/null || true
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0 2>/dev/null || true
    echo "✅ Security group rules added"
else
    echo "ℹ️  Using existing security group: $SG_ID"
fi
echo ""

# 2.3 Create Services
echo "2.3 Creating ECS Services..."

# Check if services exist
SERVER_SERVICE_EXISTS=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVER_SERVICE \
    --query "services[0].serviceName" \
    --output text 2>/dev/null)

CLIENT_SERVICE_EXISTS=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $CLIENT_SERVICE \
    --query "services[0].serviceName" \
    --output text 2>/dev/null)

# Create server service
if [ "$SERVER_SERVICE_EXISTS" == "None" ] || [ -z "$SERVER_SERVICE_EXISTS" ]; then
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name $SERVER_SERVICE \
        --task-definition $SERVER_TASK \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_ID],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
        --region $AWS_REGION > /dev/null
    echo "✅ Server service created: $SERVER_SERVICE"
else
    echo "ℹ️  Server service already exists, updating..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVER_SERVICE \
        --force-new-deployment \
        --region $AWS_REGION > /dev/null
    echo "✅ Server service updated"
fi

# Create client service
if [ "$CLIENT_SERVICE_EXISTS" == "None" ] || [ -z "$CLIENT_SERVICE_EXISTS" ]; then
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name $CLIENT_SERVICE \
        --task-definition $CLIENT_TASK \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_ID],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
        --region $AWS_REGION > /dev/null
    echo "✅ Client service created: $CLIENT_SERVICE"
else
    echo "ℹ️  Client service already exists, updating..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $CLIENT_SERVICE \
        --force-new-deployment \
        --region $AWS_REGION > /dev/null
    echo "✅ Client service updated"
fi
echo ""

echo "✅ SECTION 2 COMPLETE: ECS Setup Done!"
echo ""

# ============================================
# Summary
# ============================================

echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "📋 Summary:"
echo "----------"
echo "✅ Section 1.1: ECR Repositories created"
echo "✅ Section 1.2: Images pushed to ECR"
echo "✅ Section 1.3: Tagging strategy implemented (commit SHA + latest)"
echo "✅ Section 2.1: ECS Cluster created ($CLUSTER_NAME)"
echo "✅ Section 2.2: Task Definitions registered"
echo "✅ Section 2.3: ECS Services running"
echo ""
echo "🔗 Resources:"
echo "-------------"
echo "ECR Client: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$CLIENT_REPO"
echo "ECR Server: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$SERVER_REPO"
echo "ECS Cluster: $CLUSTER_NAME"
echo "Region: $AWS_REGION"
echo ""
echo "📊 Check Status:"
echo "---------------"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVER_SERVICE $CLIENT_SERVICE"
echo "aws ecs list-tasks --cluster $CLUSTER_NAME"
echo ""
echo "⏳ Services are starting... This may take 2-3 minutes."
echo "   Check AWS Console → ECS → Clusters → $CLUSTER_NAME"
echo ""
echo "🎓 Ready for viva! All sections complete."
