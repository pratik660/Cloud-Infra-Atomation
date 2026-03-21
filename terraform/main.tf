provider "aws" {
  region = "ap-south-1"
}

resource "aws_instance" "devops_server" {
  ami           = "ami-03f4878755434977f" # Mumbai working AMI
  instance_type = "t2.micro"

  associate_public_ip_address = true

  tags = {
    Name = "DevOpsProjectServer"
  }
}