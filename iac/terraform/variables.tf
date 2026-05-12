variable "do_token" {
  type        = string
  description = "DigitalOcean personal access token (read+write)."
  sensitive   = true
}

variable "region" {
  type        = string
  description = "DigitalOcean datacenter region slug."
  default     = "nyc3"
}

variable "droplet_size" {
  type        = string
  description = "Droplet size slug. s-4vcpu-8gb is the minimum comfortable for this stack."
  default     = "s-4vcpu-8gb"
}

variable "ssh_key_fingerprint" {
  type        = string
  description = "Fingerprint of the SSH key already uploaded to your DigitalOcean account."
}

variable "domain" {
  type        = string
  description = "Primary domain name (e.g. agrosense.yourdomain.com). Leave empty to skip DNS records."
  default     = ""
}

variable "droplet_name" {
  type        = string
  description = "Name for the Droplet resource."
  default     = "agrosense-vps"
}
