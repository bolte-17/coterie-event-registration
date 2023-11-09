
export class ValidationError extends Error {
  statusCode = 400;
}
export class ArgumentError extends Error {
  statusCode = 400;
}
