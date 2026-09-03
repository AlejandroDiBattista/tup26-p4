# Chat — Agent Guide

Chat is the minimal chat-first agent-native app. Chat is the primary surface;
actions carry the real capabilities, and screens exist only where a workflow
needs durable UI around the conversation.

## Skills

- `capture-learnings` — record a user preference or correction so it outlives
  the thread.
- `turn-into-app` — promote a recurring workflow in this chat into its own app.
- `turn-into-skill` — promote a repeated procedure into a reusable skill.
- `docs-search` reads the version-matched framework docs bundled with
  `@agent-native/core`; `source-search` reads core and first-party template
  implementations. Prefer both over memory when package APIs, actions, or agent
  surfaces are involved.

## Core Rules

- Follow the root framework contract: data in SQL, actions first, application
  state for navigation/selection, and shared agent chat for AI work.
- Store large file/blob payloads in configured file/blob storage, not SQL: no
  base64, `data:` URLs, images, video/audio, PDFs, ZIPs, screenshots,
  thumbnails, or replay chunks in app tables, `application_state`, `settings`,
  or `resources`; persist URLs, ids, or handles instead.
- Never hardcode API keys, tokens, webhook URLs, signing secrets, private
  Builder/internal data, customer data, or credential-looking literals. Use
  secrets/OAuth/runtime configuration and obvious placeholders in examples.
- Keep actions deterministic and focused. Research, analysis, generation,
  recommendation, and synthesis start in the AgentSidebar and let the agent
  orchestrate its tools; follow-ups stay in the same thread rather than moving
  the user to a second freeform prompt box.
- Never fabricate. If an action fails or data is missing, say so and recover
  instead of inventing a result or claiming success.
- Verify a write before reporting it done — re-read the row or the screen.
- Use `view-screen` or application state when the active page/selection is
  unclear.

## Gestión académica

The app manages one subject, Programación IV, taught in two commissions. The
student is the primary entity and belongs to exactly one commission. Practical
work is shared by the subject, while class dates and attendance are per
commission. All rows are owner-scoped — a teacher only sees their own data.

### Data model

| Table                | What it holds                                                  |
| -------------------- | -------------------------------------------------------------- |
| `subjects`           | The common subject and academic term.                          |
| `courses`            | A commission, its code and classroom.                          |
| `course_schedules`   | Weekly day and start/end time for a commission.                |
| `students`           | One row per student, keyed by `legajo` per teacher.            |
| `enrollments`        | The student's single active commission. Unique by student.     |
| `assessments`        | A subject-wide practical; `graded` marks those used as exams.  |
| `assessment_results` | Per-student state and optional grade for one practical.        |
| `class_sessions`     | A generated class date, time, status and cancellation details. |
| `attendance`         | Present, absent or justified for one student in one class.     |

### Actions

| Action                       | Args                                                     | Notes                                                                                                           |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `list-courses`               | —                                                        | GET. Includes classroom, schedule and student count.                                                            |
| `create-course`              | `name`, `commission`, `classroom?`, `term?`, `schedule?` |                                                                                                                 |
| `update-course`              | `course`, editable course fields and `schedule?`         | Omitted fields untouched.                                                                                       |
| `delete-course`              | `course`                                                 | Only an empty commission; confirm first.                                                                        |
| `list-students`              | `course?`                                                | GET. Without course, the complete roster. Includes each student's count of present attendance records.          |
| `exportar-alumnos-md`        | —                                                        | GET. Builds the complete student export.                                                                        |
| `exportar-alumnos-vcard`     | —                                                        | GET. Builds one vCard per student.                                                                              |
| `genera-carpetas-alumnos`    | —                                                        | Creates one folder per student under `practicos`; a matching legajo is renamed when the student's name changes. |
| `upsert-student`             | `legajo`, student fields, `course?`                      | Creates/edits by legajo; a new student requires a course. Passing course moves the student.                     |
| `delete-student`             | `legajo`                                                 | Deletes the student, results and attendance; confirm first.                                                     |
| `list-assessments`           | `course?`                                                | GET. Shared practicals; legacy `kind` is accepted but ignored.                                                  |
| `create-assessment`          | `title`, `date?`, `graded?`                              | Creates a subject-wide practical.                                                                               |
| `update-assessment`          | `assessmentId`, `title?`, `date?`, `graded?`             | Turning grading off clears grades.                                                                              |
| `delete-assessment`          | `assessmentId`                                           | Deletes all results; confirm first.                                                                             |
| `publicar-enunciado-trabajo` | `assessmentId`                                           | Generates student folders, then copies the matching `enunciados` folder without overwriting existing work.      |
| `set-assessment-result`      | `assessmentId`, `legajo`, `status?`, `score?`            | Status is pending/error/failure/presented; score is optional 1–10 only on graded work.                          |
| `work-grid`                  | `course?`                                                | GET. Students × shared practicals.                                                                              |
| `list-classes`               | `course`                                                 | GET. Includes generated and cancelled dates.                                                                    |
| `generate-classes`           | `course`, `startDate`, `endDate`                         | Adds matching weekly dates without duplicates.                                                                  |
| `create-class`               | `course`, `date`, `topic?`                               | Creates one date matching the schedule.                                                                         |
| `update-class`               | `classId`, `status?`, `reason?`, `note?`, `topic?`       | Cancel or confirm a class.                                                                                      |
| `delete-class`               | `classId`                                                | Deletes attendance too; confirm first.                                                                          |
| `set-attendance`             | `classId`, `entries: [{legajo, status}]`                 | Status is present/absent/justified; batch when possible.                                                        |
| `course-grid`                | `course`, `kind`                                         | GET compatibility grid for work or attendance.                                                                  |
| `course-summary`             | `course`                                                 | GET. Class-wide work, grades and attendance.                                                                    |
| `student-summary`            | `legajo`                                                 | GET. Contact data, one commission, shared work and class attendance.                                            |

`course` accepts an id, exact name or commission code such as C1/C3. Students
are always addressed by `legajo`, never by an internal id.

Prefer `course-summary` over stitching several grids together when the question
is about how the class as a whole is doing, and `student-summary` when it is
about one student — it answers "¿cómo viene Pérez?" in a single call, including
which prácticos are missing. Prefer `set-attendance` with every student in one
call over one call per student.

### Conventions

- Every practical starts as `pendiente`; other states are `error`, `falla` and
  `presentado`.
- A parcial is a practical with `graded=true`. Its optional grade is 1–10.
  State and grade are independent; never infer an approval threshold.
- Justified attendance does not count against the attendance percentage.
- Attendance can only be recorded for scheduled classes and students belonging
  to that class's commission.
- Classes may be cancelled for `feriado`, `asueto`, `examen`, `paro` or `otro`.
- Deleting a student, practical or class destroys dependent records. Confirm.
- Practical statements live in `../enunciados`. A folder is matched to the
  selected practical by its title without accents, punctuation, spaces or
  casing (`TP 1` → `tp1`). Publishing never overwrites a student's existing
  practical folder.

## Application State

- `navigation` describes the current view and selected entity ids. The default
  chat view is `chat` at `/`.
- Primary views are `alumnos`, `asistencia`, `trabajos`, `cursos` and `chat`.
  Course detail carries `courseId`; student detail carries `legajo`.
- `navigate` moves the UI. Use `view=alumno` plus `legajo` for a student sheet,
  or `view=cursos` plus `courseId` for commission setup.
- `view-screen` is the first tool to call when the user's visible context
  matters. It resolves the open course and the open student, so act on them
  instead of asking which comisión or which alumno the user means.

## Source Changes

Before building common workspace or agent UI, read `agent-native-toolkit`; read
`customizing-agent-native` before adapting shared UI.

- Guarded verification: run `pnpm agent-native:doctor`; fix findings before done.
