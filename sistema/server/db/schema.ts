import {
  index,
  integer,
  now,
  real,
  table,
  text,
  uniqueIndex,
} from "@agent-native/core/db/schema";

/** La materia común a todas sus comisiones. */
export const subjects = table(
  "subjects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    academicYear: integer("academic_year").notNull(),
    term: text("term").notNull(),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({
    uniqueOwnerNameYear: uniqueIndex("idx_subjects_owner_name_year_term").on(
      t.ownerEmail,
      t.name,
      t.academicYear,
      t.term,
    ),
  }),
);

/** Una comisión de la materia. */
export const courses = table(
  "courses",
  {
    id: text("id").primaryKey(),
    subjectId: text("subject_id"),
    name: text("name").notNull(),
    commission: text("commission"),
    classroom: text("classroom"),
    /** Período libre: "2026 - 1er cuatrimestre", "Anual 2026", etc. */
    term: text("term"),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({
    byOwner: index("idx_courses_owner_name").on(t.ownerEmail, t.name),
  }),
);

/** Horarios semanales recurrentes de una comisión. 1 = lunes, 7 = domingo. */
export const courseSchedules = table(
  "course_schedules",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id").notNull(),
    weekday: integer("weekday").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({
    uniqueSlot: uniqueIndex("idx_course_schedules_owner_course_weekday").on(
      t.ownerEmail,
      t.courseId,
      t.weekday,
    ),
    byCourse: index("idx_course_schedules_owner_course").on(
      t.ownerEmail,
      t.courseId,
    ),
  }),
);

/**
 * El alumno vive una sola vez por docente, identificado por su legajo.
 * Cada alumno pertenece a una sola comisión activa.
 */
export const students = table(
  "students",
  {
    id: text("id").primaryKey(),
    legajo: text("legajo").notNull(),
    apellido: text("apellido").notNull(),
    nombre: text("nombre").notNull(),
    telefono: text("telefono"),
    github: text("github"),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({
    uniqueLegajo: uniqueIndex("idx_students_owner_legajo").on(
      t.ownerEmail,
      t.legajo,
    ),
    byName: index("idx_students_owner_apellido").on(t.ownerEmail, t.apellido),
  }),
);

/** Comisión única a la que pertenece cada alumno. */
export const enrollments = table(
  "enrollments",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id").notNull(),
    studentId: text("student_id").notNull(),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({
    uniquePair: uniqueIndex("idx_enrollments_owner_course_student").on(
      t.ownerEmail,
      t.courseId,
      t.studentId,
    ),
    uniqueStudent: uniqueIndex("idx_enrollments_owner_student").on(
      t.ownerEmail,
      t.studentId,
    ),
    byCourse: index("idx_enrollments_owner_course").on(
      t.ownerEmail,
      t.courseId,
    ),
  }),
);

/** Un trabajo práctico común a todas las comisiones de una materia. */
export const assessments = table(
  "assessments",
  {
    id: text("id").primaryKey(),
    subjectId: text("subject_id"),
    /** Campo heredado, se mantiene durante la migración por compatibilidad. */
    courseId: text("course_id").notNull(),
    /** Campo heredado. Los nuevos registros usan siempre "practico". */
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    /** Fecha de solicitud, ISO date (YYYY-MM-DD). */
    date: text("date"),
    /** Si lleva nota numérica opcional entre 1 y 10. */
    graded: integer("graded", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({
    byCourseKind: index("idx_assessments_owner_course_kind_sort").on(
      t.ownerEmail,
      t.courseId,
      t.kind,
      t.sortOrder,
    ),
  }),
);

/**
 * Estado y nota opcional de un alumno en un trabajo práctico.
 */
export const assessmentResults = table(
  "assessment_results",
  {
    id: text("id").primaryKey(),
    assessmentId: text("assessment_id").notNull(),
    studentId: text("student_id").notNull(),
    status: text("status").notNull().default("pendiente"),
    /** Campo heredado para compatibilidad con la versión anterior. */
    submitted: integer("submitted", { mode: "boolean" }),
    score: real("score"),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({
    uniquePair: uniqueIndex("idx_results_owner_assessment_student").on(
      t.ownerEmail,
      t.assessmentId,
      t.studentId,
    ),
    byAssessment: index("idx_results_owner_assessment").on(
      t.ownerEmail,
      t.assessmentId,
    ),
  }),
);

/** Una clase dictada, contra la que se toma lista. */
export const classSessions = table(
  "class_sessions",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id").notNull(),
    /** ISO date (YYYY-MM-DD). */
    date: text("date").notNull(),
    startTime: text("start_time"),
    endTime: text("end_time"),
    status: text("status").notNull().default("programada"),
    cancellationReason: text("cancellation_reason"),
    cancellationNote: text("cancellation_note"),
    topic: text("topic"),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({
    byCourseDate: index("idx_class_sessions_owner_course_date").on(
      t.ownerEmail,
      t.courseId,
      t.date,
    ),
    uniqueCourseDate: uniqueIndex(
      "idx_class_sessions_owner_course_date_unique",
    ).on(t.ownerEmail, t.courseId, t.date),
  }),
);

/** Estado de asistencia de un alumno en una clase. */
export const attendance = table(
  "attendance",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    studentId: text("student_id").notNull(),
    status: text("status"),
    /** Campo heredado para compatibilidad con la versión anterior. */
    present: integer("present", { mode: "boolean" }).notNull().default(false),
    ownerEmail: text("owner_email").notNull(),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({
    uniquePair: uniqueIndex("idx_attendance_owner_session_student").on(
      t.ownerEmail,
      t.sessionId,
      t.studentId,
    ),
    bySession: index("idx_attendance_owner_session").on(
      t.ownerEmail,
      t.sessionId,
    ),
  }),
);

export type Course = typeof courses.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type CourseSchedule = typeof courseSchedules.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type AssessmentResult = typeof assessmentResults.$inferSelect;
export type ClassSession = typeof classSessions.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;

export const ASSESSMENT_KINDS = ["practico", "parcial"] as const;
export type AssessmentKind = (typeof ASSESSMENT_KINDS)[number];

export const WORK_STATUSES = [
  "pendiente",
  "presentado",
  "aprobado",
  "desaprobado",
] as const;
export type WorkStatus = (typeof WORK_STATUSES)[number];

export const ATTENDANCE_STATUSES = [
  "presente",
  "ausente",
  "justificada",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const CLASS_STATUSES = [
  "programada",
  "cancelada",
  "a_confirmar",
] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

export const CANCELLATION_REASONS = [
  "feriado",
  "asueto",
  "examen",
  "paro",
  "otro",
] as const;
export type CancellationReason = (typeof CANCELLATION_REASONS)[number];
