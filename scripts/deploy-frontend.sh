#!/bin/bash
# Deploy frontend static site to S3 and invalidate CloudFront cache
# Usage: ./scripts/deploy-frontend.sh <s3-bucket-name> <cloudfront-distribution-id>

set -e

BUCKET="$1"
DISTRIBUTION_ID="$2"

if [ -z "$BUCKET" ] || [ -z "$DISTRIBUTION_ID" ]; then
  echo "Usage: $0 <s3-bucket-name> <cloudfront-distribution-id>"
  exit 1
fi

# Build frontend
cd "$(dirname "$0")/../frontend"
echo "Installing all dependencies (including devDependencies)..."
npm ci

echo "Building frontend..."
npm run build

echo "Pruning devDependencies for production..."
npm prune --production

# Sync to S3
cd dist
cd ../..
echo "Syncing to S3 bucket: $BUCKET ..."
aws s3 sync ./frontend/dist "s3://$BUCKET" --delete

# Invalidate CloudFront
if [ -n "$DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront distribution: $DISTRIBUTION_ID ..."
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
fi

echo "Frontend deployment complete."
