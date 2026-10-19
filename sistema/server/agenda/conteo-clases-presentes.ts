export interface ConteoClasesPresentes {
  studentId: string;
  clasesPresentes: number | string | bigint;
}

/**
 * Agrega al padrón las asistencias computadas (presente=1, tarde=0,5). Los alumnos sin
 * registros agregados reciben cero para que la respuesta sea total.
 */
export function agregarConteoClasesPresentes<T extends { id: string }>(
  roster: T[],
  counts: ConteoClasesPresentes[],
): Array<T & { clasesPresentes: number }> {
  const byStudentId = new Map(
    counts.map(({ studentId, clasesPresentes }) => [
      studentId,
      Number(clasesPresentes),
    ]),
  );

  return roster.map((student) => ({
    ...student,
    clasesPresentes: byStudentId.get(student.id) ?? 0,
  }));
}
