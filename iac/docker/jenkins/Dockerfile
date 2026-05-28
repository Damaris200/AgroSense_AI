# Use the slim LTS image to reduce surface area for vulnerabilities
FROM jenkins/jenkins:lts-jdk17

USER root

# Install system deps + Docker CLI + kubectl in a single layer
RUN apt-get update \
    && apt-get -y upgrade \
    && apt-get install -y --no-install-recommends \
    curl unzip ca-certificates gnupg lsb-release openssh-client \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && curl -fsSL https://download.docker.com/linux/debian/gpg \
    | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list \
    && apt-get update && apt-get install -y --no-install-recommends docker-ce-cli \
    && curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl && mv kubectl /usr/local/bin/kubectl \
    && rm -rf /var/lib/apt/lists/*

# Install bun into a world-accessible location so the jenkins user can run it
RUN BUN_INSTALL=/usr/local curl -fsSL https://bun.sh/install | bash \
    && chmod +x /usr/local/bin/bun /usr/local/bin/bunx

# Add jenkins user to the docker group so it can access /var/run/docker.sock
RUN groupadd -f docker && usermod -aG docker jenkins

# Pre-install Jenkins plugins
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

USER jenkins
