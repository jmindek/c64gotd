#!/bin/sh
# Entrypoint for localstack container to ensure S3 CORS is set on startup

# Start LocalStack in the background
localstack start -d

# Wait for LocalStack to be ready
until awslocal s3 ls > /dev/null 2>&1; do
  echo "Waiting for LocalStack S3..."
  sleep 2
done

# Apply S3 CORS config
if [ -f /app/s3-cors.json ]; then
  echo "Applying S3 CORS configuration to bucket: c64gotd-local"
  awslocal s3api put-bucket-cors --bucket c64gotd-local --cors-configuration file:///app/s3-cors.json
else
  echo "s3-cors.json not found, skipping CORS configuration."
fi

# Bring LocalStack to foreground
localstack logs
