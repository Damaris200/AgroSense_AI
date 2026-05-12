terraform {
  required_version = ">= 1.5"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }

  # Optional: store state remotely so teammates share it
  # backend "s3" {
  #   endpoint = "https://nyc3.digitaloceanspaces.com"
  #   bucket   = "agrosense-tfstate"
  #   key      = "terraform.tfstate"
  #   region   = "us-east-1"   # required but ignored by DO Spaces
  #   skip_credentials_validation = true
  #   skip_metadata_api_check     = true
  # }
}

provider "digitalocean" {
  token = var.do_token
}
