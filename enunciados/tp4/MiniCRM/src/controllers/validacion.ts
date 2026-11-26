import type { Request } from 'express';

export class ErrorHttp extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export function id(req: Request) {
    const valor = req.params.id;
    const numero = Number(valor);
    if (typeof valor !== 'string' || !/^\d+$/.test(valor) ||
        !Number.isSafeInteger(numero) || numero < 1) {
        throw new ErrorHttp(400, 'El ID debe ser un entero positivo.');
    }
    return numero;
}

export function campos(req: Request, requeridos: readonly string[], opcionales: readonly string[], parcial = false) {
    const cuerpo = req.body;
    if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
        throw new ErrorHttp(400, 'Enviá un objeto JSON.');
    }

    const datos: Record<string, string | null> = {};
    for (const campo of [...requeridos, ...opcionales]) {
        const obligatorio = requeridos.includes(campo);
        if (!Object.hasOwn(cuerpo, campo) && (!obligatorio || parcial)) continue;

        const valor = cuerpo[campo];
        if (!obligatorio && valor === null) {
            datos[campo] = null;
        } else if (typeof valor === 'string' && (!obligatorio || valor.trim())) {
            datos[campo] = valor.trim() || null;
        } else {
            throw new ErrorHttp(400, 'Revisá el campo ' + campo + '.');
        }
    }
    if (!Object.keys(datos).length) throw new ErrorHttp(400, 'Enviá al menos un campo válido.');
    return datos;
}
