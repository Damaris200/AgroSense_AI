FROM jenkins/jenkins:lts-jdk17

USER root

RUN apt-get update \
    && apt-get -y upgrade \
    && apt-get install -y --no-install-recommends \
       curl git unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://get.docker.com | sh

RUN curl -fsSL https://bun.sh/install | bash \
    && cp /root/.bun/bin/bun /usr/local/bin/bun \
    && cp /root/.bun/bin/bunx /usr/local/bin/bunx \
    && chmod +x /usr/local/bin/bun /usr/local/bin/bunx

RUN usermod -aG docker jenkins

USER jenkins
