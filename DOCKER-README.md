# Docker Setup for VibeFlow Kanban Board

This project is fully containerized using Docker Compose. The setup includes:
- MySQL database
- Django REST API backend
- React frontend

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of RAM available

## Quick Start

1. **Clone and navigate to the project directory**
   ```bash
   cd kanban_board
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Check service status**
   ```bash
   docker-compose ps
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

## Services

### 1. Database (MySQL)
- **Container**: `vibeflow_db`
- **Port**: 3306 (host) → 3306 (container)
- **Credentials**:
  - Database: `jira_board`
  - User: `vibeflow_user`
  - Password: `vibeflow_password`
  - Root Password: `rootpassword`

### 2. Backend (Django)
- **Container**: `vibeflow_backend`
- **Port**: 8000 (host) → 8000 (container)
- **API Base URL**: `http://localhost:8000/api/`
- **Health Check**: `http://localhost:8000/api/health/`

### 3. Frontend (React)
- **Container**: `vibeflow_frontend`
- **Port**: 5173 (host) → 5173 (container)
- **URL**: `http://localhost:5173`

## Environment Variables

Copy `.env.example` to `.env` and modify as needed:
```bash
cp .env.example .env
```

Key variables:
- `DB_HOST`: Database host (use `db` for Docker, `localhost` for local)
- `DB_NAME`: Database name (`jira_board`)
- `DB_USER`: Database user (`vibeflow_user`)
- `DB_PASSWORD`: Database password (`vibeflow_password`)
- `VITE_API_BASE_URL`: Frontend API URL (`http://localhost:8000`)

## Development vs Production

### Development
- Uses mounted volumes for live code reload
- Debug mode enabled
- Hot reload for frontend

### Production
1. Build optimized images:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```

2. Run in production mode:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes
```bash
docker-compose down -v
```

### Rebuild images
```bash
docker-compose build --no-cache
```

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Execute commands in containers
```bash
# Backend shell
docker-compose exec backend bash

# Run Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Frontend shell
docker-compose exec frontend sh
```

### Check service health
```bash
curl http://localhost:8000/api/health/
```

## Troubleshooting

### 1. Port conflicts
If ports 3306, 8000, or 5173 are already in use, modify the port mappings in `docker-compose.yml`.

### 2. Database connection errors
Wait for MySQL to fully start (health check passes). The backend depends on the database being healthy.

### 3. Permission issues
Ensure Docker has proper permissions to create volumes.

### 4. Build failures
Clear Docker cache:
```bash
docker system prune -a
docker-compose build --no-cache
```

## Data Persistence

- MySQL data is stored in a Docker volume named `mysql_data`
- To reset the database, remove the volume:
  ```bash
  docker-compose down -v
  ```

## API Endpoints

Once running, access these endpoints:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/ (create superuser first)
- **Health Check**: http://localhost:8000/api/health/

## Creating Admin User

1. Access the backend container:
   ```bash
   docker-compose exec backend bash
   ```

2. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

3. Follow prompts to set username, email, and password.

## Development Workflow

For local development with Docker:

1. Start only database:
   ```bash
   docker-compose up -d db
   ```

2. Run backend locally (with virtual environment):
   ```bash
   cd backend
   . venv/bin/activate
   python manage.py runserver
   ```

3. Run frontend locally:
   ```bash
   cd frontend
   npm run dev
   ```

This allows for faster development with hot reload while using the Dockerized database.