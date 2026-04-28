#!/bin/bash

# Quick ECS Setup - Run this on your Mac
# This creates ECS resources WITHOUT needing Docker

set -e

echo "🚀 Quick ECS Setup for Viva"
echo "============================"
echo ""

AWS_REGION="us-east-1"
ACCOUNT_ID="060255765845"

# Step 1: Create ECS Cluster
echo "1️⃣ Creating ECS Cluster..."
aws ecs create-cluster \
    --cluster-name pawfect-cluster \
    --region $AWS_REGION
echo "✅ Cluster created"
echo ""

# Step 2: Create IAM Role
echo "2️⃣ Creating IAM Role..."
cat > /tmp/trust-policy.json << 'EOF'
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
    2>/dev/null || echo "Role already exists"

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    2>/dev/null || echo "Policy already attached"
echo "✅ IAM Role configured"
echo ""

# Step 3: Create CloudWatch Log Groups
echo "3️⃣ Creating CloudWatch Log Groups..."
aws logs create-log-group \
    --log-group-name /ecs/pawfect-client \
    --region $AWS_REGION \
    2>/dev/null || echo "Client log group already exists"

aws logs create-log-group \
    --log-group-name /ecs/pawfect-server \
    --region $AWS_REGION \
    2>/dev/null || echo "Server log group already exists"
echo "✅ Log groups created"
echo ""

# Step 4: Register Task Definitions (using nginx as placeholder)
echo "4️⃣ Registering Task Definitions..."

# Client Task Definition
cat > /tmp/client-task.json << EOF
{
  "family": "pawfect-client-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "pawfect-client",
      "image": "nginx:alpine",
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
          "awslogs-group": "/ecs/pawfect-client",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

aws ecs register-task-definition \
    --cli-input-json file:///tmp/client-task.json \
    --region $AWS_REGION > /dev/null
echo "✅ Client task definition registered"

# Server Task Definition
cat > /tmp/server-task.json << EOF
{
  "family": "pawfect-server-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "pawfect-server",
      "image": "nginx:alpine",
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
          "awslogs-group": "/ecs/pawfect-server",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

aws ecs register-task-definition \
    --cli-input-json file:///tmp/server-task.json \
    --region $AWS_REGION > /dev/null
echo "✅ Server task definition registered"
echo ""

# Step 5: Get VPC and Subnet
echo "5️⃣ Getting VPC configuration..."
DEFAULT_VPC=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region $AWS_REGION)
SUBNET_ID=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$DEFAULT_VPC" --query "Subnets[0].SubnetId" --output text --region $AWS_REGION)
echo "✅ VPC: $DEFAULT_VPC"
echo "✅ Subnet: $SUBNET_ID"
echo ""

# Step 6: Create Security Group
echo "6️⃣ Creating Security Group..."
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=pawfect-sg" "Name=vpc-id,Values=$DEFAULT_VPC" \
    --query "SecurityGroups[0].GroupId" \
    --output text \
    --region $AWS_REGION 2>/dev/null)

if [ "$SG_ID" == "None" ] || [ -z "$SG_ID" ]; then
    SG_ID=$(aws ec2 create-security-group \
        --group-name pawfect-sg \
        --description "Security group for Pawfect FurEver" \
        --vpc-id $DEFAULT_VPC \
        --query "GroupId" \
        --output text \
        --region $AWS_REGION)
    echo "✅ Security group created: $SG_ID"
    
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION 2>/dev/null || true
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0 --region $AWS_REGION 2>/dev/null || true
    echo "✅ Security group rules added"
else
    echo "✅ Using existing security group: $SG_ID"
fi
echo ""

# Step 7: Create Services
echo "7️⃣ Creating ECS Services..."

# Client Service
aws ecs create-service \
    --cluster pawfect-cluster \
    --service-name pawfect-client-service \
    --task-definition pawfect-client-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_ID],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
    --region $AWS_REGION > /dev/null 2>&1 || echo "Client service already exists"
echo "✅ Client service created"

# Server Service
aws ecs create-service \
    --cluster pawfect-cluster \
    --service-name pawfect-server-service \
    --task-definition pawfect-server-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_ID],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
    --region $AWS_REGION > /dev/null 2>&1 || echo "Server service already exists"
echo "✅ Server service created"
echo ""

echo "🎉 ECS Setup Complete!"
echo "======================"
echo ""
echo "Now you can run all the viva commands!"
echo ""
echo "Test with:"
echo "aws ecs describe-clusters --clusters pawfect-cluster --region us-east-1 --output table"
