# AgroSense AI — Ansible IaC (full VPS recovery)

This rebuilds the **entire** AgroSense AI stack on a fresh Ubuntu VPS from
nothing. Use it to recover after a VPS crash. **IP-only access — no domain, no
HTTPS.** You open the app at the server's IP.

## What `site.yml` provisions

1. **common**  — system update, packages, UFW firewall, swap off, UTC
2. **docker**  — Docker Engine
3. **k3s**     — single-node Kubernetes + NGINX Ingress, served on the droplet's
   own IP via k3s's built-in ServiceLB (Klipper) — no external load balancer
4. **agrosense** — K8s secrets from vault, then **all microservices + frontend +
   Grafana + Prometheus as pods**, ingress (host-less, HTTP), HPA
5. **jenkins** — builds and runs the **Jenkins CI dashboard** as a Docker
   container on the droplet at `:8080`

End state: frontend + API as pods, Grafana/Prometheus as pods, Jenkins on :8080.

## Prerequisites

- A **fresh Ubuntu 22.04+ DigitalOcean droplet** with your SSH key installed.
- A **Linux control node** to run Ansible from. Ansible does **not** run natively
  on Windows — use **WSL** (`wsl --install`, then `sudo apt install -y ansible
  rsync`) or run from any Linux box.

## Step-by-step recovery

```bash
# 0. From WSL/Linux, install tooling
sudo apt update && sudo apt install -y ansible rsync

# 1. Put your droplet's IP in the inventory
#    Edit iac/ansible/inventory.ini and replace <NEW_VPS_IP> with the real IP.

# 2. Confirm SSH works (accept the host key once)
ssh root@<NEW_VPS_IP> 'echo connected'

# 3. Run the full provision (one command; ~10-15 min).
#    vault.yml is currently PLAINTEXT, so do NOT pass --ask-vault-pass.
bash iac/scripts/recover.sh

#    Or run Ansible directly:
#    cd iac/ansible && ansible-playbook -i inventory.ini site.yml
#    Syntax check only:  ansible-playbook -i inventory.ini site.yml --syntax-check
```

## Access (after the run)

Everything runs on your **droplet's own IP** — one IP, plain HTTP, no domain.

```bash
export KUBECONFIG=~/.kube/agrosense-k3s.yaml   # fetched automatically by the run
kubectl get pods -A
kubectl get svc ingress-nginx-controller -n ingress-nginx   # EXTERNAL-IP = droplet IP
```

- App:        `http://<DROPLET-IP>/`
- Grafana:    `http://<DROPLET-IP>/grafana`
- Prometheus: `http://<DROPLET-IP>/prometheus`
- Jenkins:    `http://<DROPLET-IP>:8080` (initial admin password is printed by the
  run, or: `ssh root@<DROPLET-IP> docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`)

## ⚠️ Security: rotate + encrypt secrets

`group_vars/agrosense_vps/vault.yml` is committed **unencrypted** and holds live
credentials (DigitalOcean token, OpenAI key, Neon/Mongo passwords, SMTP). After
recovery:

1. Rotate every key/password at its provider.
2. Encrypt the file:  `ansible-vault encrypt group_vars/agrosense_vps/vault.yml`
3. From then on run with `--ask-vault-pass` and edit via `ansible-vault edit`.

## Note on `playbook.yml`

`playbook.yml` is the **older, deprecated** all-in-one docker-compose path. The
supported recovery path is `site.yml` (Kubernetes). Don't run both against the
same host — they fight over ports 80/443.
