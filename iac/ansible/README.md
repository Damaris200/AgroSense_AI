# AgroSense AI - Ansible IaC

This Ansible playbook automates the full infrastructure setup for AgroSense AI.

## What it does
- Installs all system dependencies (Docker, k3s, kubectl, Bun, Nginx)
- Configures UFW firewall rules for all services
- Clones the repository and deploys all microservices via Docker Compose
- Verifies all containers are running
- Configures Kubernetes (k3s)

## Usage
```bash
# Install Ansible
pip install ansible

# Run the playbook
ansible-playbook -i inventory.ini playbook.yml
```

## Requirements
- Ubuntu 22.04+ target server
- SSH access to the server
- .env file with all required credentials
