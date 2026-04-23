## Time Logging
Worklog Model
Fields:
    • id
    • task_id
    • user_id
    • hours (decimal)
    • description
    • created_at

Logging Work
    • Input:
        ◦ Hours (decimal, e.g. 1.5)
        ◦ Description
    • Immutable after creation

Constraints
    • No editing
    • No deletion
    • Multiple logs allowed per task