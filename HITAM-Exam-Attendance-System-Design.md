# HITAM Academic Examination & Attendance Management System
### Requirements and Design Document — College Project

**Institution:** Hyderabad Institute of Technology and Management (HITAM), Medchal, Telangana — UGC Autonomous, affiliated to JNTUH
**Regulation referenced:** HR-22 (B.Tech Regular, batches admitted 2022-23 onwards; LES batches 2023-24 onwards)
**Source:** `https://hitam.org/wp-content/uploads/2025/04/HR22-Regulations.pdf`
**Document status:** Draft for review. Items marked **[CONFIRM WITH HITAM]** are *not* specified in HR-22 and must not be assumed.

---

## 0. Data minimisation statement (read this first)

This system deliberately stores the smallest set of personal data that still lets it do its job.

**Stored about a student:** Student ID (roll number), name, branch, section/year, and — only where a photo is genuinely required — one passport photo.

**Never stored:** passwords, marks or grades, phone numbers, email addresses, Aadhaar or any government ID, addresses, parent/guardian details, caste/category, date of birth, medical information, biometric data.

Two consequences follow, and they shape the whole design:

1. **Students are identified, not authenticated.** With no password, the student sign-in is a lookup by roll number. This is defensible because the only thing behind that login is the student's own attendance percentage and exam status — data they already have a right to see, and which their classmates largely know anyway. It is *not* defensible if the system is ever extended to hold marks. See §12.
2. **The system cannot compute academic pass/fail.** HR-22 pass rules are marks-based (§7 below). Since we store no marks, this system reports *attendance eligibility* and *registration/fee status* only. Academic eligibility stays with the Examination Section's own records. This boundary should be stated on every screen that shows an eligibility status.

---

## 1. Complete feature list

### 1.1 Student management
- Create, view, update, deactivate student records (ID, name, branch, program, year, section)
- Optional photo upload, stored only for students who need one (hall ticket / exam hall ID)
- Student profile page: identity, branch, section, current semester
- Bulk import from CSV for a section or batch
- Soft-delete with retention timer (§12.4)

### 1.2 Faculty management
- Faculty ID, name, department
- Subjects handled: mapping of faculty → course → section → academic year → semester
- A faculty member may be mapped to several sections of the same course, and several faculty may offer the same course (HR-22 §5.1)
- Faculty can only see and edit data for their own mapped sections

### 1.3 Attendance management
- Class session register: date, period, course, section, theory or lab, topic
- Per-session marking: Present / Absent / On-Duty
- Automatic computation of subject-wise and aggregate attendance percentage
- Eligibility banding per HR-22 §6: Eligible / Condonable / Detained
- Attendance history per student, per course, with date-level drill-down
- Shortage-list report for the Examination Section and HODs
- Condonation request workflow (§5.4)

### 1.4 Continuous assessment management
- Catalogue of assessment components defined by HR-22 (mid-term exams, assignments, quizzes, presentations, group discussions, open-book tests, PBL, day-to-day lab work, course-level projects)
- Per-assessment record of **whether it was conducted** and **whether the student participated/submitted** — no marks
- Displays the official weightage of each component so students understand what matters
- Assessment rules held in a configuration table keyed by regulation, so HR-23/HR-24 can be added without code changes
- Calendar of upcoming assessments per student

### 1.5 Examination management
- CIE (mid-term) exam scheduling
- SEE (semester-end) exam scheduling
- Supplementary exam scheduling
- Exam timetable publishing (course, date, session, duration, venue)
- Exam registration: which courses a student has registered for, regular or supplementary
- Hall-ticket eligibility computation and hall-ticket generation (photo used here)
- Exam fee status against a configurable fee structure
- Revaluation / recounting requests **[CONFIRM WITH HITAM — HR-22 does not define a revaluation procedure]**

### 1.6 Dashboards
- **Student:** aggregate and subject-wise attendance, eligibility band, upcoming assessments, upcoming exams, registration status, fee status
- **Faculty:** today's sessions, unmarked sessions, section attendance distribution, students below threshold, assessments due
- **HOD:** department-wide shortage counts, section comparison, faculty marking compliance
- **Exam Section:** eligibility roll-up, registration counts, fee collection status, hall tickets pending
- **Admin:** configuration, user accounts, audit log, retention jobs

### 1.7 Privacy and administration
- Role-based access control
- Full audit log of every read of a student record and every write
- Demo mode that serves only synthetic data
- One-click purge of all student data at project end

---

## 2. Grounded academic rules (from HR-22)

Everything in this section comes from the published HR-22 regulation. **Do not change these values in code — they live in the `regulation_config` table.**

### 2.1 Attendance (HR-22 §6)

| Rule | Value | Clause |
|---|---|---|
| Minimum attendance to sit the SEE | 75% **in aggregate across all courses**, including mandatory courses | 6.1 |
| Condonation band | 65% up to (but not including) 75% | 6.2 |
| Condonation frequency | Once per academic year only | 6.2 |
| Condonation authority | College Academic Committee, on documented genuine grounds | 6.2 |
| Condonation fee | Prescribed by the institute — **amount [CONFIRM WITH HITAM]** | 6.3 |
| Below 65% | Never condoned under any circumstance | 6.4 |
| Effect of non-condonation | Detained; semester registration cancelled including internal marks; not promoted; must re-register for the semester | 6.5 |
| Integrated courses | 75% required in **both** theory and practical components separately | 8.8 |
| Mandatory (non-credit) courses | 75% attendance required | 8.9(a) |
| Audit courses | 75% attendance required for certification | 8.9(b) |

Note the aggregate rule in 6.1 is the binding one for SEE eligibility. Subject-wise percentages are still shown to students because they are useful, and because integrated and mandatory courses do carry their own 75% floor.

### 2.2 Assessment components and weightage (HR-22 §8)

Total per course: **CIE 40 + SEE 60 = 100** (clause 8.1).

**Theory courses (8.2A):**

| Component | Marks | Notes |
|---|---|---|
| Mid-term exam, Part A (short answer) | 10 | 5 questions × 2 marks; 30 min |
| Mid-term exam, Part B (subjective) | 15 | 3 compulsory questions × 5 marks with internal choice; 60 min |
| Part-III activities: presentations, group discussions, quiz, open-book exam, PBL | 10 | Conducted before each mid |
| Assignment test | 5 | |

Two mid-terms are conducted. Mid-1 covers the first half of the syllabus, Mid-2 the second half. Final CIE is computed as **80% of the better mid + 20% of the weaker mid**. The first assignment is due before Mid-1, the second before Mid-2.

**Practical / laboratory courses (8.3A):** CIE 40 = 10 day-to-day work + 10 course-level project (design / prototype / software model / app) + 20 from two mid-term lab exams (same 80/20 rule). SEE is 3 hours, conducted by the lab teacher with an external examiner.

**Design / drawing courses (8.4):** CIE 40 = 10 day-to-day + 10 course project + 20 internal tests (80/20 rule). SEE is 3 hours, five questions of 12 marks.

**Integrated courses (8.8):** CIE 40 = 25 theory mids + 25 lab assessment, plus 10 course-level project and 5 day-to-day including viva. Minimum 40% in CIE and 75% attendance in both components.

**Mandatory non-credit courses (8.9a):** CIE only. Result expressed as Satisfactory (with excellent/very good/good) or Unsatisfactory. Not counted in SGPA/CGPA.

**SEE question pattern (8.2B):** 3 hours, Part A 10 marks (5 questions × 2, one per module, compulsory), Part B 50 marks (5 questions × 10, one per module, internal choice).

> **Design decision:** this system stores the *weightage* above as read-only reference data and records only **conducted / not conducted** and **submitted / not submitted / absent / exempted**. No marks. Students see "Assignment 1 — 5 marks weightage — Submitted", never a score.

### 2.3 Academic pass rules (HR-22 §7.1) — reference only, not computed here

A student earns the credits for a course by securing at least 35% of CIE (14 of 40, including at least 35% of the 25 mid-term marks), at least 35% of SEE (21 of 60), and at least 40% overall — i.e. grade C or above. A student who misses the 35% mid-term floor gets one improvement-test chance, failing which the course must be re-registered in a later semester.

**This system does not evaluate these rules**, because it holds no marks. It must not display a "pass" or "fail" indicator.

### 2.4 Examination types

| Type | Definition | Clause |
|---|---|---|
| CIE | Continuous Internal Evaluation across the semester; two mid-terms plus activities | 8.2 |
| SEE | Semester End Examination, 3 hours, 60 marks | 8.1, 8.2B |
| Supplementary | Held roughly two weeks after results are announced, or odd-semester supplementaries after the even-semester exams. Requires meeting the remedial-class attendance condition set by the institute | 14 |
| Re-registration | One-time chance, maximum two courses, within four weeks of the next academic year's class-work. Previous CIE and SEE marks are cancelled | 8.7 |

Backlog clearance: a student re-registering for a failed course must attend at least 75% of the institute's backlog-clearance classes before becoming eligible to apply for that supplementary (7.1).

### 2.5 Results withholding (HR-22 §13)

If institute fees are outstanding, or a disciplinary case is pending, results may be withheld and promotion blocked. The fee module must therefore expose a simple `results_withheld` flag to the Examination Section.

### 2.6 Programme context

Eight B.Tech branches under HR-22: EEE, ME, ECE, CSE, CSE-AI&ML (CSM), CSE-Data Science (CSD), CSE-IoT (CSO), CSE-Cyber Security (CSC). Total 160 credits for regular entry, 120 for lateral entry. Typical section strength ~60, capped at 80.

### 2.7 Open items — must be confirmed before real use

| # | Item | Why it's open |
|---|---|---|
| 1 | Condonation fee amount | HR-22 6.3 says "as prescribed by the institute"; no figure given |
| 2 | Exam registration fee, per course and total | Not in HR-22 |
| 3 | Supplementary exam fee | Not in HR-22 |
| 4 | Re-registration fee | 8.7 and 15(a) refer to institute-prescribed fees; no figure |
| 5 | Revaluation / recounting: whether it exists, window, fee | Absent from HR-22 entirely |
| 6 | Attendance cut-off date used for eligibility computation | Not specified |
| 7 | Whether On-Duty counts as present, and what caps apply | Not specified |
| 8 | Exam registration opening and closing dates each semester | Published per-semester by notification |
| 9 | Hall ticket issuance rules and whether photo is mandatory | Not specified |
| 10 | Whether the ERP is the system of record for attendance (6.1 mentions ERP upload) | Integration question |

**Leave fee amounts blank in the database until the Examination Section confirms them. Do not seed plausible-looking numbers.**

---

## 3. Database schema design

SQLite for the project build, PostgreSQL-compatible DDL. All tables carry `created_at` and `updated_at`.

### 3.1 Identity and org

```sql
CREATE TABLE students (
    student_id      TEXT PRIMARY KEY,           -- roll number, the only identifier
    name            TEXT NOT NULL,
    branch_code     TEXT NOT NULL REFERENCES branches(branch_code),
    program         TEXT NOT NULL DEFAULT 'B.Tech',
    entry_type      TEXT NOT NULL DEFAULT 'REGULAR',   -- REGULAR | LES
    current_year    INTEGER NOT NULL,           -- 1..4
    current_sem     INTEGER NOT NULL,           -- 1..8
    section         TEXT NOT NULL,
    regulation      TEXT NOT NULL DEFAULT 'HR22',
    photo_path      TEXT,                       -- NULL unless a photo is required
    photo_purpose   TEXT,                       -- 'HALL_TICKET' etc. Justify every photo.
    status          TEXT NOT NULL DEFAULT 'ACTIVE',    -- ACTIVE | INACTIVE | PURGED
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches (
    branch_code  TEXT PRIMARY KEY,   -- CSE, CSM, CSD, CSO, CSC, ECE, EEE, ME
    branch_name  TEXT NOT NULL,
    department   TEXT NOT NULL
);

CREATE TABLE faculty (
    faculty_id   TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    department   TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'ACTIVE'
);
```

### 3.2 Curriculum

```sql
CREATE TABLE courses (
    course_code   TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    category      TEXT NOT NULL,     -- BS|ES|HS|PC|PE|OE|PRJ|MC|AC
    course_type   TEXT NOT NULL,     -- THEORY|PRACTICAL|INTEGRATED|DESIGN|PROJECT|MANDATORY|AUDIT
    credits       REAL NOT NULL,
    lecture_hrs   INTEGER DEFAULT 0,
    tutorial_hrs  INTEGER DEFAULT 0,
    practical_hrs INTEGER DEFAULT 0,
    branch_code   TEXT REFERENCES branches(branch_code),   -- NULL for open electives
    semester      INTEGER NOT NULL,
    regulation    TEXT NOT NULL DEFAULT 'HR22'
);

-- "Subjects handled" by a faculty member
CREATE TABLE faculty_course_map (
    id             INTEGER PRIMARY KEY,
    faculty_id     TEXT NOT NULL REFERENCES faculty(faculty_id),
    course_code    TEXT NOT NULL REFERENCES courses(course_code),
    section        TEXT NOT NULL,
    academic_year  TEXT NOT NULL,     -- '2026-27'
    semester       INTEGER NOT NULL,
    UNIQUE (faculty_id, course_code, section, academic_year, semester)
);

CREATE TABLE student_course_registration (
    id             INTEGER PRIMARY KEY,
    student_id     TEXT NOT NULL REFERENCES students(student_id),
    course_code    TEXT NOT NULL REFERENCES courses(course_code),
    academic_year  TEXT NOT NULL,
    semester       INTEGER NOT NULL,
    status         TEXT NOT NULL DEFAULT 'REGISTERED',  -- REGISTERED|DROPPED|DETAINED
    UNIQUE (student_id, course_code, academic_year, semester)
);
```

### 3.3 Attendance

```sql
CREATE TABLE class_sessions (
    session_id     INTEGER PRIMARY KEY,
    course_code    TEXT NOT NULL REFERENCES courses(course_code),
    section        TEXT NOT NULL,
    faculty_id     TEXT NOT NULL REFERENCES faculty(faculty_id),
    academic_year  TEXT NOT NULL,
    semester       INTEGER NOT NULL,
    session_date   DATE NOT NULL,
    period_no      INTEGER NOT NULL,
    component      TEXT NOT NULL DEFAULT 'THEORY',  -- THEORY|PRACTICAL (integrated courses need both)
    periods_count  INTEGER NOT NULL DEFAULT 1,      -- a 2-hr lab counts as 2
    topic          TEXT,
    is_conducted   BOOLEAN NOT NULL DEFAULT 1,
    UNIQUE (course_code, section, academic_year, semester, session_date, period_no)
);

CREATE TABLE attendance (
    id           INTEGER PRIMARY KEY,
    session_id   INTEGER NOT NULL REFERENCES class_sessions(session_id),
    student_id   TEXT NOT NULL REFERENCES students(student_id),
    status       TEXT NOT NULL,      -- P | A | OD
    marked_by    TEXT NOT NULL REFERENCES faculty(faculty_id),
    marked_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, student_id)
);
CREATE INDEX idx_att_student ON attendance(student_id);
```

`periods_count` matters: a two-hour lab is two periods of contact. Counting sessions instead of periods would understate lab weight in the aggregate.

### 3.4 Continuous assessment (no marks)

```sql
-- Reference data from HR-22 §8. Read-only at runtime.
CREATE TABLE assessment_types (
    type_code       TEXT PRIMARY KEY,   -- MID1, MID2, ASSIGN1, QUIZ, PBL, GD, PRESENT, OPENBOOK, LAB_DAILY, COURSE_PROJECT
    display_name    TEXT NOT NULL,
    applies_to      TEXT NOT NULL,      -- THEORY|PRACTICAL|INTEGRATED|DESIGN
    weightage_marks REAL,               -- e.g. 5 for assignment, 25 for a mid
    cie_component   TEXT,               -- 'MID' | 'PART_III' | 'ASSIGNMENT' | 'DAY_TO_DAY' | 'PROJECT'
    regulation      TEXT NOT NULL DEFAULT 'HR22',
    clause_ref      TEXT,               -- '8.2A(d)' — traceability back to the regulation
    notes           TEXT
);

CREATE TABLE assessments (
    assessment_id  INTEGER PRIMARY KEY,
    course_code    TEXT NOT NULL REFERENCES courses(course_code),
    section        TEXT NOT NULL,
    type_code      TEXT NOT NULL REFERENCES assessment_types(type_code),
    academic_year  TEXT NOT NULL,
    semester       INTEGER NOT NULL,
    title          TEXT,
    syllabus_scope TEXT,                -- 'Modules 1-3' etc.
    scheduled_date DATE,
    due_date       DATE,
    conducted      BOOLEAN NOT NULL DEFAULT 0,
    conducted_on   DATE,
    created_by     TEXT REFERENCES faculty(faculty_id)
);

-- Participation only. There is deliberately no marks column here.
CREATE TABLE assessment_participation (
    id             INTEGER PRIMARY KEY,
    assessment_id  INTEGER NOT NULL REFERENCES assessments(assessment_id),
    student_id     TEXT NOT NULL REFERENCES students(student_id),
    participation  TEXT NOT NULL,   -- SUBMITTED | NOT_SUBMITTED | PRESENT | ABSENT | EXEMPTED
    recorded_by    TEXT REFERENCES faculty(faculty_id),
    recorded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (assessment_id, student_id)
);
```

### 3.5 Examinations

```sql
CREATE TABLE exams (
    exam_id         INTEGER PRIMARY KEY,
    exam_type       TEXT NOT NULL,    -- CIE | SEE | SUPPLEMENTARY
    title           TEXT NOT NULL,
    academic_year   TEXT NOT NULL,
    semester        INTEGER NOT NULL,
    regulation      TEXT NOT NULL DEFAULT 'HR22',
    reg_opens_on    DATE,
    reg_closes_on   DATE,             -- [CONFIRM WITH HITAM] per-semester notification
    start_date      DATE,
    end_date        DATE,
    notification_ref TEXT,            -- link/number of the official exam notification
    status          TEXT NOT NULL DEFAULT 'DRAFT'  -- DRAFT|PUBLISHED|COMPLETED
);

CREATE TABLE exam_timetable (
    id            INTEGER PRIMARY KEY,
    exam_id       INTEGER NOT NULL REFERENCES exams(exam_id),
    course_code   TEXT NOT NULL REFERENCES courses(course_code),
    exam_date     DATE NOT NULL,
    session       TEXT NOT NULL,      -- FN | AN
    duration_min  INTEGER NOT NULL,   -- 180 for SEE, 90 for a mid
    venue         TEXT,
    UNIQUE (exam_id, course_code)
);

CREATE TABLE exam_registration (
    id             INTEGER PRIMARY KEY,
    exam_id        INTEGER NOT NULL REFERENCES exams(exam_id),
    student_id     TEXT NOT NULL REFERENCES students(student_id),
    course_code    TEXT NOT NULL REFERENCES courses(course_code),
    attempt_type   TEXT NOT NULL DEFAULT 'REGULAR',  -- REGULAR | SUPPLEMENTARY | RE_REGISTRATION
    status         TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | REGISTERED | REJECTED | CANCELLED
    registered_at  TIMESTAMP,
    UNIQUE (exam_id, student_id, course_code)
);

CREATE TABLE hall_tickets (
    id             INTEGER PRIMARY KEY,
    exam_id        INTEGER NOT NULL REFERENCES exams(exam_id),
    student_id     TEXT NOT NULL REFERENCES students(student_id),
    eligibility    TEXT NOT NULL,     -- ELIGIBLE | BLOCKED_ATTENDANCE | BLOCKED_FEE | BLOCKED_OTHER
    reason         TEXT,
    issued_on      TIMESTAMP,
    ticket_no      TEXT UNIQUE,
    UNIQUE (exam_id, student_id)
);

-- [CONFIRM WITH HITAM] — HR-22 defines no revaluation process.
CREATE TABLE revaluation_requests (
    id            INTEGER PRIMARY KEY,
    student_id    TEXT NOT NULL REFERENCES students(student_id),
    exam_id       INTEGER NOT NULL REFERENCES exams(exam_id),
    course_code   TEXT NOT NULL REFERENCES courses(course_code),
    request_type  TEXT NOT NULL,     -- RECOUNT | REVALUATION
    status        TEXT NOT NULL DEFAULT 'SUBMITTED',
    requested_on  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.6 Fees and condonation

```sql
CREATE TABLE fee_heads (
    fee_code       TEXT PRIMARY KEY,   -- EXAM_SEE, EXAM_SUPPLY, CONDONATION, RE_REGISTRATION, REVALUATION
    description    TEXT NOT NULL,
    amount         NUMERIC,            -- INTENTIONALLY NULL until HITAM confirms
    currency       TEXT DEFAULT 'INR',
    unit           TEXT,               -- PER_COURSE | PER_SEMESTER | FLAT
    effective_from DATE,
    source_ref     TEXT,               -- circular/notification reference
    is_confirmed   BOOLEAN NOT NULL DEFAULT 0   -- false = do not display as authoritative
);

CREATE TABLE fee_transactions (
    id             INTEGER PRIMARY KEY,
    student_id     TEXT NOT NULL REFERENCES students(student_id),
    fee_code       TEXT NOT NULL REFERENCES fee_heads(fee_code),
    exam_id        INTEGER REFERENCES exams(exam_id),
    academic_year  TEXT NOT NULL,
    semester       INTEGER,
    status         TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | PAID | WAIVED | REFUNDED
    reference_no   TEXT,               -- receipt number only; no payment instrument data
    recorded_on    TIMESTAMP
);

CREATE TABLE condonation_requests (
    id                INTEGER PRIMARY KEY,
    student_id        TEXT NOT NULL REFERENCES students(student_id),
    academic_year     TEXT NOT NULL,
    semester          INTEGER NOT NULL,
    aggregate_percent REAL NOT NULL,
    reason            TEXT,
    applied_on        DATE,
    decision          TEXT DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED
    decided_by        TEXT,
    decided_on        DATE,
    fee_txn_id        INTEGER REFERENCES fee_transactions(id),
    UNIQUE (student_id, academic_year)   -- HR-22 6.2: once per academic year
);
```

The `UNIQUE (student_id, academic_year)` constraint enforces HR-22's once-a-year rule at the database level, not just in application code.

### 3.7 Configuration, access, audit

```sql
CREATE TABLE regulation_config (
    config_key   TEXT NOT NULL,
    regulation   TEXT NOT NULL DEFAULT 'HR22',
    value        TEXT NOT NULL,
    clause_ref   TEXT,
    is_confirmed BOOLEAN NOT NULL DEFAULT 1,
    PRIMARY KEY (config_key, regulation)
);
-- seed: MIN_ATTENDANCE_PCT=75 (6.1), CONDONE_FLOOR_PCT=65 (6.2/6.4),
--       CONDONE_ONCE_PER=ACADEMIC_YEAR (6.2), CIE_MAX=40, SEE_MAX=60 (8.1),
--       MID_BEST_WEIGHT=0.8, MID_LEAST_WEIGHT=0.2 (8.2A)

CREATE TABLE app_users (
    user_id      INTEGER PRIMARY KEY,
    role         TEXT NOT NULL,   -- STUDENT|FACULTY|HOD|EXAM_SECTION|ADMIN
    linked_id    TEXT,            -- student_id or faculty_id
    auth_method  TEXT NOT NULL,   -- ID_ONLY (students) | PASSWORD (staff)
    password_hash TEXT,           -- NULL for students, always
    is_active    BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE audit_log (
    id          INTEGER PRIMARY KEY,
    actor_role  TEXT NOT NULL,
    actor_id    TEXT,
    action      TEXT NOT NULL,    -- VIEW | CREATE | UPDATE | DELETE | EXPORT | PURGE
    entity      TEXT NOT NULL,
    entity_id   TEXT,
    at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detail      TEXT
);
```

---

## 4. Entity relationships

```
branches 1──* students
branches 1──* courses                    (open electives have NULL branch)

faculty  1──* faculty_course_map *──1 courses
faculty  1──* class_sessions
faculty  1──* assessments (created_by)

students 1──* student_course_registration *──1 courses
students 1──* attendance          *──1 class_sessions *──1 courses
students 1──* assessment_participation *──1 assessments *──1 assessment_types
students 1──* exam_registration   *──1 exams
students 1──1 hall_tickets (per exam)
students 1──* fee_transactions    *──1 fee_heads
students 1──1 condonation_requests (per academic year)
students 1──* revaluation_requests

exams    1──* exam_timetable *──1 courses
exams    1──* exam_registration
exams    1──* hall_tickets

condonation_requests *──1 fee_transactions
```

Cardinality worth noting: `attendance` is the only high-volume table. For 3,000 students × ~25 periods/week × 16 weeks it reaches roughly 1.2 million rows per semester. Index on `(student_id)` and `(session_id)`; compute summaries nightly rather than on every page load.

---

## 5. User roles and permissions

| Capability | Student | Faculty | HOD | Exam Section | Admin |
|---|:--:|:--:|:--:|:--:|:--:|
| View own profile & attendance | ✔ | — | — | — | — |
| View any student in own section | — | ✔ | — | — | — |
| View any student in own department | — | — | ✔ | — | — |
| View any student, any department | — | — | — | ✔ | ✔ |
| Create/edit student records | — | — | — | ✔ | ✔ |
| Upload student photo | — | — | — | ✔ | ✔ |
| Create class sessions, mark attendance | — | ✔ (own sections) | — | — | — |
| Edit attendance after 48h | — | — | ✔ (with reason) | — | ✔ |
| Create assessments, record participation | — | ✔ (own sections) | — | — | — |
| Approve condonation | — | — | recommend | ✔ record decision | — |
| Create exams, timetable, registration windows | — | — | — | ✔ | ✔ |
| Record fee status | — | — | — | ✔ | ✔ |
| Generate hall tickets | — | — | — | ✔ | — |
| Edit regulation_config / fee_heads | — | — | — | — | ✔ |
| View audit log | — | — | own dept | ✔ | ✔ |
| Purge data | — | — | — | — | ✔ |

Notes:
- The Academic Committee decision under HR-22 6.2 is recorded by the Exam Section; the system does not make the decision, it records it.
- Faculty scope is derived from `faculty_course_map`, evaluated on every request. Never trust a section ID sent by the client.
- Attendance becomes read-only to faculty after a configurable window (suggest 48 hours) to prevent retroactive edits; corrections after that need an HOD with a stated reason, logged.

---

## 6. Attendance calculation logic

### 6.1 Definitions

For a student `s`, academic year `y`, semester `m`:

```
conducted_periods(s, c) = Σ periods_count
                          over class_sessions of course c and s's section
                          where is_conducted = 1 and session_date <= cutoff_date

attended_periods(s, c)  = Σ periods_count
                          over the same sessions where attendance.status ∈ ATTEND_SET

ATTEND_SET = {'P'} ∪ ({'OD'} if config COUNT_OD_AS_PRESENT = true)   ← [CONFIRM WITH HITAM]
```

**Subject-wise:**
```
subject_pct(s, c) = 100 × attended_periods(s, c) / conducted_periods(s, c)
```

**Aggregate (this is the one that governs SEE eligibility, HR-22 6.1):**
```
aggregate_pct(s) = 100 × Σ_c attended_periods(s, c) / Σ_c conducted_periods(s, c)
```

`c` ranges over **all** registered courses including mandatory non-credit courses — clause 6.1 says so explicitly. It is a periods-weighted aggregate, not the mean of the per-subject percentages. Those two give different answers and only the first matches the regulation.

### 6.2 Eligibility banding

```python
def attendance_status(aggregate_pct, condonation):
    MIN      = config("MIN_ATTENDANCE_PCT")     # 75  — HR-22 6.1
    FLOOR    = config("CONDONE_FLOOR_PCT")      # 65  — HR-22 6.2, 6.4

    if aggregate_pct >= MIN:
        return "ELIGIBLE", "Meets the 75% aggregate requirement."

    if aggregate_pct >= FLOOR:
        if condonation and condonation.decision == "APPROVED":
            return "ELIGIBLE_CONDONED", "Shortage condoned by the Academic Committee."
        if condonation and condonation.decision == "PENDING":
            return "CONDONATION_PENDING", "Application under review."
        if already_condoned_this_academic_year(student, year):
            return "NOT_ELIGIBLE", "Condonation already availed once this academic year (HR-22 6.2)."
        return "CONDONABLE", "Below 75% but at or above 65% — may apply for condonation."

    return "DETAINED", "Below 65%. Cannot be condoned under any circumstance (HR-22 6.4)."
```

### 6.3 Integrated and mandatory courses

Clause 8.8 requires 75% in **both** the theory and practical components of an integrated course, so those are computed separately using `component` on `class_sessions` and reported as their own flags. Likewise mandatory (8.9a) and audit (8.9b) courses each carry their own 75% floor. A student can clear the aggregate and still fail one of these — the dashboard must surface that rather than showing a single green tick.

### 6.4 Edge cases to handle explicitly

- **Zero conducted periods** → show "—", never divide by zero, never show 0%.
- **Cancelled class** → `is_conducted = 0`; excluded from both numerator and denominator.
- **Unmarked session** → excluded from the denominator until marked, and flagged to the faculty member. Treating unmarked as absent silently is the most common bug in systems like this.
- **Mid-semester joiner / re-admission** → denominator starts at their registration date.
- **Detained student (HR-22 6.5)** → mark `student_course_registration.status = 'DETAINED'`; the semester's records are retained for audit but excluded from active computation.

### 6.5 Recomputation

Summaries are recomputed on a nightly job and on demand when a faculty member saves attendance for a session. Store the result in a `attendance_summary` materialised table keyed by `(student_id, course_code, academic_year, semester)` plus an aggregate row, so student dashboards read one row instead of scanning a million.

---

## 7. Assessment workflow

```
Faculty                          System                        Student
   │                                │                             │
   ├─ Create assessment ───────────►│                             │
   │  (course, section, type,       │ validates type is valid     │
   │   scope, scheduled date)       │ for the course_type         │
   │                                ├── appears in "Upcoming" ───►│
   │                                │                             │
   ├─ Conduct on the day            │                             │
   ├─ Mark conducted = true ───────►│                             │
   │                                │                             │
   ├─ Record participation ────────►│                             │
   │  per student: SUBMITTED /      │ writes participation only,  │
   │  NOT_SUBMITTED / PRESENT /     │ NO marks field exists       │
   │  ABSENT / EXEMPTED             │                             │
   │                                ├── "Assignment 1 (5 marks    │
   │                                │    weightage) — Submitted"─►│
```

Sequencing rules drawn from HR-22 8.2A:
- Every theory course gets exactly two mid-terms per semester. Creating a third should warn.
- Mid-1's `syllabus_scope` defaults to the first half of the syllabus, Mid-2 to the second half.
- Assignment 1 is due before Mid-1; Assignment 2 before Mid-2. The system flags an assignment scheduled after its mid.
- Part-III activities (presentation / GD / quiz / open-book / PBL) are expected before each mid.
- Lab courses additionally get day-to-day evaluation and one course-level project.

The system shows students a **completion checklist**, not a score: which components were conducted, which they participated in, and what each is worth. That is genuinely the useful signal for a student and it needs no marks at all.

---

## 8. Examination workflow

```
1. NOTIFY      Exam Section creates an exam (CIE/SEE/SUPPLEMENTARY),
               attaches the official notification reference, sets the
               registration window.                    status = DRAFT

2. TIMETABLE   Course-wise dates, session (FN/AN), duration, venue.
               SEE = 180 min, mid = 90 min (HR-22 8.2).
                                                       status = PUBLISHED

3. REGISTER    Student or Exam Section registers the student for each
               course, flagged REGULAR / SUPPLEMENTARY / RE_REGISTRATION.

4. FEE         Fee transaction raised per fee_head. Status PENDING → PAID.

5. ELIGIBILITY Computed per student per exam:
                 attendance_ok  = attendance_status ∈ {ELIGIBLE, ELIGIBLE_CONDONED}
                 fee_ok         = no PENDING exam fee for this exam
                 no_withholding = no results-withheld flag (HR-22 §13)
                 registered     = exam_registration.status = REGISTERED
               ALL four → ELIGIBLE. Otherwise the blocking reason is named.

6. HALL TICKET Generated only for ELIGIBLE students. Carries name, student
               ID, branch, photo, and the course/date/session/venue list.
               This is the only screen that needs the photo.

7. CONDUCT     Exam held. This system does not handle marks or evaluation.

8. POST-EXAM   Supplementary registration opens for students who need it
               (HR-22 §14: ~2 weeks after results, subject to the remedial
               attendance condition). Revaluation window [CONFIRM WITH HITAM].
```

Supplementary-specific rule from 7.1: a student re-registering for a failed course must complete at least 75% of the institute's backlog-clearance classes before applying. That is a second, separate attendance computation over `class_sessions` tagged as backlog classes — worth modelling as a distinct `session_category` value rather than a special case in code.

---

## 9. Fee-management workflow

```
fee_heads (configured by Admin, amounts blank until confirmed)
   │
   ├─ EXAM_SEE          per course / per semester   [amount: CONFIRM]
   ├─ EXAM_SUPPLY       per course                  [amount: CONFIRM]
   ├─ CONDONATION       flat, HR-22 6.3             [amount: CONFIRM]
   ├─ RE_REGISTRATION   per course, HR-22 8.7       [amount: CONFIRM]
   └─ REVALUATION       per course                  [exists? CONFIRM]

Flow:
  Trigger event  ──►  raise fee_transaction (PENDING)
                          │
                          ├─ Exam Section records receipt no. ──► PAID
                          ├─ Scholarship / institute decision ──► WAIVED
                          └─ remains PENDING ──► blocks hall ticket,
                                                 and feeds the HR-22 §13
                                                 results-withholding flag
```

Deliberate scope limits:
- The system **records** payment status; it does not process payments. No card, UPI, bank account or transaction-instrument data is stored. Only an institute receipt number.
- `fee_heads.is_confirmed = 0` renders the amount as "To be confirmed" in the UI rather than showing a number. A wrong fee figure on a student-facing screen is worse than no figure.
- Waivers record *that* a waiver was applied, not the reason category, since reason categories tend to encode income or caste data.

---

## 10. Suggested screens

**Public**
1. Landing page — institute branding, three sign-in routes
2. Student sign-in — roll number only
3. Staff sign-in — faculty / HOD / exam section / admin, with password

**Student (5 screens)**
4. Dashboard — aggregate attendance ring with the 75% and 65% thresholds marked, eligibility banner, next 3 assessments, next 3 exams, fee status chip
5. Attendance detail — per-subject bars, integrated-course split, "classes you can still miss" counter
6. Attendance history — date-wise table, filter by subject and month
7. Assessments — grouped by subject, each showing weightage and participation state
8. Examinations — timetable, registration status, fee status, hall ticket download when eligible

**Faculty (5 screens)**
9. Dashboard — today's sessions, unmarked backlog, sections at risk
10. Mark attendance — section roster with photos off by default, P/A/OD toggles, bulk "all present"
11. Section attendance overview — sortable by percentage, shortage highlighting
12. Assessments — create, mark conducted, record participation
13. Subjects handled — read-only mapping

**HOD (2 screens)**
14. Department overview — shortage counts by section and subject, faculty marking compliance
15. Condonation recommendations queue

**Exam Section (6 screens)**
16. Exam setup and timetable builder
17. Registration monitor — counts by course, unregistered list
18. Eligibility roll-up — filter by blocking reason
19. Condonation decisions
20. Fee status board
21. Hall ticket generation and reprint log

**Admin (4 screens)**
22. Regulation configuration — every value with its HR-22 clause reference
23. Fee head configuration, with a confirmed/unconfirmed toggle
24. Users and role assignment
25. Privacy console — audit log, demo-mode switch, retention timer, purge

---

## 11. API structure

REST, JSON, prefix `/api/v1`. Staff endpoints require a bearer token; student endpoints require a student session.

### Students
```
POST   /students/session          { student_id }              → student identity (ID-only sign-in)
GET    /students/me                                           → own profile
GET    /students                  ?branch=&section=&year=     → list (staff only)
POST   /students                                              → create (exam section/admin)
PATCH  /students/{id}                                         → update
POST   /students/{id}/photo                                   → upload (requires photo_purpose)
DELETE /students/{id}                                         → soft delete
```

### Faculty & curriculum
```
GET    /faculty                   ?department=
POST   /faculty
GET    /faculty/{id}/courses      ?academic_year=&semester=   → subjects handled
GET    /courses                   ?branch=&semester=&regulation=
POST   /faculty-course-map
```

### Attendance
```
POST   /sessions                                              → create a class session
GET    /sessions                  ?course=&section=&date=
POST   /sessions/{id}/attendance  { entries:[{student_id,status}] }
PATCH  /sessions/{id}/attendance  { entries:[...], reason }   → correction, audited
GET    /attendance/summary/{student_id}?academic_year=&semester=
         → { aggregate_pct, status, reason, subjects:[{course_code,pct,attended,conducted}],
             integrated:[{course_code,theory_pct,practical_pct}], can_miss }
GET    /attendance/history/{student_id}?course=&from=&to=
GET    /attendance/shortage       ?branch=&section=&band=CONDONABLE|DETAINED
```

### Assessments
```
GET    /assessment-types          ?course_type=&regulation=   → weightage reference
POST   /assessments
PATCH  /assessments/{id}          { conducted: true, conducted_on }
POST   /assessments/{id}/participation { entries:[{student_id,participation}] }
GET    /assessments/student/{student_id}?academic_year=&semester=
GET    /assessments/upcoming/{student_id}
```

### Examinations
```
POST   /exams
PATCH  /exams/{id}                { status: "PUBLISHED" }
POST   /exams/{id}/timetable
GET    /exams/{id}/timetable
POST   /exams/{id}/registrations  { student_id, course_codes[], attempt_type }
GET    /exams/{id}/registrations  ?status=
GET    /exams/{id}/eligibility/{student_id}
         → { eligible, blocking_reasons:[...], attendance_status, fee_status }
POST   /exams/{id}/hall-tickets/generate                      → bulk, eligible only
GET    /exams/{id}/hall-tickets/{student_id}                  → PDF
POST   /revaluation-requests                                  → [CONFIRM WITH HITAM]
```

### Fees & condonation
```
GET    /fee-heads
PATCH  /fee-heads/{code}          { amount, source_ref, is_confirmed }   (admin)
POST   /fee-transactions          { student_id, fee_code, exam_id }
PATCH  /fee-transactions/{id}     { status: "PAID", reference_no }
GET    /fee-transactions/student/{student_id}
POST   /condonation-requests      { student_id, academic_year, semester, reason }
PATCH  /condonation-requests/{id} { decision, decided_by }
```

### Admin & privacy
```
GET    /config                    ?regulation=HR22
PATCH  /config/{key}
GET    /audit-log                 ?actor=&entity=&from=&to=
POST   /admin/demo-mode           { enabled: true }
POST   /admin/purge               { confirm_token }           → destroys all student data
```

Consistent error shape:
```json
{ "error": { "code": "ATTENDANCE_BELOW_FLOOR",
             "message": "Aggregate attendance is 61.2%, below the 65% condonation floor.",
             "clause": "HR-22 6.4" } }
```
Quoting the clause in the error is worth the small effort — it stops arguments before they start.

---

## 12. Security and privacy considerations

### 12.1 The honest limitation of ID-only student login

Roll numbers are predictable and widely known. Anyone who knows a roll number can view that student's attendance. This is an accepted trade-off **only** under these conditions:

- No marks, contact details, or identity documents are ever added to the student view
- The system is not exposed to the open internet, or is behind campus network / VPN restriction
- The demo runs on synthetic data

If any of those stops being true, add one of: an institute-issued one-time code, SSO against the college's existing identity provider, or a short-lived link issued by the department. Do not bolt on a password field and call it solved — that would reintroduce exactly the credential-storage problem this design avoids.

Staff accounts keep passwords, hashed with bcrypt (cost ≥ 12). Staff can change data; students cannot.

### 12.2 Data minimisation in practice

- Photos are stored only when `photo_purpose` is set, and the only screen that renders them is hall-ticket generation. Faculty attendance rosters default to **names without photos**; a photo view is a deliberate toggle that writes an audit entry.
- No email, phone, address, Aadhaar, DOB, category, or guardian fields exist in the schema. Adding one should require a schema migration and a documented justification — the friction is the point.
- Fee records hold a receipt number, never an instrument. No payment data touches this system.
- Reasons for condonation are free text and should be kept short; instruct staff not to record medical detail.

### 12.3 Access control and audit

- Enforce role scope server-side on every request. Faculty scope derives from `faculty_course_map`; never accept a section from the client.
- Log every read of another person's record, every export, and every photo view, with actor, timestamp, and target.
- Rate-limit `/students/session` to blunt roll-number enumeration, and log repeated failures.
- Exports are CSV with a watermark row naming the exporting user and the time.

### 12.4 Retention and deletion

- `students.status = 'PURGED'` clears name and photo but retains the anonymised ID for referential integrity in audit records.
- A scheduled retention job runs at a configurable interval (default: purge everything 30 days after the project end date).
- The Admin privacy console exposes a single confirmed **Purge all student data** action that empties `students`, `attendance`, `assessment_participation`, `exam_registration`, `fee_transactions`, `hall_tickets`, and stored photo files, then writes one final audit entry.
- Document the purge date in the project report.

### 12.5 Demo mode

A global switch that routes every read to the synthetic dataset in §13 and disables all photo rendering. Use it for every demonstration, viva, and screenshot. Only turn it off if HITAM has given written authorisation to handle real student data — and if they have, treat §12.1 as a blocker, not a note.

### 12.6 Operational hygiene

- Secrets in environment variables, never in the repository. Rotate anything that has ever been committed.
- Restrict CORS to the known frontend origins.
- HTTPS only; HSTS on.
- Parameterised queries throughout (the ORM handles this — do not hand-build SQL for reports).
- Validate uploaded photos: image MIME type, size cap, strip EXIF (EXIF can carry GPS coordinates).
- Backups are encrypted and deleted on the same retention schedule as live data.

---

## 13. Sample dummy dataset

Entirely synthetic. Roll numbers use the reserved prefix `HTDEMO` so that no real HITAM roll number pattern can be mistaken for it.

**branches**
| branch_code | branch_name | department |
|---|---|---|
| CSE | Computer Science and Engineering | CSE |
| CSM | CSE (Artificial Intelligence & Machine Learning) | CSE |
| CSD | CSE (Data Science) | CSE |
| ECE | Electronics and Communication Engineering | ECE |

**students**
| student_id | name | branch | year | sem | section |
|---|---|---|---|---|---|
| HTDEMO001 | Aarav Reddy | CSM | 3 | 5 | A |
| HTDEMO002 | Sneha Kulkarni | CSM | 3 | 5 | A |
| HTDEMO003 | Mohammed Irfan | CSM | 3 | 5 | A |
| HTDEMO004 | Divya Prasad | CSM | 3 | 5 | B |
| HTDEMO005 | Rahul Varma | CSE | 3 | 5 | A |
| HTDEMO006 | Keerthi Nair | CSD | 2 | 3 | A |

**faculty**
| faculty_id | name | department |
|---|---|---|
| HTFAC01 | Dr. S. Ramesh | CSE |
| HTFAC02 | Prof. A. Lakshmi | CSE |
| HTFAC03 | Dr. P. Nagarjuna | ECE |

**courses**
| course_code | title | type | credits | sem |
|---|---|---|---|---|
| CSM501 | Machine Learning | THEORY | 3 | 5 |
| CSM502 | Computer Networks | THEORY | 3 | 5 |
| CSM551 | Machine Learning Lab | PRACTICAL | 1.5 | 5 |
| CSM503 | Data Warehousing & Mining | INTEGRATED | 4 | 5 |
| MC501 | Environmental Science | MANDATORY | 0 | 5 |

**faculty_course_map**
| faculty_id | course_code | section |
|---|---|---|
| HTFAC01 | CSM501 | A |
| HTFAC01 | CSM551 | A |
| HTFAC02 | CSM502 | A |

**attendance snapshot** (sem 5, cut-off 30-Sep-2026)

| student | CSM501 | CSM502 | CSM551 | CSM503-Th | CSM503-Lab | MC501 | **Aggregate** | **Status** |
|---|---|---|---|---|---|---|---|---|
| HTDEMO001 | 88% | 91% | 95% | 86% | 90% | 80% | **89.1%** | ELIGIBLE |
| HTDEMO002 | 74% | 70% | 80% | 68% | 76% | 65% | **72.4%** | CONDONABLE |
| HTDEMO003 | 58% | 61% | 70% | 55% | 64% | 50% | **59.8%** | DETAINED |
| HTDEMO004 | 82% | 79% | 88% | 84% | 72% | 78% | **81.0%** | ELIGIBLE, but CSM503 lab below 75% — flagged (HR-22 8.8) |

HTDEMO004 is included on purpose: it is the case a naive implementation gets wrong.

**assessments** (CSM501, section A)
| type_code | title | weightage | scheduled | conducted |
|---|---|---|---|---|
| ASSIGN1 | Assignment 1 — Regression | 5 | 12-Aug-2026 | Yes |
| MID1 | Mid-Term 1 (Modules 1-2) | 25 | 26-Aug-2026 | Yes |
| QUIZ | Quiz — Model Evaluation | part of Part-III (10) | 10-Sep-2026 | Yes |
| ASSIGN2 | Assignment 2 — Neural Networks | 5 | 14-Oct-2026 | No |
| MID2 | Mid-Term 2 (Modules 3-5) | 25 | 28-Oct-2026 | No |

**assessment_participation** (Assignment 1)
| student | participation |
|---|---|
| HTDEMO001 | SUBMITTED |
| HTDEMO002 | SUBMITTED |
| HTDEMO003 | NOT_SUBMITTED |
| HTDEMO004 | SUBMITTED |

**exams**
| exam_id | type | title | sem | start | end | status |
|---|---|---|---|---|---|---|
| 1 | CIE | Mid-Term 1, Odd Sem 2026-27 | 5 | 26-Aug-2026 | 30-Aug-2026 | COMPLETED |
| 2 | SEE | Semester End Exam, Odd Sem 2026-27 | 5 | 20-Nov-2026 | 05-Dec-2026 | PUBLISHED |

**exam_timetable** (exam 2)
| course | date | session | duration |
|---|---|---|---|
| CSM501 | 20-Nov-2026 | FN | 180 |
| CSM502 | 23-Nov-2026 | FN | 180 |
| CSM503 | 26-Nov-2026 | FN | 180 |
| CSM551 | 01-Dec-2026 | AN | 180 |

**fee_heads** — note every amount is deliberately blank
| fee_code | description | amount | is_confirmed |
|---|---|---|---|
| EXAM_SEE | Semester end examination fee | *(pending)* | 0 |
| EXAM_SUPPLY | Supplementary examination fee | *(pending)* | 0 |
| CONDONATION | Attendance condonation fee (HR-22 6.3) | *(pending)* | 0 |
| RE_REGISTRATION | Course re-registration fee (HR-22 8.7) | *(pending)* | 0 |

**derived eligibility for exam 2**
| student | attendance | fee | registered | hall ticket |
|---|---|---|---|---|
| HTDEMO001 | ELIGIBLE | PAID | Yes | ELIGIBLE |
| HTDEMO002 | CONDONATION_PENDING | PAID | Yes | BLOCKED_ATTENDANCE |
| HTDEMO003 | DETAINED | — | No | BLOCKED_ATTENDANCE |
| HTDEMO004 | ELIGIBLE | PENDING | Yes | BLOCKED_FEE |

---

## 14. Recommended technology stack

You already have FastAPI + SQLAlchemy + vanilla JS working in the doubt portal. Reuse it — a familiar stack you can debug at 11pm before a review beats an impressive one you can't.

| Layer | Choice | Why |
|---|---|---|
| Backend | Python 3.11+, FastAPI | Already in use; automatic OpenAPI docs are a free viva asset |
| ORM | SQLAlchemy 2.x | Already in use |
| Migrations | Alembic | This schema will change; ad-hoc `create_all` will bite you |
| Database | SQLite (dev) → PostgreSQL (deploy) | SQLite is fine for a demo; the attendance table outgrows it at scale |
| Validation | Pydantic v2 | Already in use |
| Staff auth | bcrypt + JWT (short expiry) | Standard, well understood |
| Frontend | Plain HTML/CSS/JS, or React if the team knows it | Don't learn a framework during a project deadline |
| Charts | Chart.js | Already loaded in your dashboard |
| PDF (hall tickets) | ReportLab or WeasyPrint | Server-side generation, no client dependency |
| Background jobs | APScheduler | Nightly attendance rollup and retention purge |
| Deployment | Render / Railway (backend), Vercel / Netlify (frontend) | Free tiers; matches your current setup |
| Testing | pytest | Attendance maths must have unit tests — see below |

**Test these specifically**, because they are where this kind of system goes wrong:
1. Aggregate is periods-weighted, not the average of subject percentages
2. Lab periods count as 2, not 1
3. Zero conducted classes returns "—", not 0% and not a crash
4. Unmarked sessions are excluded from the denominator
5. 74.99% is CONDONABLE, 75.00% is ELIGIBLE, 64.99% is DETAINED
6. A second condonation in the same academic year is rejected
7. Integrated course with theory 80% / lab 70% flags the lab

---

## 15. Build order

| Phase | Deliverable |
|---|---|
| 1 | Schema + migrations + seed script with the §13 dummy data |
| 2 | Student, faculty, course CRUD; role-scoped auth |
| 3 | Class sessions + attendance marking + calculation engine + unit tests |
| 4 | Student and faculty dashboards |
| 5 | Assessment catalogue and participation tracking |
| 6 | Exams, timetable, registration |
| 7 | Fees, condonation, hall-ticket eligibility, PDF generation |
| 8 | HOD and Exam Section reporting |
| 9 | Audit log, demo mode, retention purge, documentation |

Phase 3 is the core of the project. If time runs short, cut phases 7-8 before cutting the tests in phase 3.

---

## 16. Confirmation checklist for HITAM

Take this list to the Examination Section before going further:

1. Exact fee amounts for SEE, supplementary, condonation, and re-registration
2. Whether revaluation or recounting exists, and if so its window and fee
3. The attendance cut-off date used for SEE eligibility each semester
4. Whether On-Duty attendance counts as present, and any cap
5. Exam registration open and close dates for the current semester
6. Whether hall tickets require a photo, and the accepted photo specification
7. Whether the institute ERP remains the system of record for attendance (HR-22 6.1 refers to ERP upload), and whether this project should read from it or stay standalone
8. Written authorisation before any real student data is loaded — and until then, demo mode stays on

---

*Prepared as a college project design document. Academic rules cited from HITAM HR-22 Academic Regulations. All student, faculty and course data shown is fictional.*
