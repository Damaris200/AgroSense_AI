#!/bin/bash
# Run this script once on the fresh DigitalOcean VPS after `terraform apply`.
# Usage:  ssh root@YOUR_VPS_IP 'bash -s' < iac/scripts/setup-vps.sh
set -euo pipefail

echo "=== [1/4] Installing Docker ==="
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker
echo "Docker installed: $(docker --version)"

echo ""
echo "=== [2/4] Installing kubectl ==="
snap install kubectl --classic
echo "kubectl installed: $(kubectl version --client --short 2>/dev/null)"

echo ""
echo "=== [3/4] Creating directories ==="
mkdir -p /opt/agrosense/{k8s,docker}
echo "Directories created."

echo ""
echo "=== [4/4] Done ==="
echo ""
echo "Next steps:"
echo "  1. Upload project files:  tar --exclude='node_modules' --exclude='.git' --exclude='*.log' -czf - . | ssh root@\$(hostname -I | awk '{print \$1}') 'mkdir -p ~/AgroSense_AI && tar -xzf - -C ~/AgroSense_AI'"
echo "  2. Copy K8s manifests:    cp -r ~/AgroSense_AI/iac/k8s/* /opt/agrosense/k8s/"
echo "  3. Start Jenkins+SonarQube: cd ~/AgroSense_AI/iac/docker && docker compose up -d"
echo "  4. Run Ansible playbook from your local machine to install k3s."
echo ""
echo "IMPORTANT: Do NOT install minikube or kops on this VPS."
echo "           k3s is installed by the Ansible playbook — it is the right tool for this single-node setup."
