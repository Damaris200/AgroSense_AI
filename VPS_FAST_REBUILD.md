# VPS Fast Rebuild (k3s + Ansible)

This is a minimal, no-skip checklist to rebuild on a fresh VPS and get the app online quickly.

## 0) Prereqs
- You have VPS IP, SSH key, and domain DNS access.
- Docker images are already pushed to Docker Hub with the tags referenced in the Kubernetes manifests.
- You have the Ansible vault password for secrets.

## 1) Point the domain to the VPS
- Add an A record to your domain:
  - Name: @
  - Type: A
  - Value: <VPS_IP>
- Wait for DNS to propagate.

## 2) Update ingress host to your domain
- Edit iac/k8s/ingress.yaml and replace the host with your domain.
- Also update the TLS host and secret name if needed.

## 3) Provision and deploy with Ansible
From the repo root:

1) Add VPS IP to iac/ansible/inventory.ini
2) Ensure secrets are in iac/ansible/group_vars/agrosense_vps/vault.yml (encrypted)
3) Run:

ansible-playbook -i iac/ansible/inventory.ini iac/ansible/site.yml --ask-vault-pass

This installs Docker, k3s, NGINX, and applies the Kubernetes manifests.

## 4) Verify pods and ingress
Run on the VPS (or from your machine if kubeconfig is set):

kubectl get nodes
kubectl get pods -n agrosense
kubectl get pods -n monitoring
kubectl get ingress -n agrosense

Pods should show READY like 1/1 (or 2/2 for replicated deployments).

## 5) Monitoring
If monitoring is not deployed by Ansible, apply it manually:

kubectl apply -k iac/k8s/monitoring/

Then check:

kubectl get svc -n monitoring

## 6) Quick smoke test
- Open https://<your-domain>/
- Call https://<your-domain>/api/health (or your API health endpoint)

## 7) If something is crash-looping
- Check logs:

kubectl logs -n agrosense <pod-name>

- Describe pod:

kubectl describe pod -n agrosense <pod-name>

- Common causes: missing env vars, wrong image tag, bad liveness/readiness probe, or DB/Kafka not ready.
