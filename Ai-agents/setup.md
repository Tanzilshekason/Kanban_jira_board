# Role
You are a senior software architect.
 
# Context
Workspace is empty. Build a production-ready fullstack project.

# Tech Stack:
- Frontend: React (Vite) + Tailwind
- Backend: Django (Python)
- Database: MYSql
- Auth: JWT
---

## 1. Project Structure

Ensure the project is organized as follows:

vibeflow-kanban/
│
├── backend/      # Django project
├── frontend/     # React (Vite)
├── README.md

---

## 2. Backend Setup (Django)

### Step 1: Navigate to backend

```
cd backend
```

### Step 2: Create virtual environment

```
python -m venv venv
```

### Step 3: Activate environment

```
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### Step 4: Install dependencies

```
pip install django djangorestframework mysqlclient
```

### Step 5: Run server

```
python manage.py runserver
```

Expected:

* Backend runs at http://127.0.0.1:8000

---

## 3. Database Setup (MySQL)

### Step 1: Start MySQL server

### Step 2: Create database

```
CREATE DATABASE jira_board;
```

### Step 3: Configure Django (later)

* Database name: `jira_board`
* User: `root`
* Password: `root1234`
* Host: `localhost`
* Port: `3306`

---

## 4. Frontend Setup (React + Vite)

### Step 1: Navigate to frontend

```
cd frontend
```

### Step 2: Install dependencies

```
npm install
```

### Step 3: Start development server

```
npm run dev
```

Expected:

* Frontend runs at http://localhost:5173

---

## 5. API Connection

Frontend should connect to backend using:

```
http://127.0.0.1:8000/api
```

---

## 6. Running the Project

Run both services:

* Backend → Django server (port 8000)
* Frontend → Vite dev server (port 5173)
* Database → MySQL (port 3306)

---

## 7. Setup Verification Checklist

* [ ] MySQL database created
* [ ] Django server running
* [ ] React app running
* [ ] No errors in console

---

## Done

Backend, frontend, and database are now set up and ready for development.

---
