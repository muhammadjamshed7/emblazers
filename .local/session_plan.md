# Objective
Implement PART 3.4 student portal UI improvements. Upgrade all student pages with better layouts, full-screen quiz taking, grade color badges, PDF/image viewers, circular attendance progress, and clickable dashboard cards.

# Tasks

### T001: Rewrite Student Dashboard with Welcome Bar, Clickable Cards & Recent Activity
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/curriculum/student-dashboard.tsx`
  - Top header bar: "Welcome, [name] | Class [X] - [section] | Student ID: [id] | [Logout]"
  - 4 clickable summary cards linking to their pages:
    - Active Quizzes (count) → "Take Now" link to /curriculum/student-quizzes
    - Completed Quizzes (count) → "View" link to /curriculum/student-results
    - Pending Fees (Rs. amount) → "Pay Info" link to /curriculum/student-fees
    - Attendance This Month (%) → link to /curriculum/student-attendance
  - Recent Activity section: show last 5 quiz results with grade badges from dashboard API data
  - Keep the first-login password change dialog (isFirstLogin check with confirm password, min 8 chars)
  - Info box when isFirstLogin: "You must set a new password before continuing"
  - Use useStudentDashboard, useChangePassword, useStudentResults from student-data.ts
  - Use ModuleLayout with studentNavItems
  - Files: `client/src/pages/curriculum/student-dashboard.tsx`

### T002: Rewrite Student Content with Subject Tabs & Content Viewers
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/curriculum/student-content.tsx`
  - Replace subject dropdown with Tabs component (All | Mathematics | Science | English | etc. from API data)
  - Content cards grid (2-3 per row) showing: type icon, title, subject badge, teacher name, time ago
  - "View Content" button on each card
  - View behavior in modal:
    - PDF: iframe with `src="data:application/pdf;base64,..."` for embedded PDF viewing
    - Image: lightbox modal showing full image
    - Note: modal with formatted text in a styled container
    - Link: opens in new browser tab (no modal)
  - Use useStudentContent from student-data.ts
  - Files: `client/src/pages/curriculum/student-content.tsx`

### T003: Rewrite Student Quizzes with Tabs, Full-Screen Quiz & Result Screen
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/curriculum/student-quizzes.tsx` - THIS IS THE BIGGEST TASK
  - Three tabs using Tabs component: Active | Upcoming | Completed
  - Active tab: green-bordered cards with quiz info, countdown to end time, "Start Quiz" button
  - Upcoming tab: blue-bordered cards, disabled button "Opens on [datetime]"
  - Completed tab: cards showing score/percentage/grade/pass-fail, "View Details" button
  - FULL SCREEN quiz taking (when quiz started, hide ModuleLayout entirely):
    - Top bar: quiz title | Question X of Y | countdown timer (red when < 5 min)
    - One question at a time with Previous/Next navigation
    - MCQ: radio buttons with A/B/C/D labels
    - True/False: radio buttons
    - Short Answer: text input
    - Question palette at bottom: green=answered, white=unanswered, blue=current, clickable to jump
    - "Submit Quiz" with confirmation modal: "You have answered X of Y questions. Are you sure?"
    - Auto-submit when timer hits 0:00
  - After submission, show Quiz Result Screen:
    - "Quiz Complete!" header
    - Score (X / Y marks), percentage bar, grade, pass/fail
    - "View Detailed Results" button → shows each question with:
      - Correct answers: green background
      - Wrong answers: red background + correct answer shown
      - Short answers: "Pending teacher review" badge
    - "Go Home" button → back to quizzes page
  - Use useStudentQuizzes, useSubmitQuiz from student-data.ts
  - Files: `client/src/pages/curriculum/student-quizzes.tsx`

### T004: Rewrite Student Results with Grade Colors & Per-Question Modal
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/curriculum/student-results.tsx`
  - Summary stats at top: Average Grade, Best Score, Total Quizzes Attempted
  - Table: Quiz Title | Subject | Teacher | Date | Score | Grade | Status
  - Grade badges with colors: A+ (purple), A (green), B (blue), C (yellow), D (orange), F (red)
  - Clicking any row opens result detail modal showing per-question breakdown:
    - Correct answers with green background
    - Wrong answers with red background + correct answer
    - Short answers with "Pending teacher review" badge
  - Use useStudentResults from student-data.ts
  - Files: `client/src/pages/curriculum/student-results.tsx`

### T005: Rewrite Student Fees with Balance Column & Better Status Badges
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/curriculum/student-fees.tsx`
  - Summary at top: "Total Outstanding: Rs. X | Total Paid This Year: Rs. Y"
  - Table: Month | Total Amount | Paid | Balance | Due Date | Status
  - Status badges: Paid (green), Partial (yellow), Pending (orange), Overdue (red)
  - Add note: "This is READ-ONLY. No payment processing — just shows fee records."
  - Use useStudentFees from student-data.ts
  - Files: `client/src/pages/curriculum/student-fees.tsx`

### T006: Rewrite Student Attendance with Circular Progress & Color Coding
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/curriculum/student-attendance.tsx`
  - Circular progress indicator at top showing overall attendance %
  - Use SVG circle with stroke-dasharray for the circular progress
  - Month-by-month table: Month | Present Days | Absent Days | Total Days | Attendance %
  - Color code percentage: >=90% green, 75-89% yellow, <75% red
  - Use useStudentAttendance from student-data.ts
  - Files: `client/src/pages/curriculum/student-attendance.tsx`
