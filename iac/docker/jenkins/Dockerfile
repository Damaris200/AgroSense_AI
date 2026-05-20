FROM jenkins/jenkins:lts

USER root

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI (so Jenkins can build images)
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
       https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
       > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/kubectl

# Pre-install Jenkins plugins via plugin manager
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

USER jenkins
