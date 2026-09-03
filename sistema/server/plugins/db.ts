import { ensureAdditiveColumns, getDbExec, runMigrations } from "@agent-native/core/db";

import * as schema from "../db/schema.js";

// Cada entrada lleva un `name` estable y único: los números de versión solos no
// son identidad segura si dos ramas extienden la lista en paralelo.
const runAgendaBaseMigrations = runMigrations(
  [
    {
      version: 1,
      name: "agenda-courses-table",
      sql: `CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        term TEXT,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_courses_owner_name
        ON courses (owner_email, name)`,
    },
    {
      version: 2,
      name: "agenda-students-table",
      sql: `CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        legajo TEXT NOT NULL,
        apellido TEXT NOT NULL,
        nombre TEXT NOT NULL,
        telefono TEXT,
        github TEXT,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_students_owner_legajo
        ON students (owner_email, legajo);
      CREATE INDEX IF NOT EXISTS idx_students_owner_apellido
        ON students (owner_email, apellido)`,
    },
    {
      version: 3,
      name: "agenda-enrollments-table",
      sql: `CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_owner_course_student
        ON enrollments (owner_email, course_id, student_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_owner_course
        ON enrollments (owner_email, course_id)`,
    },
    {
      version: 4,
      name: "agenda-assessments-table",
      sql: `CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        date TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_assessments_owner_course_kind_sort
        ON assessments (owner_email, course_id, kind, sort_order)`,
    },
    {
      version: 5,
      name: "agenda-assessment-results-table",
      sql: `CREATE TABLE IF NOT EXISTS assessment_results (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        submitted INTEGER,
        score REAL,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_results_owner_assessment_student
        ON assessment_results (owner_email, assessment_id, student_id);
      CREATE INDEX IF NOT EXISTS idx_results_owner_assessment
        ON assessment_results (owner_email, assessment_id)`,
    },
    {
      version: 6,
      name: "agenda-class-sessions-table",
      sql: `CREATE TABLE IF NOT EXISTS class_sessions (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        date TEXT NOT NULL,
        topic TEXT,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_class_sessions_owner_course_date
        ON class_sessions (owner_email, course_id, date)`,
    },
    {
      version: 7,
      name: "agenda-attendance-table",
      sql: `CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        present INTEGER NOT NULL DEFAULT 0,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_owner_session_student
        ON attendance (owner_email, session_id, student_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_owner_session
        ON attendance (owner_email, session_id)`,
    },
    {
      version: 8,
      name: "agenda-subject-shared-work-and-explicit-statuses",
      sql: `CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        academic_year INTEGER NOT NULL,
        term TEXT NOT NULL,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_subjects_owner_name_year_term
        ON subjects (owner_email, name, academic_year, term);

      CREATE TABLE IF NOT EXISTS course_schedules (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        weekday INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_course_schedules_owner_course_weekday
        ON course_schedules (owner_email, course_id, weekday);
      CREATE INDEX IF NOT EXISTS idx_course_schedules_owner_course
        ON course_schedules (owner_email, course_id)`,
    },
  ],
  { table: "agenda_migrations" },
);

const runAgendaDataMigrations = runMigrations(
  [
    {
      version: 9,
      name: "agenda-c1-c3-weekly-schedules",
      sql: `INSERT INTO subjects (
        id, name, academic_year, term, owner_email, created_at, updated_at
      )
      SELECT
        'subject:' || owner_email,
        'Programación IV',
        2026,
        '2.º cuatrimestre',
        owner_email,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM courses
      WHERE owner_email IS NOT NULL
      GROUP BY owner_email
      ON CONFLICT (id) DO NOTHING;

      UPDATE courses
      SET subject_id = 'subject:' || owner_email,
          commission = CASE
            WHEN name LIKE '%C1' THEN 'C1'
            WHEN name LIKE '%C3' THEN 'C3'
            ELSE commission
          END,
          classroom = CASE
            WHEN name LIKE '%C1' THEN '199'
            WHEN name LIKE '%C3' THEN '309'
            ELSE classroom
          END,
          updated_at = CURRENT_TIMESTAMP;

      UPDATE assessments
      SET subject_id = 'subject:' || owner_email,
          graded = CASE WHEN kind = 'parcial' THEN 1 ELSE graded END,
          kind = 'practico',
          updated_at = CURRENT_TIMESTAMP;

      UPDATE assessment_results
      SET status = CASE
        WHEN score IS NOT NULL THEN 'presentado'
        WHEN submitted = 1 THEN 'presentado'
        ELSE 'pendiente'
      END,
      updated_at = CURRENT_TIMESTAMP;

      UPDATE attendance
      SET status = CASE WHEN present = 1 THEN 'presente' ELSE 'ausente' END,
          updated_at = CURRENT_TIMESTAMP;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_owner_student
        ON enrollments (owner_email, student_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_class_sessions_owner_course_date_unique
        ON class_sessions (owner_email, course_id, date);
      CREATE INDEX IF NOT EXISTS idx_assessments_owner_subject_sort
        ON assessments (owner_email, subject_id, sort_order);

      INSERT INTO course_schedules (
        id, course_id, weekday, start_time, end_time, owner_email, created_at, updated_at
      )
      SELECT
        'schedule:' || id || ':1', id, 1,
        CASE WHEN commission = 'C1' THEN '08:00' ELSE '10:00' END,
        CASE WHEN commission = 'C1' THEN '10:00' ELSE '12:00' END,
        owner_email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM courses WHERE commission IN ('C1', 'C3')
      ON CONFLICT (owner_email, course_id, weekday) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        updated_at = CURRENT_TIMESTAMP;

      INSERT INTO course_schedules (
        id, course_id, weekday, start_time, end_time, owner_email, created_at, updated_at
      )
      SELECT
        'schedule:' || id || ':2', id, 2,
        CASE WHEN commission = 'C1' THEN '10:00' ELSE '08:00' END,
        CASE WHEN commission = 'C1' THEN '12:00' ELSE '10:00' END,
        owner_email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM courses WHERE commission IN ('C1', 'C3')
      ON CONFLICT (owner_email, course_id, weekday) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        updated_at = CURRENT_TIMESTAMP;

      INSERT INTO course_schedules (
        id, course_id, weekday, start_time, end_time, owner_email, created_at, updated_at
      )
      SELECT
        'schedule:' || id || ':3', id, 3,
        CASE WHEN commission = 'C1' THEN '10:00' ELSE '08:00' END,
        CASE WHEN commission = 'C1' THEN '12:00' ELSE '10:00' END,
        owner_email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM courses WHERE commission IN ('C1', 'C3')
      ON CONFLICT (owner_email, course_id, weekday) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        updated_at = CURRENT_TIMESTAMP;

      INSERT INTO course_schedules (
        id, course_id, weekday, start_time, end_time, owner_email, created_at, updated_at
      )
      SELECT
        'schedule:' || id || ':4', id, 4,
        CASE WHEN commission = 'C1' THEN '08:00' ELSE '10:00' END,
        CASE WHEN commission = 'C1' THEN '10:00' ELSE '12:00' END,
        owner_email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM courses WHERE commission IN ('C1', 'C3')
      ON CONFLICT (owner_email, course_id, weekday) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        updated_at = CURRENT_TIMESTAMP`,
    },
    {
      version: 10,
      name: "agenda-second-term-2026-class-calendar",
      sql: `WITH calendar(date, weekday, status, reason, note) AS (
        VALUES
          ('2026-08-10', 1, 'programada', NULL, 'Inicio del 2.º cuatrimestre'),
          ('2026-08-11', 2, 'programada', NULL, NULL),
          ('2026-08-12', 3, 'programada', NULL, NULL),
          ('2026-08-13', 4, 'programada', NULL, NULL),
          ('2026-08-17', 1, 'cancelada', 'feriado', 'Feriado nacional – San Martín'),
          ('2026-08-18', 2, 'programada', NULL, NULL),
          ('2026-08-19', 3, 'cancelada', 'asueto', 'Asueto académico y administrativo UTN'),
          ('2026-08-20', 4, 'programada', NULL, NULL),
          ('2026-08-24', 1, 'programada', NULL, NULL),
          ('2026-08-25', 2, 'programada', NULL, NULL),
          ('2026-08-26', 3, 'programada', NULL, NULL),
          ('2026-08-27', 4, 'programada', NULL, NULL),
          ('2026-08-31', 1, 'programada', NULL, NULL),
          ('2026-09-01', 2, 'programada', NULL, NULL),
          ('2026-09-02', 3, 'programada', NULL, NULL),
          ('2026-09-03', 4, 'programada', NULL, NULL),
          ('2026-09-07', 1, 'programada', NULL, NULL),
          ('2026-09-08', 2, 'programada', NULL, NULL),
          ('2026-09-09', 3, 'programada', NULL, 'Hay mesa de examen, sin suspensión'),
          ('2026-09-10', 4, 'programada', NULL, NULL),
          ('2026-09-14', 1, 'programada', NULL, 'Hay mesa de examen'),
          ('2026-09-15', 2, 'programada', NULL, NULL),
          ('2026-09-16', 3, 'programada', NULL, NULL),
          ('2026-09-17', 4, 'programada', NULL, NULL),
          ('2026-09-21', 1, 'cancelada', 'feriado', 'Feriado nacional – Día del Estudiante'),
          ('2026-09-22', 2, 'programada', NULL, NULL),
          ('2026-09-23', 3, 'programada', NULL, NULL),
          ('2026-09-24', 4, 'cancelada', 'feriado', 'Feriado provincial – Batalla de Tucumán'),
          ('2026-09-28', 1, 'programada', NULL, NULL),
          ('2026-09-29', 2, 'programada', NULL, NULL),
          ('2026-09-30', 3, 'programada', NULL, NULL),
          ('2026-10-01', 4, 'programada', NULL, NULL),
          ('2026-10-05', 1, 'programada', NULL, NULL),
          ('2026-10-06', 2, 'programada', NULL, NULL),
          ('2026-10-07', 3, 'programada', NULL, NULL),
          ('2026-10-08', 4, 'programada', NULL, NULL),
          ('2026-10-12', 1, 'cancelada', 'feriado', 'Feriado nacional'),
          ('2026-10-13', 2, 'programada', NULL, NULL),
          ('2026-10-14', 3, 'programada', NULL, NULL),
          ('2026-10-15', 4, 'programada', NULL, NULL),
          ('2026-10-19', 1, 'programada', NULL, NULL),
          ('2026-10-20', 2, 'programada', NULL, NULL),
          ('2026-10-21', 3, 'programada', NULL, NULL),
          ('2026-10-22', 4, 'programada', NULL, NULL),
          ('2026-10-26', 1, 'programada', NULL, NULL),
          ('2026-10-27', 2, 'programada', NULL, NULL),
          ('2026-10-28', 3, 'programada', NULL, NULL),
          ('2026-10-29', 4, 'programada', NULL, NULL),
          ('2026-11-02', 1, 'programada', NULL, NULL),
          ('2026-11-03', 2, 'programada', NULL, NULL),
          ('2026-11-04', 3, 'programada', NULL, NULL),
          ('2026-11-05', 4, 'programada', NULL, NULL),
          ('2026-11-09', 1, 'programada', NULL, NULL),
          ('2026-11-10', 2, 'programada', NULL, NULL),
          ('2026-11-11', 3, 'programada', NULL, NULL),
          ('2026-11-12', 4, 'programada', NULL, NULL),
          ('2026-11-16', 1, 'programada', NULL, NULL),
          ('2026-11-17', 2, 'programada', NULL, NULL),
          ('2026-11-18', 3, 'programada', NULL, NULL),
          ('2026-11-19', 4, 'programada', NULL, NULL),
          ('2026-11-23', 1, 'cancelada', 'feriado', 'Feriado trasladado – Soberanía Nacional'),
          ('2026-11-24', 2, 'programada', NULL, NULL),
          ('2026-11-25', 3, 'programada', NULL, 'Hay mesa de examen'),
          ('2026-11-26', 4, 'a_confirmar', 'asueto', 'Asueto administrativo por Día del Personal No Docente')
      )
      INSERT INTO class_sessions (
        id, course_id, date, start_time, end_time, status,
        cancellation_reason, cancellation_note, topic,
        owner_email, created_at, updated_at
      )
      SELECT
        'session:' || c.id || ':' || calendar.date,
        c.id,
        calendar.date,
        schedule.start_time,
        schedule.end_time,
        calendar.status,
        calendar.reason,
        calendar.note,
        NULL,
        c.owner_email,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM courses c
      INNER JOIN calendar ON 1 = 1
      INNER JOIN course_schedules schedule
        ON schedule.course_id = c.id
       AND schedule.owner_email = c.owner_email
       AND schedule.weekday = calendar.weekday
      WHERE c.commission IN ('C1', 'C3')
      ON CONFLICT (owner_email, course_id, date) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        status = excluded.status,
        cancellation_reason = excluded.cancellation_reason,
        cancellation_note = excluded.cancellation_note,
        updated_at = CURRENT_TIMESTAMP`,
    },
    {
      version: 11,
      name: "agenda-work-error-failure-statuses",
      sql: `UPDATE assessment_results
        SET status = CASE
          WHEN status = 'aprobado' THEN 'error'
          WHEN status = 'desaprobado' THEN 'falla'
          ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE status IN ('aprobado', 'desaprobado')`,
    },
    {
      version: 12,
      name: "agenda-mark-past-classes-absent",
      sql: `UPDATE attendance
        SET status = 'ausente',
            present = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE status IS NULL
          AND EXISTS (
            SELECT 1
            FROM class_sessions session
            WHERE session.id = attendance.session_id
              AND session.owner_email = attendance.owner_email
              AND session.status = 'programada'
              AND session.date < date('now')
          );

      INSERT INTO attendance (
        id, session_id, student_id, status, present,
        owner_email, created_at, updated_at
      )
      SELECT
        'attendance:auto-absent:' || session.id || ':' || enrollment.student_id,
        session.id,
        enrollment.student_id,
        'ausente',
        0,
        session.owner_email,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM class_sessions session
      INNER JOIN enrollments enrollment
        ON enrollment.owner_email = session.owner_email
       AND enrollment.course_id = session.course_id
      LEFT JOIN attendance mark
        ON mark.owner_email = session.owner_email
       AND mark.session_id = session.id
       AND mark.student_id = enrollment.student_id
      WHERE session.status = 'programada'
        AND session.date < date('now')
        AND mark.id IS NULL;`,
    },
  ],
  { table: "agenda_migrations" },
);

function isDrizzleTable(value: unknown): value is object {
  return (
    !!value &&
    typeof value === "object" &&
    Object.getOwnPropertySymbols(value).some((s) => s.toString().includes("drizzle"))
  );
}

const schemaTables = Object.values(schema).filter(isDrizzleTable);

async function ensureAgendaColumns(): Promise<void> {
  try {
    const summary = await ensureAdditiveColumns({
      db: getDbExec(),
      tables: schemaTables,
    });
    if (summary.errors.length > 0) {
      console.warn("[db] ensureAdditiveColumns completed with errors:", summary.errors);
    }
  } catch (err) {
    console.warn(
      "[db] ensureAdditiveColumns failed (non-fatal):",
      err instanceof Error ? err.message : err,
    );
  }
}

export async function runAgendaMigrations(nitroApp: any): Promise<void> {
  await runAgendaBaseMigrations(nitroApp);
  await ensureAgendaColumns();
  await runAgendaDataMigrations(nitroApp);
}

export default async (nitroApp: any): Promise<void> => {
  await runAgendaMigrations(nitroApp);
};
