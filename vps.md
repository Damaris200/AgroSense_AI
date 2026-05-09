# SOFTWARE ARCHITECTURE PROJECT-BASED EXAM GUIDE

## Course: SEN3244 – Software Architecture

## Spring 2026

---

# 1. OVERVIEW OF THE EXAM

You are required to design and implement an innovative software architecture solution for a real-world problem.

You can work:

- Individually
- Or in a team of maximum 4 members

The project must demonstrate:

- Real-world problem solving
- Software architecture principles
- DevOps practices
- Cloud infrastructure
- CI/CD
- Monitoring
- Testing
- Kubernetes orchestration
- Documentation

---

# 2. MARKING SCHEME BREAKDOWN

| Section                              | Marks |
| ------------------------------------ | ----- |
| Infrastructure Setup                 | 15    |
| Scrum Application                    | 5     |
| Jenkins CI/CD                        | 10    |
| Monitoring with Prometheus & Grafana | 2.5   |
| Infrastructure as Code with Ansible  | 2.5   |
| Robust Testing                       | 10    |
| Kubernetes Orchestration             | 15    |
| Architecture Structures              | 20    |
| Project Innovation                   | 10    |
| Documentation                        | 15    |

---

# 3. INFRASTRUCTURE SETUP (15 MARKS)

## What You Must Do

You must:

- Provision a VPS or cloud server
- Configure the server
- Install technologies needed for your project
- Configure networking
- Configure firewall rules
- Configure reverse proxy
- Deploy your application

---

## Technologies You Can Use

### VPS Providers

- DigitalOcean
- AWS EC2
- Azure VM
- Google Cloud
- Linode
- Vultr

---

## Technologies Expected

### Web Server / Reverse Proxy

- NGINX
- Apache

### Containers

- Docker

### Orchestration

- Kubernetes
- Docker Compose

### Networking

- Ports
- Firewall rules
- Domain configuration

---

## Expected Deliverables

### Required

- Infrastructure diagram
- Deployment screenshots
- Public links

### Optional but Appreciated

- Terraform scripts
- Bash automation scripts

---

# 4. APPLICATION OF SCRUM (5 MARKS)

## What is Scrum?

Scrum is an Agile project management methodology.

It organizes development into:

- small iterations
- collaborative teamwork
- continuous delivery

---

## Scrum Roles

### Product Owner

Defines requirements and priorities.

### Scrum Master

Ensures Scrum process is followed.

### Development Team

Builds the system.

---

## Scrum Artifacts

### Product Backlog

List of all features.

### Sprint Backlog

Features selected for current sprint.

### Burndown Chart

Shows project progress.

---

## Tools You Can Use

- Jira
- Trello
- GitHub Projects
- Notion

---

## Deliverables

- Sprint planning document
- Team roles
- Retrospectives
- Screenshots of boards
- Burndown charts

---

# 5. CI/CD PIPELINE WITH JENKINS (10 MARKS)

## What is CI/CD?

### Continuous Integration (CI)

Automatically builds and tests code.

### Continuous Deployment (CD)

Automatically deploys applications.

---

## What You Must Implement

- Build automation
- Test automation
- Deployment automation
- GitHub integration

---

## Pipeline Flow

```text
Developer Pushes Code
        |
GitHub Repository
        |
Jenkins Pipeline
        |
Run Tests
        |
SonarQube Analysis
        |
Docker Build
        |
Deploy to Kubernetes
```
