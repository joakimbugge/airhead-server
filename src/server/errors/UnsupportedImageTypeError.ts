export class UnsupportedImageTypeError extends Error {
  constructor(message: string = 'Unsupported image type') {
    super(message);
  }
}
