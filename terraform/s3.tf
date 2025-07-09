resource "aws_s3_bucket" "games" {
  bucket = "${var.app_name}-games-storage"
  force_destroy = false
  tags = {
    Name        = "${var.app_name}-games-storage"
    Environment = "dev"
    Project     = "c64gotd"
  }
}

resource "aws_s3_bucket_policy" "games" {
  bucket = aws_s3_bucket.games.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid = "AllowCloudFrontServicePrincipalReadOnly",
        Effect = "Allow",
        Principal = { Service = "cloudfront.amazonaws.com" },
        Action = ["s3:GetObject"],
        Resource = ["${aws_s3_bucket.games.arn}/*"],
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${aws_cloudfront_distribution.frontend.id}"
          }
        }
      }
    ]
  })
}


resource "aws_s3_bucket_public_access_block" "games" {
  bucket = aws_s3_bucket.games.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "games" {
  bucket = aws_s3_bucket.games.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = [
      "https://${aws_cloudfront_distribution.frontend.domain_name}",
      "https://c64gotd.com",
      "https://www.c64gotd.com"
    ]
    expose_headers  = []
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket" "frontend" {
  tags = {
    Name        = "c64gotd-frontend-478993292699"
    Environment = "prod"
    Project     = "c64gotd"
  }
  bucket = "c64gotd-frontend-478993292699"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls  = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid = "AllowCloudFrontServicePrincipalReadOnly",
        Effect = "Allow",
        Principal = { Service = "cloudfront.amazonaws.com" },
        Action = ["s3:GetObject"],
        Resource = ["${aws_s3_bucket.frontend.arn}/*"],
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${aws_cloudfront_distribution.frontend.id}"
          }
        }
      }
    ]
  })
}

data "aws_caller_identity" "current" {}
