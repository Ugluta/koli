# Koli Şehir Rehberi

A large-scale city directory portal — discover businesses, products, and services in your city.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose

## Quick Start

```bash
# Start infrastructure services
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Install dependencies
npm install

# Start development servers
npm run dev
```

## Apps

- **apps/api** — NestJS REST API (port 4000), Swagger docs at http://localhost:4000/docs
- **apps/web** — Next.js frontend (port 3000)

## Infrastructure (Docker)

| Service      | Port  | Description          |
|-------------|-------|----------------------|
| PostgreSQL   | 5432  | Primary database     |
| Redis        | 6379  | Cache / queues       |
| Meilisearch  | 7700  | Full-text search     |
| MinIO        | 9000/9001 | Object storage  |
