export class ErrorServicio extends Error {
    constructor(
    public estado: number,
    mensaje: string,
    ) {
    super(mensaje);
    this.name = "ErrorServicio";
    }
}