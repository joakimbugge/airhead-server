import { TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { Metadata } from 'sharp';
import { ProductImageService } from '../../../src/modules/product/services/ProductImageService';
import { TestHelpers } from '../../TestHelpers';
import { TestUtils } from '../../TestUtils';

const TEST_IMAGES_PATH = 'test/assets/images';

function getTestImagePath(fileName: string): string {
  return path.resolve(TEST_IMAGES_PATH, fileName);
}

function getBuffer(fileName: string): Buffer {
  return fs.readFileSync(getTestImagePath(fileName));
}

function deleteImage(filePath: string): void {
  return fs.unlinkSync(filePath);
}

function getMetadata(buffer: Buffer): Promise<Metadata> {
  return sharp(buffer).metadata();
}

let app: TestingModule;
let service: ProductImageService;

beforeEach(async () => {
  app = await TestUtils.createModule();
  service = app.get(ProductImageService);
});

afterEach(() => TestUtils.shutdown(app));

describe('createFileName()', () => {
  test('Creates a filename consisting of only letters and numbers', async () => {
    const fileName = await service.createFileName(getBuffer('image-png.png'));

    expect(fileName).toMatch(/[0-9A-z]\..+/);
  });

  test('Creates a unique filename (n = 1000)', async () => {
    const buffer = getBuffer('image-png.png');
    const fileNames = [];

    for (let i = 0; i < 1000; i++) {
      fileNames.push(await service.createFileName(buffer));
    }

    expect(TestHelpers.isArrayUnique(fileNames)).toBeTruthy();
  });
});

describe('createFileName() file extension', () => {
  test('Uses .png extension for PNG image with alpha channel', async () => {
    const fileName = await service.createFileName(getBuffer('image-png-transparent.png'));

    expect(fileName).toMatch(/.+\.png/);
  });

  test('Uses .png extension for GIF image with alpha channel', async () => {
    const fileName = await service.createFileName(getBuffer('image-gif-transparent.gif'));

    expect(fileName).toMatch(/.+\.png/);
  });

  test('Uses .jpg extension for PNG image without alpha channel', async () => {
    const fileName = await service.createFileName(getBuffer('image-png.png'));

    expect(fileName).toMatch(/.+\.jpg/);
  });

  test('Uses .jpg extension for GIF image without alpha channel', async () => {
    const fileName = await service.createFileName(getBuffer('image-gif.gif'));

    expect(fileName).toMatch(/.+\.jpg/);
  });

  test('Uses .jpg extension for JPG image without alpha channel', async () => {
    const fileName = await service.createFileName(getBuffer('image-jpg.jpg'));

    expect(fileName).toMatch(/.+\.jpg/);
  });
});

describe('format()', () => {
  test('Landscape image should be resized to maximum 2000px width by default', async () => {
    const buffer = getBuffer('image-large.jpg');
    const resizedImage = await service.format(buffer);
    const metadata = await sharp(resizedImage).metadata();

    expect(metadata.width).toBe(2000);
  });

  test('Portrait image should be resized to maximum 2000px height by default', async () => {
    const buffer = getBuffer('image-large-portrait.jpg');
    const resizedImage = await service.format(buffer);
    const metadata = await sharp(resizedImage).metadata();

    expect(metadata.height).toBe(2000);
  });

  test('Image should not exceed maximum width', async () => {
    const landscapeBuffer = getBuffer('image-large.jpg');
    const portaitBuffer = getBuffer('image-large.jpg');

    const resizedLandscapeImage = await service.format(landscapeBuffer, { maxWidth: 400 });
    const landscapeMetadata = await getMetadata(resizedLandscapeImage);

    expect(landscapeMetadata.width).toBeLessThanOrEqual(400);

    const resizedPortaitImage = await service.format(portaitBuffer, { maxWidth: 775 });
    const portaitMetadata = await getMetadata(resizedPortaitImage);

    expect(portaitMetadata.width).toBeLessThanOrEqual(775);
  });

  test('Image should not exceed maximum height', async () => {
    const landscapeBuffer = getBuffer('image-large.jpg');
    const portaitBuffer = getBuffer('image-large.jpg');

    const resizedLandscapeImage = await service.format(landscapeBuffer, { maxHeight: 320 });
    const landscapeMetadata = await getMetadata(resizedLandscapeImage);

    expect(landscapeMetadata.height).toBeLessThanOrEqual(320);

    const resizedPortaitImage = await service.format(portaitBuffer, { maxHeight: 120 });
    const portaitMetadata = await getMetadata(resizedPortaitImage);

    expect(portaitMetadata.height).toBeLessThanOrEqual(120);
  });

  test('Image should not exceed maximum width and height', async () => {
    const landscapeBuffer = getBuffer('image-large.jpg');
    const portaitBuffer = getBuffer('image-large.jpg');

    const resizedLandscapeImage = await service.format(landscapeBuffer, { maxWidth: 400, maxHeight: 400 });
    const landscapeMetadata = await getMetadata(resizedLandscapeImage);

    expect(landscapeMetadata.width).toBeLessThanOrEqual(400);
    expect(landscapeMetadata.height).toBeLessThanOrEqual(400);

    const resizedPortaitImage = await service.format(portaitBuffer, { maxWidth: 775, maxHeight: 900 });
    const portaitMetadata = await getMetadata(resizedPortaitImage);

    expect(portaitMetadata.width).toBeLessThanOrEqual(775);
    expect(portaitMetadata.height).toBeLessThanOrEqual(900);
  });
});

describe('saveFile()', () => {
  test('Saves file to disk at given path', async () => {
    const buffer = getBuffer('image-png.png');
    const tmpPath = path.resolve(TEST_IMAGES_PATH, 'tmp');
    const filePath = await service.save(buffer, tmpPath);

    expect(() => getBuffer(`tmp/${filePath}`)).not.toThrow(Error);

    deleteImage(path.join(tmpPath, filePath));
  });
});
