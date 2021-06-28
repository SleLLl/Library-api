import sharp, { File } from 'sharp';
import { constants, promises as fsPromise } from 'fs';

export default async function uploadAssets(file: File) {
  const buffer = await sharp(file.buffer)
    .resize({ weight: 300, height: 300 })
    .webp()
    .toBuffer();
  const newPath = `${__dirname}/../../avatars/${file.originalname}`;

  try {
    await fsPromise.access(newPath, constants.F_OK);
    throw new Error('file already exists');
  } catch (e) {
    // ignore
  }
  await fsPromise.writeFile(newPath, buffer);

  return `${process.env.BACKEND_URL}/static/${file.originalname}`;
}
