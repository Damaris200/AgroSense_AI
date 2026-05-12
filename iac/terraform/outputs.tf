output "droplet_ip" {
  description = "Public IPv4 address of the AgroSense VPS."
  value       = digitalocean_droplet.agrosense.ipv4_address
}

output "droplet_id" {
  description = "DigitalOcean Droplet ID."
  value       = digitalocean_droplet.agrosense.id
}

output "ssh_command" {
  description = "SSH command to connect to the VPS."
  value       = "ssh root@${digitalocean_droplet.agrosense.ipv4_address}"
}

output "ansible_inventory_hint" {
  description = "Paste this IP into iac/ansible/inventory.ini."
  value       = "agrosense ansible_host=${digitalocean_droplet.agrosense.ipv4_address} ansible_user=root"
}
