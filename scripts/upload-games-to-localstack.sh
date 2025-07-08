#!/bin/bash
set -e

# Load environment variables from backend/.env.dev
if [ -f backend/.env.dev ]; then
  export $(grep -v '^#' backend/.env.dev | xargs)
fi

# Use localstack endpoint and dummy credentials
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}
export AWS_DEFAULT_REGION=${AWS_REGION:-us-east-1}

BUCKET="${S3_BUCKET_NAME:-c64gotd-local}"
ENDPOINT_URL="${S3_ENDPOINT_URL:-http://localhost:4566}"

# Wait for LocalStack S3 endpoint to be up
until aws --endpoint-url="$ENDPOINT_URL" s3 ls > /dev/null 2>&1; do
  echo "Waiting for LocalStack S3 endpoint..."
  sleep 2
done

# Create the bucket if it doesn't exist
if ! aws --endpoint-url="$ENDPOINT_URL" s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "Bucket $BUCKET does not exist. Creating..."
  aws --endpoint-url="$ENDPOINT_URL" s3api create-bucket --bucket "$BUCKET"
fi

# Apply CORS config if file exists
if [ -f /scripts/s3-cors.json ]; then
  echo "Applying S3 CORS configuration to bucket: $BUCKET"
  aws --endpoint-url="$ENDPOINT_URL" s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration file:///scripts/s3-cors.json
else
  echo "s3-cors.json not found, skipping CORS configuration."
fi

# Upload all games, preserving directory structure
aws --endpoint-url "$ENDPOINT_URL" s3 sync /games/ "s3://$BUCKET/games/"
