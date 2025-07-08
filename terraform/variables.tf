variable "aws_region" {
  description = "AWS region to deploy resources in."
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Name for the ECS application."
  type        = string
  default     = "c64gotd"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
  default     = "478993292699"
}
