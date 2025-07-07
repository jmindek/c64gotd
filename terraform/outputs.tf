output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "alb_dns_name" {
  value = aws_lb.app.dns_name
  description = "DNS name of the Application Load Balancer."
}

output "s3_bucket_name" {
  value = aws_s3_bucket.games.id
  description = "Name of the S3 bucket for games storage."
}
