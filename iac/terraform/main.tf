# ── Droplet ───────────────────────────────────────────────────────────────────

resource "digitalocean_droplet" "agrosense" {
  name   = var.droplet_name
  region = var.region
  size   = var.droplet_size
  image  = "ubuntu-22-04-x64"

  ssh_keys = [var.ssh_key_fingerprint]

  tags = ["agrosense", "k3s"]
}

# ── Firewall ──────────────────────────────────────────────────────────────────

resource "digitalocean_firewall" "agrosense" {
  name        = "agrosense-firewall"
  droplet_ids = [digitalocean_droplet.agrosense.id]

  # SSH
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # HTTP
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # HTTPS
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # k3s API server (needed for remote kubectl and Jenkins deploy)
  inbound_rule {
    protocol         = "tcp"
    port_range       = "6443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Jenkins web UI
  inbound_rule {
    protocol         = "tcp"
    port_range       = "8080"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # SonarQube web UI
  inbound_rule {
    protocol         = "tcp"
    port_range       = "9000"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Allow all outbound traffic
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# ── DNS (optional) ────────────────────────────────────────────────────────────

resource "digitalocean_domain" "agrosense" {
  count = var.domain != "" ? 1 : 0
  name  = var.domain
}

resource "digitalocean_record" "root" {
  count  = var.domain != "" ? 1 : 0
  domain = digitalocean_domain.agrosense[0].name
  type   = "A"
  name   = "@"
  value  = digitalocean_droplet.agrosense.ipv4_address
  ttl    = 300
}

resource "digitalocean_record" "www" {
  count  = var.domain != "" ? 1 : 0
  domain = digitalocean_domain.agrosense[0].name
  type   = "A"
  name   = "www"
  value  = digitalocean_droplet.agrosense.ipv4_address
  ttl    = 300
}
