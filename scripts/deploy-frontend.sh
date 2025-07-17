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

echo "Cleaning previous build..."
rm -rf dist

echo "Installing dependencies..."
npm ci

echo "Building frontend for production..."
NODE_ENV=production npm run build -- --mode prod

echo "Verifying build output..."
if [ ! -d "dist" ]; then
  echo "Error: Build failed - dist directory not found"
  exit 1
fi

echo "Build completed successfully. Contents:"
ls -la dist/

# Sync to S3
echo "Syncing to S3 bucket: $BUCKET ..."
aws s3 sync ./dist "s3://$BUCKET" --delete --exclude "*.map"

# Invalidate CloudFront
if [ -n "$DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront distribution: $DISTRIBUTION_ID ..."
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
fi

echo "Frontend deployment complete."
