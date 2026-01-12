# Running BitWebApp with Docker Compose

This guide explains how to run the entire BitWebApp stack using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

## Quick Start

### 1. Configure Environment Variables

Edit `.env.docker` and update with your actual values:

| Variable                | Description                            | Required |
| ----------------------- | -------------------------------------- | -------- |
| `ACCESS_TOKEN_SECRET`   | JWT secret for access tokens           | ✅       |
| `REFRESH_TOKEN_SECRET`  | JWT secret for refresh tokens          | ✅       |
| `AUTH_EMAIL`            | Email address for sending emails       | ✅       |
| `AUTH_PASSWORD`         | App password for the email account     | ✅       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for file uploads | ✅       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                     | ✅       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                  | ✅       |

> ⚠️ **Important**: Generate secure random strings for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`. Never use default values in production!

### 2. Start the Application

```bash
docker compose up --build
```

This will start:

- **MongoDB** on port `27017`
- **Backend API** on port `3000`
- **Frontend** on port `5173`

### 3. Access the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

## Common Commands

### Start in Detached Mode

```bash
docker compose up -d --build
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Stop Services

```bash
docker compose down
```

### Stop and Remove Volumes

```bash
docker compose down -v
```

> ⚠️ This will delete all MongoDB data!

### Rebuild a Specific Service

```bash
docker compose build backend
docker compose up -d backend
```

## Services Overview

| Service  | Container Name     | Port  | Description        |
| -------- | ------------------ | ----- | ------------------ |
| MongoDB  | bitwebapp-mongodb  | 27017 | Database           |
| Backend  | bitwebapp-backend  | 3000  | Node.js API server |
| Frontend | bitwebapp-frontend | 5173  | Vite React app     |

## Development Workflow

The Docker setup includes volume mounts for hot-reloading:

- `./backend` is mounted to `/app` in the backend container
- `./frontend` is mounted to `/app` in the frontend container

Changes to your source code will automatically trigger a reload.

## Seeding Test Data

To populate the database with test users for development, run the seed script:

```bash
docker compose exec backend node scripts/seed-test-data.js
```

This creates the following test accounts (all with password `password123`):

| Account            | Username        | Role                 |
| ------------------ | --------------- | -------------------- |
| Master Admin       | `masteradmin`   | Full access          |
| K22 Batch Admin    | `k22admin`      | Batch 22 admin       |
| K23 Batch Admin    | `k23admin`      | Batch 23 admin       |
| Verified Student   | `btech10001.22` | Student (verified)   |
| Unverified Student | `btech10002.22` | Student (unverified) |

> **Note**: The script is idempotent—running it multiple times won't create duplicates.

## Troubleshooting

### Port Already in Use

If you get a port conflict error, check for other services using the same ports:

```bash
# Check what's using a port (e.g., 3000)
lsof -i :3000
```

### MongoDB Connection Issues

If the backend can't connect to MongoDB, ensure the MongoDB container is healthy:

```bash
docker compose ps
```

Wait for MongoDB to show as `healthy` before the backend starts.

### Clean Rebuild

If you encounter issues, try a clean rebuild:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up
```
