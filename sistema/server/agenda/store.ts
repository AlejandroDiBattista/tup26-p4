import { randomUUID } from "node:crypto";

import { and, eq, inArray, sql } from "@agent-native/core/db/schema";

import { getDb } from "../db/index.js";
import {
  ASSESSMENT_KINDS,
  ATTENDANCE_STATUSES,
  CANCELLATION_REASONS,
  CLASS_STATUSES,
  WORK_STATUSES,
  assessmentResults,
  assessments,
  attendance,
  classSessions,
  courseSchedules,
  courses,
  enrollments,
  students,
  subjects,
  type Assessment,
  type AssessmentKind,
  type AttendanceStatus,
  type CancellationReason,
  type ClassSession,
  type ClassStatus,
  type Course,
  type Student,
  type Subject,
  type WorkStatus,
} from "../db/schema.js";
import { AuthError, NotFoundError, UserInputError } from "../errors.js";
import { agregarConteoClasesPresentes } from "./conteo-clases-presentes.js";

export type {
  Assessment,
  AssessmentKind,
  AttendanceStatus,
  CancellationReason,
  ClassSession,
  ClassStatus,
  Course,
  Student,
  Subject,
  WorkStatus,
};

export function requireUserEmail(email: string | undefined): string {
  if (!email) throw new AuthError("Hace falta estar autenticado.");
  return email;
}

function stamp() {
  return new Date().toISOString();
}

function clean(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Normaliza el usuario de GitHub: acepta "@juan" o la URL completa. */
export function normalizeGithub(value: string | undefined | null) {
  const raw = clean(value);
  if (!raw) return undefined;
  const fromUrl = raw.match(/github\.com\/([^/?#]+)/i);
  return (fromUrl ? fromUrl[1] : raw).replace(/^@/, "");
}

/** Valida y normaliza una fecha ISO corta (YYYY-MM-DD). */
export function normalizeDate(value: string | undefined | null) {
  const raw = clean(value);
  if (!raw) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new UserInputError(`Fecha inválida: "${raw}". Usar YYYY-MM-DD.`);
  }
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== raw
  ) {
    throw new UserInputError(`Fecha inválida: "${raw}".`);
  }
  return raw;
}

/** Compatibilidad con acciones antiguas. Los trabajos ahora son un único tipo. */
export function assertKind(kind: string): AssessmentKind {
  if (!ASSESSMENT_KINDS.includes(kind as AssessmentKind)) {
    throw new UserInputError(
      `Tipo inválido: "${kind}". Usar "practico" o "parcial".`,
    );
  }
  return kind as AssessmentKind;
}

function assertWorkStatus(status: string): WorkStatus {
  if (!WORK_STATUSES.includes(status as WorkStatus)) {
    throw new UserInputError(`Estado de práctico inválido: "${status}".`);
  }
  return status as WorkStatus;
}

function assertAttendanceStatus(status: string): AttendanceStatus {
  if (!ATTENDANCE_STATUSES.includes(status as AttendanceStatus)) {
    throw new UserInputError(`Estado de asistencia inválido: "${status}".`);
  }
  return status as AttendanceStatus;
}

function assertClassStatus(status: string): ClassStatus {
  if (!CLASS_STATUSES.includes(status as ClassStatus)) {
    throw new UserInputError(`Estado de clase inválido: "${status}".`);
  }
  return status as ClassStatus;
}

function assertCancellationReason(reason: string): CancellationReason {
  if (!CANCELLATION_REASONS.includes(reason as CancellationReason)) {
    throw new UserInputError(`Motivo de cancelación inválido: "${reason}".`);
  }
  return reason as CancellationReason;
}

function weekdayOf(date: string) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

// ── Materia y comisiones ───────────────────────────────────────────────────

export async function listSubjects(ownerEmail: string) {
  const db = getDb();
  return db
    .select()
    .from(subjects)
    .where(eq(subjects.ownerEmail, ownerEmail))
    .orderBy(subjects.academicYear, subjects.name);
}

export async function getDefaultSubject(ownerEmail: string) {
  const [existing] = await listSubjects(ownerEmail);
  if (existing) return existing;

  const row = {
    id: randomUUID(),
    name: "Programación IV",
    academicYear: 2026,
    term: "2.º cuatrimestre",
    ownerEmail,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  await getDb().insert(subjects).values(row);
  return row as Subject;
}

export async function listCourseSchedules(
  ownerEmail: string,
  courseId?: string,
) {
  const db = getDb();
  const where = courseId
    ? and(
        eq(courseSchedules.ownerEmail, ownerEmail),
        eq(courseSchedules.courseId, courseId),
      )
    : eq(courseSchedules.ownerEmail, ownerEmail);
  return db
    .select()
    .from(courseSchedules)
    .where(where)
    .orderBy(courseSchedules.courseId, courseSchedules.weekday);
}

export async function listCourses(ownerEmail: string) {
  const db = getDb();
  const [courseRows, schedules, enrollmentRows] = await Promise.all([
    db
      .select()
      .from(courses)
      .where(eq(courses.ownerEmail, ownerEmail))
      .orderBy(courses.commission, courses.name),
    listCourseSchedules(ownerEmail),
    db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(eq(enrollments.ownerEmail, ownerEmail)),
  ]);

  const countByCourse = new Map<string, number>();
  for (const row of enrollmentRows) {
    countByCourse.set(row.courseId, (countByCourse.get(row.courseId) ?? 0) + 1);
  }

  return courseRows.map((course) => ({
    ...course,
    schedules: schedules.filter((slot) => slot.courseId === course.id),
    studentCount: countByCourse.get(course.id) ?? 0,
  }));
}

export async function getCourse(ownerEmail: string, courseId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.ownerEmail, ownerEmail), eq(courses.id, courseId)));
  if (!row) throw new NotFoundError(`No existe el curso ${courseId}.`);
  return row;
}

/** Resuelve una comisión por id, nombre exacto o código C1/C3. */
export async function resolveCourse(ownerEmail: string, idOrName: string) {
  const db = getDb();
  const key = idOrName.trim();
  const [byId] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.ownerEmail, ownerEmail), eq(courses.id, key)));
  if (byId) return byId;
  const [byName] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.ownerEmail, ownerEmail), eq(courses.name, key)));
  if (byName) return byName;
  const [byCommission] = await db
    .select()
    .from(courses)
    .where(
      and(
        eq(courses.ownerEmail, ownerEmail),
        eq(courses.commission, key.toUpperCase()),
      ),
    );
  if (!byCommission)
    throw new NotFoundError(`No existe el curso "${idOrName}".`);
  return byCommission;
}

type ScheduleInput = { weekday: number; startTime: string; endTime: string };

function validateSchedule(slots: ScheduleInput[]) {
  const seen = new Set<number>();
  for (const slot of slots) {
    if (
      !Number.isInteger(slot.weekday) ||
      slot.weekday < 1 ||
      slot.weekday > 7
    ) {
      throw new UserInputError("El día del horario debe estar entre 1 y 7.");
    }
    if (
      !/^\d{2}:\d{2}$/.test(slot.startTime) ||
      !/^\d{2}:\d{2}$/.test(slot.endTime)
    ) {
      throw new UserInputError("Los horarios deben usar el formato HH:MM.");
    }
    if (slot.startTime >= slot.endTime) {
      throw new UserInputError(
        "La hora de inicio debe ser anterior a la de fin.",
      );
    }
    if (seen.has(slot.weekday)) {
      throw new UserInputError(
        "Sólo puede haber un horario por día y comisión.",
      );
    }
    seen.add(slot.weekday);
  }
}

async function replaceCourseSchedule(
  ownerEmail: string,
  courseId: string,
  schedule: ScheduleInput[],
) {
  validateSchedule(schedule);
  const db = getDb();
  await db
    .delete(courseSchedules)
    .where(
      and(
        eq(courseSchedules.ownerEmail, ownerEmail),
        eq(courseSchedules.courseId, courseId),
      ),
    );
  if (schedule.length > 0) {
    await db.insert(courseSchedules).values(
      schedule.map((slot) => ({
        id: randomUUID(),
        courseId,
        ...slot,
        ownerEmail,
        createdAt: stamp(),
        updatedAt: stamp(),
      })),
    );
  }
}

export async function createCourse(
  ownerEmail: string,
  input: {
    name: string;
    term?: string;
    commission?: string;
    classroom?: string;
    schedule?: ScheduleInput[];
  },
) {
  const name = clean(input.name);
  const commission = clean(input.commission)?.toUpperCase();
  if (!name) throw new UserInputError("El curso necesita un nombre.");
  if (!commission) throw new UserInputError("El curso necesita una comisión.");
  const subject = await getDefaultSubject(ownerEmail);
  const db = getDb();
  const row = {
    id: randomUUID(),
    subjectId: subject.id,
    name,
    commission,
    classroom: clean(input.classroom) ?? null,
    term: clean(input.term) ?? subject.term,
    ownerEmail,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  await db.insert(courses).values(row);
  if (input.schedule)
    await replaceCourseSchedule(ownerEmail, row.id, input.schedule);
  return row;
}

export async function updateCourse(
  ownerEmail: string,
  courseId: string,
  input: {
    name?: string;
    term?: string;
    commission?: string;
    classroom?: string;
    schedule?: ScheduleInput[];
  },
) {
  await getCourse(ownerEmail, courseId);
  const patch: Record<string, unknown> = { updatedAt: stamp() };
  if (input.name !== undefined) {
    const name = clean(input.name);
    if (!name) throw new UserInputError("El curso necesita un nombre.");
    patch.name = name;
  }
  if (input.term !== undefined) patch.term = clean(input.term) ?? null;
  if (input.commission !== undefined) {
    const commission = clean(input.commission)?.toUpperCase();
    if (!commission)
      throw new UserInputError("La comisión no puede quedar vacía.");
    patch.commission = commission;
  }
  if (input.classroom !== undefined)
    patch.classroom = clean(input.classroom) ?? null;
  const db = getDb();
  await db
    .update(courses)
    .set(patch)
    .where(and(eq(courses.ownerEmail, ownerEmail), eq(courses.id, courseId)));
  if (input.schedule !== undefined) {
    await replaceCourseSchedule(ownerEmail, courseId, input.schedule);
  }
  const course = await getCourse(ownerEmail, courseId);
  return {
    ...course,
    schedules: await listCourseSchedules(ownerEmail, courseId),
  };
}

/** Sólo permite borrar una comisión vacía; los prácticos comunes se conservan. */
export async function deleteCourse(ownerEmail: string, courseId: string) {
  await getCourse(ownerEmail, courseId);
  const db = getDb();
  const enrolled = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.ownerEmail, ownerEmail),
        eq(enrollments.courseId, courseId),
      ),
    );
  if (enrolled.length > 0) {
    throw new UserInputError(
      "No se puede borrar una comisión que todavía tiene alumnos.",
    );
  }

  const sessions = await db
    .select({ id: classSessions.id })
    .from(classSessions)
    .where(
      and(
        eq(classSessions.ownerEmail, ownerEmail),
        eq(classSessions.courseId, courseId),
      ),
    );
  const sessionIds = sessions.map((session) => session.id);
  if (sessionIds.length > 0) {
    await db
      .delete(attendance)
      .where(
        and(
          eq(attendance.ownerEmail, ownerEmail),
          inArray(attendance.sessionId, sessionIds),
        ),
      );
    await db
      .delete(classSessions)
      .where(
        and(
          eq(classSessions.ownerEmail, ownerEmail),
          inArray(classSessions.id, sessionIds),
        ),
      );
  }
  await db
    .delete(courseSchedules)
    .where(
      and(
        eq(courseSchedules.ownerEmail, ownerEmail),
        eq(courseSchedules.courseId, courseId),
      ),
    );
  await db
    .delete(courses)
    .where(and(eq(courses.ownerEmail, ownerEmail), eq(courses.id, courseId)));
  return { deleted: courseId };
}

// ── Alumnos ─────────────────────────────────────────────────────────────────

export async function findStudentByLegajo(ownerEmail: string, legajo: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(students)
    .where(
      and(eq(students.ownerEmail, ownerEmail), eq(students.legajo, legajo)),
    );
  return row ?? null;
}

export async function requireStudent(ownerEmail: string, legajo: string) {
  const row = await findStudentByLegajo(ownerEmail, legajo);
  if (!row)
    throw new NotFoundError(`No existe el alumno con legajo ${legajo}.`);
  return row;
}

/**
 * Padrón principal. Cada alumno incluye su única comisión activa y la
 * cantidad de registros de asistencia con estado presente.
 */
export async function listStudents(ownerEmail: string, courseId?: string) {
  const db = getDb();
  const where = courseId
    ? and(
        eq(students.ownerEmail, ownerEmail),
        eq(enrollments.courseId, courseId),
      )
    : eq(students.ownerEmail, ownerEmail);
  const [rows, presentCounts] = await Promise.all([
    db
      .select({ student: students, course: courses })
      .from(students)
      .innerJoin(
        enrollments,
        and(
          eq(enrollments.studentId, students.id),
          eq(enrollments.ownerEmail, ownerEmail),
        ),
      )
      .innerJoin(
        courses,
        and(
          eq(courses.id, enrollments.courseId),
          eq(courses.ownerEmail, ownerEmail),
        ),
      )
      .where(where)
      .orderBy(students.apellido, students.nombre),
    db
      .select({
        studentId: attendance.studentId,
        clasesPresentes: sql<number>`count(*)`,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.ownerEmail, ownerEmail),
          eq(attendance.status, "presente"),
        ),
      )
      .groupBy(attendance.studentId),
  ]);

  const roster = rows.map(({ student, course }) => ({ ...student, course }));
  return agregarConteoClasesPresentes(roster, presentCounts);
}

export async function upsertStudent(
  ownerEmail: string,
  input: {
    legajo: string;
    apellido?: string;
    nombre?: string;
    telefono?: string;
    github?: string;
    courseId?: string;
  },
) {
  const legajo = clean(input.legajo);
  if (!legajo) throw new UserInputError("El alumno necesita un legajo.");
  const db = getDb();
  const existing = await findStudentByLegajo(ownerEmail, legajo);

  let student: Student;
  if (existing) {
    const patch: Record<string, unknown> = { updatedAt: stamp() };
    if (input.apellido !== undefined) {
      const apellido = clean(input.apellido);
      if (!apellido) throw new UserInputError("El apellido no puede ir vacío.");
      patch.apellido = apellido;
    }
    if (input.nombre !== undefined) {
      const nombre = clean(input.nombre);
      if (!nombre) throw new UserInputError("El nombre no puede ir vacío.");
      patch.nombre = nombre;
    }
    if (input.telefono !== undefined)
      patch.telefono = clean(input.telefono) ?? null;
    if (input.github !== undefined)
      patch.github = normalizeGithub(input.github) ?? null;
    await db
      .update(students)
      .set(patch)
      .where(
        and(eq(students.ownerEmail, ownerEmail), eq(students.id, existing.id)),
      );
    student = { ...existing, ...patch } as Student;
  } else {
    const apellido = clean(input.apellido);
    const nombre = clean(input.nombre);
    if (!apellido || !nombre || !input.courseId) {
      throw new UserInputError(
        "Para dar de alta un alumno hacen falta apellido, nombre y comisión.",
      );
    }
    const row = {
      id: randomUUID(),
      legajo,
      apellido,
      nombre,
      telefono: clean(input.telefono) ?? null,
      github: normalizeGithub(input.github) ?? null,
      ownerEmail,
      createdAt: stamp(),
      updatedAt: stamp(),
    };
    await db.insert(students).values(row);
    student = row as Student;
  }

  if (input.courseId)
    await enrollStudent(ownerEmail, input.courseId, student.id);
  return student;
}

/** Mueve al alumno a la comisión indicada si ya estaba inscripto en otra. */
export async function enrollStudent(
  ownerEmail: string,
  courseId: string,
  studentId: string,
) {
  await getCourse(ownerEmail, courseId);
  const db = getDb();
  const [current] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.ownerEmail, ownerEmail),
        eq(enrollments.studentId, studentId),
      ),
    );
  if (current?.courseId === courseId) return { enrolled: false, moved: false };
  if (current) {
    await db
      .delete(enrollments)
      .where(
        and(
          eq(enrollments.ownerEmail, ownerEmail),
          eq(enrollments.studentId, studentId),
        ),
      );
  }
  await db.insert(enrollments).values({
    id: randomUUID(),
    courseId,
    studentId,
    ownerEmail,
    createdAt: stamp(),
  });
  return { enrolled: true, moved: Boolean(current) };
}

export async function unenrollStudent(
  ownerEmail: string,
  courseId: string,
  legajo: string,
) {
  const student = await requireStudent(ownerEmail, legajo);
  await getDb()
    .delete(enrollments)
    .where(
      and(
        eq(enrollments.ownerEmail, ownerEmail),
        eq(enrollments.courseId, courseId),
        eq(enrollments.studentId, student.id),
      ),
    );
  return { unenrolled: legajo, courseId };
}

export async function deleteStudent(ownerEmail: string, legajo: string) {
  const student = await requireStudent(ownerEmail, legajo);
  const db = getDb();
  await db
    .delete(assessmentResults)
    .where(
      and(
        eq(assessmentResults.ownerEmail, ownerEmail),
        eq(assessmentResults.studentId, student.id),
      ),
    );
  await db
    .delete(attendance)
    .where(
      and(
        eq(attendance.ownerEmail, ownerEmail),
        eq(attendance.studentId, student.id),
      ),
    );
  await db
    .delete(enrollments)
    .where(
      and(
        eq(enrollments.ownerEmail, ownerEmail),
        eq(enrollments.studentId, student.id),
      ),
    );
  await db
    .delete(students)
    .where(
      and(eq(students.ownerEmail, ownerEmail), eq(students.id, student.id)),
    );
  return { deleted: legajo };
}

// ── Trabajos prácticos compartidos ──────────────────────────────────────────

async function subjectIdForCourse(ownerEmail: string, courseId?: string) {
  if (courseId) {
    const course = await getCourse(ownerEmail, courseId);
    if (course.subjectId) return course.subjectId;
  }
  return (await getDefaultSubject(ownerEmail)).id;
}

export async function listAssessments(
  ownerEmail: string,
  courseId?: string,
  _kind?: AssessmentKind,
) {
  const subjectId = await subjectIdForCourse(ownerEmail, courseId);
  return getDb()
    .select()
    .from(assessments)
    .where(
      and(
        eq(assessments.ownerEmail, ownerEmail),
        eq(assessments.subjectId, subjectId),
      ),
    )
    .orderBy(assessments.sortOrder, assessments.date, assessments.title);
}

export async function getAssessment(ownerEmail: string, assessmentId: string) {
  const [row] = await getDb()
    .select()
    .from(assessments)
    .where(
      and(
        eq(assessments.ownerEmail, ownerEmail),
        eq(assessments.id, assessmentId),
      ),
    );
  if (!row) throw new NotFoundError(`No existe el trabajo ${assessmentId}.`);
  return row;
}

export async function createAssessment(
  ownerEmail: string,
  input: {
    courseId?: string;
    title: string;
    date?: string;
    graded?: boolean;
    kind?: string;
  },
) {
  const title = clean(input.title);
  if (!title) throw new UserInputError("El trabajo necesita un título.");
  const subjectId = await subjectIdForCourse(ownerEmail, input.courseId);
  const allCourses = await listCourses(ownerEmail);
  const representative = input.courseId
    ? await getCourse(ownerEmail, input.courseId)
    : allCourses.find((course) => course.subjectId === subjectId);
  if (!representative)
    throw new UserInputError("Hace falta al menos una comisión.");
  const siblings = await listAssessments(ownerEmail, representative.id);
  const row = {
    id: randomUUID(),
    subjectId,
    courseId: representative.id,
    kind: "practico",
    title,
    date: normalizeDate(input.date) ?? null,
    graded: input.graded ?? input.kind === "parcial",
    sortOrder: siblings.length,
    ownerEmail,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  await getDb().insert(assessments).values(row);
  return row;
}

export async function updateAssessment(
  ownerEmail: string,
  assessmentId: string,
  input: { title?: string; date?: string | null; graded?: boolean },
) {
  await getAssessment(ownerEmail, assessmentId);
  const patch: Record<string, unknown> = { updatedAt: stamp() };
  if (input.title !== undefined) {
    const title = clean(input.title);
    if (!title) throw new UserInputError("El trabajo necesita un título.");
    patch.title = title;
  }
  if (input.date !== undefined) patch.date = normalizeDate(input.date) ?? null;
  if (input.graded !== undefined) {
    patch.graded = input.graded;
    if (!input.graded) {
      await getDb()
        .update(assessmentResults)
        .set({ score: null, updatedAt: stamp() })
        .where(
          and(
            eq(assessmentResults.ownerEmail, ownerEmail),
            eq(assessmentResults.assessmentId, assessmentId),
          ),
        );
    }
  }
  await getDb()
    .update(assessments)
    .set(patch)
    .where(
      and(
        eq(assessments.ownerEmail, ownerEmail),
        eq(assessments.id, assessmentId),
      ),
    );
  return getAssessment(ownerEmail, assessmentId);
}

export async function deleteAssessment(
  ownerEmail: string,
  assessmentId: string,
) {
  await getAssessment(ownerEmail, assessmentId);
  const db = getDb();
  await db
    .delete(assessmentResults)
    .where(
      and(
        eq(assessmentResults.ownerEmail, ownerEmail),
        eq(assessmentResults.assessmentId, assessmentId),
      ),
    );
  await db
    .delete(assessments)
    .where(
      and(
        eq(assessments.ownerEmail, ownerEmail),
        eq(assessments.id, assessmentId),
      ),
    );
  return { deleted: assessmentId };
}

export async function setAssessmentResult(
  ownerEmail: string,
  input: {
    assessmentId: string;
    legajo: string;
    status?: string;
    score?: number | null;
    submitted?: boolean;
  },
) {
  const assessment = await getAssessment(ownerEmail, input.assessmentId);
  const student = await requireStudent(ownerEmail, input.legajo);
  const explicitStatus = input.status
    ? assertWorkStatus(input.status)
    : input.submitted !== undefined
      ? input.submitted
        ? "presentado"
        : "pendiente"
      : undefined;
  if (explicitStatus === undefined && input.score === undefined) {
    throw new UserInputError(
      "Hay que indicar el estado o la nota del trabajo.",
    );
  }
  if (
    input.score !== undefined &&
    input.score !== null &&
    (!assessment.graded ||
      Number.isNaN(input.score) ||
      input.score < 1 ||
      input.score > 10)
  ) {
    throw new UserInputError(
      assessment.graded
        ? "La nota debe estar entre 1 y 10."
        : "Este trabajo no lleva nota.",
    );
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(assessmentResults)
    .where(
      and(
        eq(assessmentResults.ownerEmail, ownerEmail),
        eq(assessmentResults.assessmentId, input.assessmentId),
        eq(assessmentResults.studentId, student.id),
      ),
    );

  const status =
    explicitStatus ??
    (existing?.status as WorkStatus | undefined) ??
    "pendiente";
  const score =
    status === "pendiente"
      ? null
      : input.score !== undefined
        ? input.score
        : (existing?.score ?? null);
  const values = {
    status,
    submitted: status !== "pendiente",
    score,
    updatedAt: stamp(),
  };

  if (existing) {
    await db
      .update(assessmentResults)
      .set(values)
      .where(
        and(
          eq(assessmentResults.ownerEmail, ownerEmail),
          eq(assessmentResults.id, existing.id),
        ),
      );
    return { ...existing, ...values };
  }
  const row = {
    id: randomUUID(),
    assessmentId: input.assessmentId,
    studentId: student.id,
    ...values,
    ownerEmail,
    createdAt: stamp(),
  };
  await db.insert(assessmentResults).values(row);
  return row;
}

/** Grilla global o filtrada por comisión: alumnos × trabajos comunes. */
export async function assessmentGrid(
  ownerEmail: string,
  courseId?: string,
  _kind?: AssessmentKind,
) {
  const [roster, columns] = await Promise.all([
    listStudents(ownerEmail, courseId),
    listAssessments(ownerEmail, courseId),
  ]);
  const ids = columns.map((column) => column.id);
  const results =
    ids.length === 0
      ? []
      : await getDb()
          .select()
          .from(assessmentResults)
          .where(
            and(
              eq(assessmentResults.ownerEmail, ownerEmail),
              inArray(assessmentResults.assessmentId, ids),
            ),
          );
  const byKey = new Map(
    results.map((result) => [
      `${result.assessmentId}:${result.studentId}`,
      result,
    ]),
  );
  return {
    assessments: columns,
    rows: roster.map((student) => ({
      id: student.id,
      legajo: student.legajo,
      apellido: student.apellido,
      nombre: student.nombre,
      course: student.course,
      cells: columns.map((column) => {
        const result = byKey.get(`${column.id}:${student.id}`);
        return {
          assessmentId: column.id,
          status: (result?.status ?? "pendiente") as WorkStatus,
          submitted: result?.submitted ?? false,
          score: result?.score ?? null,
        };
      }),
    })),
  };
}

// ── Calendario y asistencia ─────────────────────────────────────────────────

export async function listClassSessions(ownerEmail: string, courseId: string) {
  await getCourse(ownerEmail, courseId);
  return getDb()
    .select()
    .from(classSessions)
    .where(
      and(
        eq(classSessions.ownerEmail, ownerEmail),
        eq(classSessions.courseId, courseId),
      ),
    )
    .orderBy(classSessions.date);
}

export async function getClassSession(ownerEmail: string, sessionId: string) {
  const [row] = await getDb()
    .select()
    .from(classSessions)
    .where(
      and(
        eq(classSessions.ownerEmail, ownerEmail),
        eq(classSessions.id, sessionId),
      ),
    );
  if (!row) throw new NotFoundError(`No existe la clase ${sessionId}.`);
  return row;
}

export async function createClassSession(
  ownerEmail: string,
  input: { courseId: string; date: string; topic?: string },
) {
  await getCourse(ownerEmail, input.courseId);
  const date = normalizeDate(input.date);
  if (!date) throw new UserInputError("La clase necesita una fecha.");
  const [existing] = (
    await listClassSessions(ownerEmail, input.courseId)
  ).filter((session) => session.date === date);
  if (existing) return existing;
  const [slot] = (await listCourseSchedules(ownerEmail, input.courseId)).filter(
    (schedule) => schedule.weekday === weekdayOf(date),
  );
  if (!slot)
    throw new UserInputError("La fecha no coincide con un día de cursado.");
  const row = {
    id: randomUUID(),
    courseId: input.courseId,
    date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: "programada",
    cancellationReason: null,
    cancellationNote: null,
    topic: clean(input.topic) ?? null,
    ownerEmail,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  await getDb().insert(classSessions).values(row);
  return row;
}

export async function generateClassSessions(
  ownerEmail: string,
  input: { courseId: string; startDate: string; endDate: string },
) {
  const startDate = normalizeDate(input.startDate);
  const endDate = normalizeDate(input.endDate);
  if (!startDate || !endDate || startDate > endDate) {
    throw new UserInputError("El rango de fechas no es válido.");
  }
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (days > 370)
    throw new UserInputError("El rango no puede superar 370 días.");
  const schedules = await listCourseSchedules(ownerEmail, input.courseId);
  const scheduleByDay = new Map(schedules.map((slot) => [slot.weekday, slot]));
  const existing = await listClassSessions(ownerEmail, input.courseId);
  const existingDates = new Set(existing.map((session) => session.date));
  const created: ClassSession[] = [];
  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const date = cursor.toISOString().slice(0, 10);
    const weekday = cursor.getUTCDay() === 0 ? 7 : cursor.getUTCDay();
    const slot = scheduleByDay.get(weekday);
    if (!slot || existingDates.has(date)) continue;
    created.push(
      (await createClassSession(ownerEmail, {
        courseId: input.courseId,
        date,
      })) as ClassSession,
    );
  }
  return {
    courseId: input.courseId,
    created: created.length,
    sessions: created,
  };
}

export async function updateClassSession(
  ownerEmail: string,
  sessionId: string,
  input: {
    status?: string;
    cancellationReason?: string | null;
    cancellationNote?: string | null;
    topic?: string | null;
  },
) {
  const current = await getClassSession(ownerEmail, sessionId);
  const status = input.status
    ? assertClassStatus(input.status)
    : (current.status as ClassStatus);
  let cancellationReason =
    input.cancellationReason === undefined
      ? current.cancellationReason
      : input.cancellationReason
        ? assertCancellationReason(input.cancellationReason)
        : null;
  let cancellationNote =
    input.cancellationNote === undefined
      ? current.cancellationNote
      : (clean(input.cancellationNote) ?? null);
  if (status === "cancelada" && !cancellationReason) {
    throw new UserInputError("Una clase cancelada necesita un motivo.");
  }
  if (status === "programada") {
    cancellationReason = null;
    cancellationNote = null;
  }
  await getDb()
    .update(classSessions)
    .set({
      status,
      cancellationReason,
      cancellationNote,
      topic:
        input.topic === undefined
          ? current.topic
          : (clean(input.topic) ?? null),
      updatedAt: stamp(),
    })
    .where(
      and(
        eq(classSessions.ownerEmail, ownerEmail),
        eq(classSessions.id, sessionId),
      ),
    );
  return getClassSession(ownerEmail, sessionId);
}

export async function deleteClassSession(
  ownerEmail: string,
  sessionId: string,
) {
  await getClassSession(ownerEmail, sessionId);
  const db = getDb();
  await db
    .delete(attendance)
    .where(
      and(
        eq(attendance.ownerEmail, ownerEmail),
        eq(attendance.sessionId, sessionId),
      ),
    );
  await db
    .delete(classSessions)
    .where(
      and(
        eq(classSessions.ownerEmail, ownerEmail),
        eq(classSessions.id, sessionId),
      ),
    );
  return { deleted: sessionId };
}

export async function setAttendance(
  ownerEmail: string,
  input: {
    sessionId: string;
    entries: Array<{
      legajo: string;
      status?: string | null;
      present?: boolean;
    }>;
  },
) {
  const session = await getClassSession(ownerEmail, input.sessionId);
  if (session.status !== "programada") {
    throw new UserInputError(
      "Sólo se puede tomar asistencia en una clase programada.",
    );
  }
  if (input.entries.length === 0) {
    throw new UserInputError("No viene ningún alumno para marcar.");
  }
  const db = getDb();
  const updated: Array<{ legajo: string; status: AttendanceStatus | null }> =
    [];
  for (const entry of input.entries) {
    const student = await requireStudent(ownerEmail, entry.legajo);
    const [membership] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.ownerEmail, ownerEmail),
          eq(enrollments.studentId, student.id),
          eq(enrollments.courseId, session.courseId),
        ),
      );
    if (!membership) {
      throw new UserInputError(
        `El alumno ${entry.legajo} no pertenece a la comisión de esta clase.`,
      );
    }
    const status =
      entry.status === null
        ? null
        : entry.status
          ? assertAttendanceStatus(entry.status)
          : entry.present !== undefined
            ? entry.present
              ? "presente"
              : "ausente"
            : null;
    const [existing] = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.ownerEmail, ownerEmail),
          eq(attendance.sessionId, input.sessionId),
          eq(attendance.studentId, student.id),
        ),
      );
    if (status === null) {
      if (existing) {
        await db
          .delete(attendance)
          .where(
            and(
              eq(attendance.ownerEmail, ownerEmail),
              eq(attendance.id, existing.id),
            ),
          );
      }
    } else if (existing) {
      await db
        .update(attendance)
        .set({ status, present: status === "presente", updatedAt: stamp() })
        .where(
          and(
            eq(attendance.ownerEmail, ownerEmail),
            eq(attendance.id, existing.id),
          ),
        );
    } else {
      await db.insert(attendance).values({
        id: randomUUID(),
        sessionId: input.sessionId,
        studentId: student.id,
        status,
        present: status === "presente",
        ownerEmail,
        createdAt: stamp(),
        updatedAt: stamp(),
      });
    }
    updated.push({ legajo: entry.legajo, status });
  }
  return { sessionId: input.sessionId, updated };
}

export async function attendanceGrid(ownerEmail: string, courseId: string) {
  const [roster, sessions] = await Promise.all([
    listStudents(ownerEmail, courseId),
    listClassSessions(ownerEmail, courseId),
  ]);
  const sessionIds = sessions.map((session) => session.id);
  const marks =
    sessionIds.length === 0
      ? []
      : await getDb()
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.ownerEmail, ownerEmail),
              inArray(attendance.sessionId, sessionIds),
            ),
          );
  const byKey = new Map(
    marks.map((mark) => [`${mark.sessionId}:${mark.studentId}`, mark]),
  );
  return {
    sessions,
    rows: roster.map((student) => {
      const cells = sessions.map((session) => ({
        sessionId: session.id,
        status: byKey.get(`${session.id}:${student.id}`)?.status ?? null,
      }));
      const presentes = cells.filter(
        (cell) => cell.status === "presente",
      ).length;
      const ausentes = cells.filter((cell) => cell.status === "ausente").length;
      const justificadas = cells.filter(
        (cell) => cell.status === "justificada",
      ).length;
      const computables = presentes + ausentes;
      return {
        id: student.id,
        legajo: student.legajo,
        apellido: student.apellido,
        nombre: student.nombre,
        cells,
        presentes,
        ausentes,
        justificadas,
        porcentaje:
          computables === 0
            ? null
            : Math.round((presentes / computables) * 100),
      };
    }),
  };
}

export async function listStudentCourses(
  ownerEmail: string,
  studentId: string,
) {
  const rows = await getDb()
    .select({ course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(
      and(
        eq(enrollments.ownerEmail, ownerEmail),
        eq(enrollments.studentId, studentId),
      ),
    )
    .orderBy(courses.commission, courses.name);
  return rows.map((row) => row.course);
}

export async function studentSummary(ownerEmail: string, legajo: string) {
  const student = await requireStudent(ownerEmail, legajo);
  const [course] = await listStudentCourses(ownerEmail, student.id);
  if (!course) return { student, course: null, courses: [] };
  const [works, sessions] = await Promise.all([
    listAssessments(ownerEmail, course.id),
    listClassSessions(ownerEmail, course.id),
  ]);
  const workIds = works.map((work) => work.id);
  const sessionIds = sessions.map((session) => session.id);
  const [results, marks] = await Promise.all([
    workIds.length === 0
      ? []
      : getDb()
          .select()
          .from(assessmentResults)
          .where(
            and(
              eq(assessmentResults.ownerEmail, ownerEmail),
              eq(assessmentResults.studentId, student.id),
              inArray(assessmentResults.assessmentId, workIds),
            ),
          ),
    sessionIds.length === 0
      ? []
      : getDb()
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.ownerEmail, ownerEmail),
              eq(attendance.studentId, student.id),
              inArray(attendance.sessionId, sessionIds),
            ),
          ),
  ]);
  const resultByWork = new Map(
    results.map((result) => [result.assessmentId, result]),
  );
  const markBySession = new Map(marks.map((mark) => [mark.sessionId, mark]));
  const practicos = works.map((work) => ({
    id: work.id,
    title: work.title,
    date: work.date,
    graded: work.graded,
    status: (resultByWork.get(work.id)?.status ?? "pendiente") as WorkStatus,
    score: resultByWork.get(work.id)?.score ?? null,
  }));
  const clases = sessions.map((session) => ({
    ...session,
    attendanceStatus: markBySession.get(session.id)?.status ?? null,
  }));
  const scores = practicos
    .map((work) => work.score)
    .filter((score): score is number => typeof score === "number");
  const presentes = clases.filter(
    (session) => session.attendanceStatus === "presente",
  ).length;
  const ausentes = clases.filter(
    (session) => session.attendanceStatus === "ausente",
  ).length;
  const justificadas = clases.filter(
    (session) => session.attendanceStatus === "justificada",
  ).length;
  return {
    student,
    course,
    courses: [course],
    practicos,
    clases,
    totales: {
      practicosPresentados: practicos.filter(
        (work) => work.status !== "pendiente",
      ).length,
      practicosAprobados: practicos.filter((work) => work.status === "aprobado")
        .length,
      practicosTotales: practicos.length,
      promedio:
        scores.length === 0
          ? null
          : Math.round(
              (scores.reduce((sum, score) => sum + score, 0) / scores.length) *
                100,
            ) / 100,
      clasesPresentes: presentes,
      clasesAusentes: ausentes,
      clasesJustificadas: justificadas,
      clasesMarcadas: presentes + ausentes + justificadas,
      asistenciaPorcentaje:
        presentes + ausentes === 0
          ? null
          : Math.round((presentes / (presentes + ausentes)) * 100),
    },
  };
}

export async function courseSummary(ownerEmail: string, courseId: string) {
  const course = await getCourse(ownerEmail, courseId);
  const [works, asistencia] = await Promise.all([
    assessmentGrid(ownerEmail, courseId),
    attendanceGrid(ownerEmail, courseId),
  ]);
  const attendanceByLegajo = new Map(
    asistencia.rows.map((row) => [row.legajo, row]),
  );
  return {
    course,
    totalAlumnos: works.rows.length,
    totalPracticos: works.assessments.length,
    totalClases: asistencia.sessions.length,
    alumnos: works.rows.map((row) => {
      const scores = row.cells
        .map((cell) => cell.score)
        .filter((score): score is number => typeof score === "number");
      const mark = attendanceByLegajo.get(row.legajo);
      return {
        legajo: row.legajo,
        apellido: row.apellido,
        nombre: row.nombre,
        practicosPresentados: row.cells.filter(
          (cell) => cell.status !== "pendiente",
        ).length,
        practicosAprobados: row.cells.filter(
          (cell) => cell.status === "aprobado",
        ).length,
        practicosTotales: works.assessments.length,
        notas: scores,
        promedio:
          scores.length === 0
            ? null
            : Math.round(
                (scores.reduce((sum, score) => sum + score, 0) /
                  scores.length) *
                  100,
              ) / 100,
        clasesPresentes: mark?.presentes ?? 0,
        clasesJustificadas: mark?.justificadas ?? 0,
        asistenciaPorcentaje: mark?.porcentaje ?? null,
      };
    }),
  };
}
