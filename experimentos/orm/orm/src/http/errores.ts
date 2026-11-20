export class ErrorHttp extends Error {
  constructor(
    public readonly estado: number,
    mensaje: string
  ) {
    super(mensaje);
  }
}
