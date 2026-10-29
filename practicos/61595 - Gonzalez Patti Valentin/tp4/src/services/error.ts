export class ErrorServicio extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = "ErrorServicio";
  }
}
