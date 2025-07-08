#!/bin/bash
# Deploy backend Docker image to AWS ECR and update ECS service
# Usage: ./scripts/deploy-backend.sh <aws_account_id> <aws_region> <ecr_repo_name> <ecs_cluster> <ecs_service>

set -e

AWS_ACCOUNT_ID="$1"
AWS_REGION="$2"
ECR_REPO_NAME="$3"
ECS_CLUSTER="$4"
ECS_SERVICE="$5"

if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ] || [ -z "$ECR_REPO_NAME" ] || [ -z "$ECS_CLUSTER" ] || [ -z "$ECS_SERVICE" ]; then
  echo "Usage: $0 <aws_account_id> <aws_region> <ecr_repo_name> <ecs_cluster> <ecs_service>"
  exit 1
fi

IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest"

# Build Docker image for ECS (linux/amd64)
cd "$(dirname "$0")/../backend"
echo "Building backend Docker image for linux/amd64..."
docker buildx build --platform linux/amd64 --target prod -t $IMAGE_URI --push .

echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Pushing Docker image to ECR..."
docker push $IMAGE_URI

# Update ECS service (force new deployment)
echo "Updating ECS service..."
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment --region $AWS_REGION

echo "Backend deployment complete."
