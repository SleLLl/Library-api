import sharp, { File } from 'sharp';
import { constants, promises as fsPromise } from 'fs';
import { createHash } from 'crypto';

export function hashFromBuffer(buffer: Buffer, algorithm = 'sha256'): string {
  const hash = createHash(algorithm);
  hash.update(buffer);
  return hash.digest('hex');
}

export default async function uploadAssets(file: File) {
  const buffer = await sharp(file.buffer)
    .resize({ weight: 300, height: 300 })
    .webp()
    .toBuffer();
  const hash = await hashFromBuffer(buffer);
  const newPath = `${__dirname}/../../avatars/${hash}.webp`;

  try {
    await fsPromise.access(newPath, constants.F_OK);
    Error('file already exists');
  } catch (e) {
    // ignore
  }
  await fsPromise.writeFile(newPath, buffer);

  return `${process.env.BACKEND_URL}/static/${hash}.webp`;
}
