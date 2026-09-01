# 👤 Manual Tasks Checklist (What YOU Need To Do Yourself)

> Automation and CI/CD handle all compiling, building, testing, Docker containerization, Nginx configuration, and deployments.
>
> Here is the exact checklist of the **external tasks that only YOU can do manually** when setting up this or any new project.

---

## 📋 Summary Checklist

- [ ] **Step 1:** Purchase a VPS & Get Root Access
- [ ] **Step 2:** Point Your Domain DNS `A` Records to the VPS
- [ ] **Step 3:** Generate Third-Party API Keys (Email & Cloudinary)
- [ ] **Step 4:** Add Secrets in GitHub Repository Settings
- [ ] **Step 5:** Initial Server One-Time Command (Install Docker & Nginx)
- [ ] **Step 6:** Push to GitHub `main` branch to Trigger Auto-Deploy

---

## 🔍 Detailed Instructions

### 1️⃣ Purchase a VPS (Virtual Private Server)

Buy a basic VPS from any provider (**Hostinger, DigitalOcean, Hetzner, Vultr, or Linode**):

- **OS**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS
- **Recommended Spec**: 1 or 2 vCPU, 2 GB RAM (e.g. ~$4–$6/month is plenty because builds happen in GitHub Cloud).
- **Save these details**:
  - `VPS IP Address` (e.g. `145.223.x.x`)
  - `VPS Username` (usually `root`)
  - `VPS Password` (or SSH Private Key)
  - `SSH Port` (usually `22`)

---

### 2️⃣ Point Domain DNS Records to Your VPS

Go to where you bought your domain (Cloudflare, Namecheap, GoDaddy, Hostinger) and add **3 or 4 `A` Records**:

| Type  | Host / Name       | Points To / Value | TTL                 |
| ----- | ----------------- | ----------------- | ------------------- |
| **A** | `@` (Root domain) | `YOUR_VPS_IP`     | Automatic (or 300s) |
| **A** | `admin`           | `YOUR_VPS_IP`     | Automatic (or 300s) |
| **A** | `api`             | `YOUR_VPS_IP`     | Automatic (or 300s) |
| **A** | `www`             | `YOUR_VPS_IP`     | Automatic (or 300s) |

_(Note: DNS takes 5 to 15 minutes to propagate across the internet)._

---

### 3️⃣ Generate Third-Party Credentials

#### A. Gmail SMTP App Password (For verification emails & OTP)

1. Go to your **Google Account** ➡️ **Security**.
2. Turn on **2-Step Verification** (if not already enabled).
3. Search for **"App passwords"** or go to: `https://myaccount.google.com/apppasswords`
4. Create a new app name (e.g. "Kurius App") and copy the **16-letter password**.
5. Save:
   - `EMAIL_USER`: `your_email@gmail.com`
   - `EMAIL_PASS`: `your_16_letter_app_password`

#### B. Cloudinary Account (For free zero-disk video/image CDN storage)

1. Sign up at `https://cloudinary.com` (Free plan gives 25GB bandwidth/storage).
2. From your Cloudinary Dashboard, copy:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

---

### 4️⃣ Set Up GitHub Repository Secrets

Go to your **GitHub Repository** ➡️ **Settings** ➡️ **Secrets and variables** ➡️ **Actions** ➡️ Click **"New repository secret"**:

Add each of these secrets:

| Secret Name             | What Value To Put                                                                |
| ----------------------- | -------------------------------------------------------------------------------- |
| `VPS_HOST`              | Your VPS IP Address                                                              |
| `VPS_USER`              | `root`                                                                           |
| `VPS_PASSWORD`          | Your VPS root password                                                           |
| `VPS_PORT`              | `22`                                                                             |
| `POSTGRES_PASSWORD`     | Any strong password (e.g. `KuriusSecret_2026!`)                                  |
| `DATABASE_URL`          | `postgresql://postgres:KuriusSecret_2026!@postgres:5432/kurius_db?schema=public` |
| `JWT_SECRET`            | Any long random 32+ character string                                             |
| `JWT_EXPIRE_IN`         | `7d`                                                                             |
| `JWT_REFRESH_SECRET`    | Another long random 32+ character string                                         |
| `JWT_REFRESH_EXPIRE_IN` | `90d`                                                                            |
| `SESSION_SECRET`        | Any random 32+ character string                                                  |
| `SUPER_ADMIN_EMAIL`     | `admin@kurius.com` (or your desired admin email)                                 |
| `SUPER_ADMIN_PASSWORD`  | `Password123!` (or your desired admin password)                                  |
| `EMAIL_FROM`            | `noreply@kurius.com` (or your Gmail)                                             |
| `EMAIL_USER`            | `your_email@gmail.com`                                                           |
| `EMAIL_PASS`            | Your 16-letter Gmail App Password                                                |
| `EMAIL_PORT`            | `587`                                                                            |
| `EMAIL_HOST`            | `smtp.gmail.com`                                                                 |
| `NEXT_PUBLIC_SITE_URL`  | `https://kuriusapp.cloud` (or your domain)                                       |
| `NEXT_PUBLIC_API_URL`   | `https://api.kuriusapp.cloud/api/v1` (or your domain)                            |

---

### 5️⃣ Initial Server One-Time Command

Open your terminal (PowerShell / Terminal / PuTTY) and connect to your VPS once:

```bash
ssh root@YOUR_VPS_IP
```

Copy and paste this single block to install Docker, Nginx, and Git:

```bash
apt-get update -y && apt-get install -y git nginx certbot python3-certbot-nginx
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
systemctl enable nginx && systemctl start nginx
```

Then exit the VPS:

```bash
exit
```

---

### 6️⃣ Trigger Deployment (Done!)

Whenever you want to deploy, just push your code:

```bash
git add .
git commit -m "feat: initial deployment"
git push origin main
```

- GitHub Actions runs automatically.
- It tests your code, builds the Docker containers, pushes them to GitHub Registry, connects to your VPS, provisions SSL certificates, and launches everything!
