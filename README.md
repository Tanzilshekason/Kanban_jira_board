# VibeFlow Kanban Board

A full-stack kanban board application with task management, assignment tracking, time logging, and reporting features.

## Features

- **Kanban Board**: 8 fixed status columns with drag-and-drop functionality
- **Task Management**: Create, edit, delete tasks with descriptions, priorities, and due dates
- **Assignment System**: Assign tasks to users with full history tracking
- **Time Logging**: Log work hours against tasks with immutable records
- **Reporting**: Generate time reports by task, user, or day with aggregation
- **Authentication**: JWT-based user authentication and authorization
- **Dockerized**: Full containerization with MySQL, Django, and React services

## Tech Stack

- **Frontend**: React 18, Vite, @dnd-kit for drag-and-drop
- **Backend**: Django 5.1, Django REST Framework, JWT authentication
- **Database**: MySQL 8.0
- **Containerization**: Docker Compose with multi-service setup

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of RAM available

### 1. Clone and navigate to the project
```bash
cd kanban_board
```

### 2. Start all services
```bash
docker-compose up -d
```

### 3. Check service status
```bash
docker-compose ps
```

### 4. Access the application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **API Health Check**: http://localhost:8000/api/health/

### 5. Create admin user (first time only)
```bash
docker-compose exec backend python manage.py createsuperuser
```

## Services

### Database (MySQL)
- **Container**: `vibeflow_db`
- **Port**: 3306 (host) → 3306 (container)
- **Credentials**:
  - Database: `jira_board`
  - User: `vibeflow_user`
  - Password: `vibeflow_password`
  - Root Password: `rootpassword`

### Backend (Django)
- **Container**: `vibeflow_backend`
- **Port**: 8000 (host) → 8000 (container)
- **API Base URL**: `http://localhost:8000/api/`

### Frontend (React)
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

## Local Development Setup

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure database:
   ```bash
   # Update backend/vibeflow/settings.py with your MySQL credentials
   # Or use SQLite for development by changing DATABASES setting
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Run development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## API Overview

### Authentication Endpoints
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login and get JWT token
- `GET /api/profile/` - Get current user profile
- `GET /api/users/` - List all users (admin only)

### Task Management
- `GET /api/tasks/` - List all tasks (filterable by status, assignee)
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

### Assignment History
- `GET /api/assignment-history/` - List assignment history (filterable by task, user)

### Time Logging
- `POST /api/time-logs/` - Create time log entry
- `GET /api/time-logs/` - List time logs (filterable by task, user, date range)

### Reporting
- `GET /api/reports/time/` - Generate time reports with aggregation
  - Query parameters: `report_type` (task, user, day), `start_date`, `end_date`, `user_id`, `task_id`

### Board Configuration
- `GET /api/board/columns/` - Get fixed column definitions

### Health Check
- `GET /api/health/` - Service health status

## Testing

### Backend Tests
Run Django unit tests:
```bash
cd backend
python manage.py test kanban.tests
```

Test coverage includes:
- Time logging calculations (decimal precision, aggregation, immutability)
- Assignment history creation (on assignee changes, ordering, unassignment)
- Report aggregation logic (SUM calculations, filtering, data structure)

### Frontend Tests
Run React tests:
```bash
cd frontend
npm test
```

## Docker Commands

### Common Operations
```bash
# Start all services in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Rebuild images
docker-compose build

# View logs
docker-compose logs -f
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend # Frontend only
```

### Service Management
```bash
# Run Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py test

# Access database shell
docker-compose exec db mysql -u vibeflow_user -p jira_board

# Access frontend container shell
docker-compose exec frontend sh
```

### Development vs Production
**Development** (default):
- Uses mounted volumes for live code reload
- Debug mode enabled
- Hot reload for frontend

**Production**:
```bash
# Build optimized images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Run in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Data Models

### Task
- `title`: Task title (max 200 chars)
- `description`: Detailed description
- `status`: One of 8 fixed statuses (Backlog, To Do, In Progress, etc.)
- `priority`: Low, Medium, High, Critical
- `due_date`: Optional due date
- `assignee`: ForeignKey to User (nullable)
- `created_by`: User who created the task
- `created_at`, `updated_at`: Timestamps

### AssignmentHistory
- `task`: ForeignKey to Task
- `assignee`: ForeignKey to User (nullable for unassignment)
- `assigned_by`: User who made the assignment
- `assigned_at`: Timestamp

### TimeLog
- `task`: ForeignKey to Task
- `user`: ForeignKey to User
- `hours`: Decimal field (max 4 digits, 2 decimal places)
- `logged_at`: Date of work
- `created_at`: Immutable creation timestamp

## Feature Implementation Status

✅ **Completed Features:**
- 8 fixed status columns with drag-and-drop
- Task creation, editing, deletion
- Assignment system with history tracking
- Time logging with immutable records
- Reporting with aggregation (task, user, day)
- JWT authentication
- Docker containerization (frontend, backend, db)
- Comprehensive unit tests
- Assignment history UI in task modal
- Time logging UI with proper field mapping

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure MySQL container is running: `docker-compose ps`
   - Check database credentials in `.env` file
   - Wait for database to initialize (may take 30 seconds on first run)

2. **Frontend not connecting to backend**
   - Verify `VITE_API_BASE_URL` in frontend environment
   - Check backend is running: `curl http://localhost:8000/api/health/`
   - Ensure CORS is configured (already set in Django settings)

3. **Port conflicts**
   - Change ports in `docker-compose.yml` if 5173 or 8000 are in use
   - Update `VITE_API_BASE_URL` accordingly

4. **Migration errors**
   - Reset database: `docker-compose down -v && docker-compose up -d`
   - Run migrations manually: `docker-compose exec backend python manage.py migrate`

### Logs and Debugging
```bash
# View all service logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend

# Check service health
curl http://localhost:8000/api/health/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with appropriate tests
4. Submit a pull request

## License

This project is licensed under the MIT License.