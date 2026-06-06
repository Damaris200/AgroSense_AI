#!/usr/bin/env bash
# AgroSense AI — one-shot VPS recovery.
#
# Run from a Linux/WSL control node (NOT Windows PowerShell):
#   bash iac/scripts/recover.sh
#
# It validates prerequisites, then runs the full Ansible provision (site.yml):
# system -> Docker -> k3s -> all app/monitoring pods -> Jenkins container.
set -euo pipefail

cd "$(dirname "$0")/../ansible"

# Never stall on an interactive SSH host-key prompt during a live demo.
export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_FORCE_COLOR=1

echo "=== AgroSense AI recovery ==="

# 1. Tooling
for bin in ansible-playbook ssh rsync; do
  command -v "$bin" >/dev/null 2>&1 || {
    echo "ERROR: '$bin' not found. On WSL/Ubuntu: sudo apt update && sudo apt install -y ansible rsync openssh-client"
    exit 1
  }
done

# 2. Inventory must have a real IP, not the placeholder
if grep -q '<NEW_VPS_IP>' inventory.ini; then
  echo "ERROR: edit iac/ansible/inventory.ini and replace <NEW_VPS_IP> with your droplet's public IP."
  exit 1
fi

VPS_IP="$(awk '/ansible_host=/{for(i=1;i<=NF;i++) if($i ~ /^ansible_host=/){sub(/ansible_host=/,"",$i); print $i}}' inventory.ini | head -1)"
echo "Target VPS: ${VPS_IP}"

# 3. SSH reachability
echo "Checking SSH..."
ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new \
  "root@${VPS_IP}" 'echo "  SSH OK: $(hostname)"' || {
    echo "ERROR: cannot SSH to root@${VPS_IP}. Confirm the droplet is up and your key is installed."
    exit 1
  }

# 4. Syntax check, then run
echo "Validating playbook syntax..."
ansible-playbook -i inventory.ini site.yml --syntax-check

echo "Running full provision (this takes ~10-15 min)..."
ansible-playbook -i inventory.ini site.yml "$@"

# Resolve the IP the ingress is served on. With k3s ServiceLB (Klipper) this is
# the droplet's own IP. The run saved a kubeconfig locally; query the Service.
KUBECONFIG_LOCAL="${HOME}/.kube/agrosense-k3s.yaml"
LB_IP=""
if [ -f "$KUBECONFIG_LOCAL" ]; then
  LB_IP="$(KUBECONFIG="$KUBECONFIG_LOCAL" kubectl get svc ingress-nginx-controller \
    -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)"
fi
# Fall back to the droplet IP from the inventory if the lookup is empty.
[ -z "$LB_IP" ] && LB_IP="$VPS_IP"

cat <<EOF

=== Done — everything is live (IP-only, no domain) ===

Verify the pods:
  export KUBECONFIG=${KUBECONFIG_LOCAL}
  kubectl get pods -A
  kubectl get svc ingress-nginx-controller -n ingress-nginx

Open in your browser (plain HTTP, no domain):
  App         http://${LB_IP}/
  Grafana     http://${LB_IP}/grafana
  Prometheus  http://${LB_IP}/prometheus
  Jenkins     http://${VPS_IP}:8080   (runs directly on the droplet)

Jenkins initial admin password (also printed during the run):
  ssh root@${VPS_IP} docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
EOF
