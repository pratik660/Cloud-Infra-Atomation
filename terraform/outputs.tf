output "instance_ip" {
  value = aws_instance.devops_server.public_ip
}

output "bucket_name" {
  value = aws_s3_bucket.bucket.bucket
}

output "vpc_id" {
  value = aws_vpc.main.id
}