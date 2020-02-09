export class UnsupportedImageTypeException extends Error {
  constructor(message: string = 'Unsupported image type') {
    super(message);
  }
}
