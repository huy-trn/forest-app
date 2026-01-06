# EC2 Deployment via GitHub Actions

This repository includes a CI/CD workflow to build a Docker image and deploy the stack to an AWS EC2 instance using Docker Compose.

## Prerequisites on EC2
- Docker and Docker Compose installed.
- An SSH user with sudo privileges (used as `EC2_USER`).
- Open ports: 3000 (web) and 8080 (nominatim), 5432 (postgres) — adjust as needed.
- Persistent volumes are created by Compose (`db-data`, `nominatim-*`).

### HTTPS with Nginx + Certbot
The workflow can provision Nginx and Certbot on EC2 and configure HTTPS for your domain automatically.

Requirements:
- DNS `A`/`AAAA` record pointing your domain to the EC2 public IP.
- Additional GitHub secrets:
  - `DOMAIN_NAME`: e.g., `app.example.com`.
  - `CERTBOT_EMAIL`: email for Let's Encrypt notices.

What happens on deploy:
- Uploads Nginx config template at `deploy/nginx/app.conf.tmpl` and renders it with your `DOMAIN_NAME`.
- Restarts Nginx and runs `certbot --nginx -d <domain>` to issue/renew the certificate.
- Enables `certbot.timer` for auto-renew (Ubuntu). For Amazon Linux, adjust accordingly.

Manual setup (if not using workflow):
```bash
# Install Nginx and Certbot (Ubuntu)
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Render config (replace DOMAIN_NAME)
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled /var/www/certbot
env DOMAIN_NAME=app.example.com envsubst '$DOMAIN_NAME' < ~/apps/forest-app/deploy/nginx/app.conf.tmpl | sudo tee /etc/nginx/sites-available/forest-app
sudo ln -sf /etc/nginx/sites-available/forest-app /etc/nginx/sites-enabled/forest-app
sudo nginx -t && sudo systemctl restart nginx

# Issue certificate
sudo certbot --nginx -d app.example.com --non-interactive --agree-tos -m you@example.com
sudo systemctl enable --now certbot.timer
```

Example EC2 setup:
```bash
# On EC2
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
mkdir -p ~/apps/forest-app
```

Log out/in to apply the `docker` group.

## GitHub Secrets
Create the following repository secrets:
- `EC2_HOST`: Public IP or DNS of your EC2 instance.
- `EC2_USER`: SSH username (e.g., `ubuntu`).
- `EC2_SSH_KEY`: Private key for SSH (PEM content).
- `GHCR_USERNAME`: Your GitHub username/organization (lowercase) that owns the GHCR namespace.
- `GHCR_TOKEN`: A Personal Access Token with `read:packages`. Used on EC2 to pull images.

The workflow uses `GITHUB_TOKEN` to push to GHCR and `GHCR_TOKEN` on EC2 to pull.

## Workflow
- On push to `main`, GitHub Actions builds the Docker image from `Dockerfile` and pushes to `ghcr.io/<owner>/forest-app` with tags `latest` and the commit SHA.
- The workflow uploads `docker-compose.yml`, `docker-compose.prod.yml`, and helper scripts to `~/apps/forest-app` on EC2.
- It logs into GHCR on EC2, then runs:
  - `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

The production override file forces the `web` service to use the prebuilt image instead of building locally.

## Environment Configuration
Adjust environment values in `docker-compose.yml` for production:
- `NEXTAUTH_URL`: Set to your public URL (e.g., `https://example.com`).
- Database credentials: consider using secrets management.
- If ports differ in production, update compose accordingly.

If you enable HTTPS via Nginx, set `NEXTAUTH_URL` to `https://<DOMAIN_NAME>` to ensure callbacks and links use HTTPS.

## Seeding the Database via SSH
You can run the Prisma seed script on EC2 anytime:

```bash
ssh -i <key.pem> <EC2_USER>@<EC2_HOST>
cd ~/apps/forest-app
./deploy/scripts/seed.sh
```

This uses `docker compose run --rm web` with the production override to execute `npx prisma db seed` inside the container with the same environment as the web service. Alternatively:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm web sh -c "npm run prisma:seed"
```

## Rollbacks
To rollback to a previous commit:
- Update the image tag on EC2: `export IMAGE_TAG=<old_sha>` then rerun compose using the same override.

## Notes
- `npx prisma migrate deploy` and `npx prisma db seed` run automatically on container start via the `web` service command.
- Volumes ensure DB and Nominatim data persist across updates.
