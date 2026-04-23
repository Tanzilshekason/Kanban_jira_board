# VibeFlow Kanban Board — Project Scope

## Overview

VibeFlow is a collaborative Kanban board application inspired by Jira Kanban templates. It enables multiple authenticated users to manage tasks, track progress, assign ownership, and log time in a shared workspace.

The system must support real-time-like consistency (via API refresh), persistent sessions, and a clean drag-and-drop interface.

---

## Tech Stack

* **Frontend:** React (with modern hooks + state management)
* **Backend:** Django (Django REST Framework)
* **Database:** MySQL
* **Containerization:** Docker + Docker Compose

---

## Core Objectives

1. Build a **shared Kanban board** accessible to all authenticated users.
2. Implement **user authentication with session persistence**.
3. Support **task lifecycle management across 8 workflow stages**.
4. Enable **task assignment with audit history tracking**.
5. Provide **time logging and reporting capabilities**.
6. Ensure **full Dockerized deployment**.
7. Maintain **test coverage for critical business logic**.

---

## Board Structure

The Kanban board must include exactly **8 columns** in this order:

1. Backlog
2. To Do
3. In Progress
4. In Review
5. Testing
6. Done
7. Blocked
8. Archived

---

## Key Functional Modules

### 1. Authentication & User Management

* Email/password registration
* Secure login/logout
* Session persistence across browser restarts
* Password hashing (bcrypt or equivalent)

---

### 2. Shared Kanban Board

* Single global board visible to all users
* Tasks displayed in columns by status
* Task cards show:

  * Title
  * Assignee
  * Due Date (optional)
  * Created By

---

### 3. Task Management

* Create task (title required only)
* Default:

  * Status → Backlog
  * Assignee → Null
* Title validation (max 255 chars)
* Ordering:

  * New tasks added to bottom
  * Drag-and-drop reorder

---

### 4. Drag-and-Drop Workflow

* Move tasks across columns
* Reorder within column
* Persist changes to backend
* Maintain order after refresh

---

### 5. Assignment Management

* Assign/unassign users
* Maintain **assignment history log**
* Show history in task modal:

  * Old value
  * New value
  * Changed by
  * Timestamp

---

### 6. Time Logging

* Log time in decimal hours
* Add description per log
* Immutable logs (no edit/delete)
* Multiple logs per task

---

### 7. Reporting

* Dedicated `/reports/time` page
* Show:

  * Task details
  * Total hours per task
  * Grand total across project

---

### 8. Deployment

* Fully Dockerized app
* Runs on `localhost:8080`
* Persistent MySQL volume

---

## Non-Functional Requirements

* Clean UI/UX similar to Jira Kanban
* RESTful API design
* Error handling for invalid inputs
* Secure authentication flow
* Scalable architecture (modular backend)

---

## Definition of Done

The project is considered complete only if:

* All **44 KPIs pass**
* All tests pass
* Docker setup runs without manual fixes
* Documentation is complete and usable

---

## Deliverables

* Source code (frontend + backend)
* Docker configuration
* README.md
* API documentation
* Unit tests

---
