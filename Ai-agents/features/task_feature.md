## 1. Task Features
Task Model
Fields:
    • id
    • title (required, max 255 chars)
    • status
    • assignee (nullable FK)
    • created_by
    • due_date (optional)
    • position (ordering index)
    • created_at
    • updated_at

Task Creation
    • Only title required
    • Defaults:
        ◦ status = Backlog
        ◦ assignee = null
    • Appears at bottom of column

Task Card UI
Displays:
    • Title
    • Assignee (if exists)
    • Due date (if exists)
    • Created by

## 2. Drag-and-Drop
Behavior
    • Move across columns → update status
    • Reorder within column → update position
Persistence
    • API call updates:
        ◦ status
        ◦ position
    • Must persist after refresh