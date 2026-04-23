Role: Act as a senior software architect and code auditor with 15+ years of experience.

 

Context:
I have a repository that is not working correctly. I want a complete analysis instead of fixing one issue at a time.

 

Tech Stack:
<Mention stack>

 

Goal:
Perform a full project audit and identify ALL possible issues before suggesting fixes.

 

Task:
1. Scan the entire project structure
2. Identify all categories of issues:
   - Syntax errors
   - Runtime errors
   - Dependency issues
   - Configuration issues (env, docker, settings)
   - Database issues
   - Bad coding practices / anti-patterns
   - Performance issues
3. Group issues logically (do NOT fix yet)
4. Prioritize issues (critical → minor)

 

Output Format:
- Issue List (grouped)
- Root causes
- Fix plan (step-by-step order)

 

Constraint:
Do NOT start fixing immediately. First complete full analysis.
Now based on the above analysis:   Task: ... by sanket zeple
sanket zeple

Now based on the above analysis:

 

Task:
1. Fix issues in optimal order (dependency → config → code)
2. Combine fixes wherever possible
3. Avoid repetitive changes
4. Provide final working code/config

 

Goal:
Minimize steps and avoid iterative debugging.
Context: I have a repository that is not wo... by sanket zeple
sanket zeple

Context: I have a repository that is not working correctly. I want a complete analysis instead of fixing one issue at a time.

Tech Stack: Flask

Goal: Perform a full project audit and identify ALL possible issues before suggesting fixes.

Task:

    Scan the entire project structure
    Identify all categories of issues:
        Syntax errors
        Runtime errors
        Dependency issues
        Configuration issues (env, docker, settings)
        Database issues
        Bad coding practices / anti-patterns
        Performance issues
        Duplicate logic
        Poor structure
        Security issue
        No tests
        Bug in logic
    Group issues logically (do NOT fix yet)
    Prioritize issues (critical → minor)

Output Format:

    Issue List (grouped)
    Root causes
    Fix plan (step-by-step order)

Constraint: Do NOT start fixing immediately. First complete full analysis.
# Project Scope: AI Document Summarizer   #... by sanket zeple
sanket zeple

# Project Scope: AI Document Summarizer

 

## Overview

AI-powered web application that generates structured summaries from user-provided documents using an LLM.

 

---

 

## Tech Stack

Backend: FastAPI  

Frontend: React  

Database: PostgreSQL  

AI: LLM API  

 

---

 

## Project Structure

- Root (parent folder)

  - backend/ (FastAPI service)

  - frontend/ (React app)

 

---

 

## Application Flow

1. User uploads file or enters text

2. Backend receives and validates input

3. System builds structured prompt

4. LLM generates summary

5. Response is validated

6. Fallback used if invalid/error

7. Result stored in DB

8. Summary displayed on UI

 

---

 

## Core Capabilities

- Document/Text summarization

- Structured output (summary, key points, action items)

- Error handling + fallback response

- Logging of requests and responses
# Feature: AI Document Summarizer   ## Goal... by sanket zeple
sanket zeple

# Feature: AI Document Summarizer

 

## Goal

Allow user to upload document and generate concise, structured summary using LLM.

 

---

 

## Execution Mode

TDD (Test → Implement → Refactor)

 

---

 

## Input

- File (CSV / Text)

- OR raw text input

 

---

 

## Flow

1. User uploads file / enters text

2. Backend validates input (type, size, empty)

3. Extract content (if file)

4. Build structured prompt

5. Call LLM API

6. Validate LLM output (JSON schema)

7. If invalid → retry once → else fallback response

8. Store input + output + status in DB

9. Return summary to UI

 

---

 

## Output (LLM Expected Format)

```json

{

  "summary": "string",

  "key_points": ["string"],

  "action_items": ["string"]

}
Link https://www.resume-now.com/build-resum... by Tanzil Shekason
Tanzil Shekason

https://www.resume-now.com/build-resume/select-resume
Utilized AI tools (Antigravity) to generate... by sanket zeple
sanket zeple

Utilized AI tools (Antigravity) to generate boilerplate code and assist
in debugging backend issues, while retaining full ownership of
architecture and business logic
Link https://www.google.com/aclk?sa=L&ai=DC... by sanket zeple
sanket zeple

https://www.google.com/aclk?sa=L&ai=DChsSEwiwmYKog_KTAxVnDnsHHfLfGAUYACICCAEQARoCdG0&ae=2&aspm=1&co…
Embraces vibe coding to iterate faster an... by sanket zeple
sanket zeple

Embraces vibe
coding to iterate faster and ship features eﬃciently.
Dear sir,  Just a quick update on what I ... by sanket zeple
sanket zeple

Dear sir, 


Just a quick update on what I covered today:


Spent the day on interview preparation, learned the basics of prompt 
engineering, and went through a few scenario-based questions on vibe 
coding.

 

Regards,

Sanket Zeple
create fucntino to return dictionary   havi... by sanket zeple
sanket zeple

create fucntino to return dictionary

 

having

 

evens - list of nums
odd list of nums
squres:  gerenate swures of nums
# Product Requirements Document (PRD) ## Vi... by sanket zeple
sanket zeple

# Product Requirements Document (PRD)

## VibeFlow Kanban Board

 

---

 

## 1. Problem Statement

Teams need a simple, self-hosted task management tool to track work visually. Existing tools (e.g., Jira) are complex, heavy, and not optimized for small teams or local setups.

 

---

 

## 2. Goal

Build a lightweight, multi-user Kanban board that enables teams to:

- Manage tasks visually

- Track ownership and progress

- Log time spent on tasks

- View aggregated work reports

 

---

 

## 3. Target Users

- Small dev teams

- Freelancers

- Internal teams needing simple workflow tracking

- Users preferring self-hosted tools

 

---

 

## 4. Key Features (MVP)

 

### Authentication

- Register, login, logout

- JWT-based session

 

### Shared Kanban Board

- Single global board

- 8 workflow columns

- Task cards with key details

 

### Task Management

- Create, edit tasks

- Assign users

- Set due dates

 

### Drag & Drop

- Move tasks across columns

- Reorder within column

 

### Assignment History

- Track all assignee changes

- Show history in UI

 

### Time Logging

- Log hours per task

- Immutable logs

 

### Reporting

- Per-task time summary

- Total project time

 

---

 

## 5. User Journey

 

1. User registers/logs in

2. Lands on board

3. Creates tasks

4. Moves tasks across workflow

5. Assigns tasks to users

6. Logs time on tasks

7. Views report page for insights

 

---

 

## 6. Success Metrics (KPIs)

 

- Users can complete full task lifecycle (create → move → assign → log time)

- Data persists across sessions

- All users see consistent shared board

- Time reports correctly aggregate data

- System runs via Docker without issues

 

---

 

## 7. Non-Goals (Out of Scope)

 

- Multiple boards

- Real-time collaboration

- Notifications (email/in-app)

- File attachments

- Role-based access control

- OAuth login

 

---

 

## 8. Constraints

 

- Must run locally via Docker

- Use SQLite (no external DB)

- Keep UI simple and fast

- No third-party SaaS dependency

 

---

 

## 9. Assumptions

 

- Low to moderate number of users

- Single shared workflow is sufficient

- Users trust each other (no strict permissions needed)

 

---

 

## 10. Risks

 

- JWT handling errors may break auth flow

- Drag-and-drop state sync issues

- Incorrect time aggregation logic

- SQLite limitations under higher load

 

---

 

## 11. Future Enhancements

 

- Multiple boards/projects

- Real-time updates (WebSockets)

- Comments & attachments

- Notifications

- Role-based permissions

- Advanced reporting & filters