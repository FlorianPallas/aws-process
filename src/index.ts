import sharp from 'sharp';
import { readFile, writeFile } from 'fs/promises';
import { textToCanvas } from './text-to-canvas';

async function main() {
  const srcImg = await getImage();
  if (!srcImg) return;

  const { width, height } = await sharp(srcImg).metadata();
  if (!width || !height) throw new Error('Invalid image metadata');

  const overlayImg = textToCanvas({
    size: {
      width: width / 5,
      height: height / 5,
    },
    text: 'Example Text',
    angle: -45,
    scale: 0.75,
    fontFamily: 'Oswald',
    fillStyle: 'rgba(255, 255, 255, 1)',
    strokeStyle: 'rgba(0, 0, 0, 0.5)',
    /*
    borderStyle: '#f00',
    outerBoundsStyle: '#0f0',
    innerBoundsStyle: '#00f',
    */
  }).toBuffer();

  const outImg = await sharp(srcImg)
    .blur(10)
    .composite([
      {
        input: overlayImg,
        blend: 'overlay',
        tile: true,
      },
    ])
    .toBuffer();

  await putImage(outImg);
}
main();

async function getImage(): Promise<Buffer | undefined> {
  return readFile('./resources/input.jpg');
}

async function putImage(file: Buffer): Promise<void> {
  return writeFile('./dist/output.jpg', file);
}
