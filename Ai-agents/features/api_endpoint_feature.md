## API Endpoints (Suggested)
Auth
    • POST /api/register
    • POST /api/login
    • POST /api/logout

Tasks
    • GET /api/tasks
    • POST /api/tasks
    • PATCH /api/tasks/:id
    • DELETE /api/tasks/:id (optional)

Assignment
    • PATCH /api/tasks/:id/assign

Worklogs
    • POST /api/tasks/:id/worklog
    • GET /api/tasks/:id/worklogs

Reports
    • GET /api/reports/time