## Reporting
Route
/reports/time

Data Display
For each task:
    • Title
    • Status
    • Assignee
    • Total hours (sum of worklogs)

Aggregation Logic
    • Task total = SUM(worklogs.hours WHERE task_id)
    • Grand total = SUM(all worklogs.hours)