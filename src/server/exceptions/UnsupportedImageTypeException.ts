export class UnsupportedImageTypeException extends Error {
  constructor(message = 'Unsupported image type') {
    super(message);
  }
}
