import sharp from 'sharp';
import { registerFont, createCanvas } from 'canvas';
import { readFile, writeFile } from 'fs/promises';

async function main() {
  const srcImg = await getImage();
  if (!srcImg) return;

  const metadata = await sharp(srcImg).metadata();

  const size = (metadata.width ?? 0) / 5;
  const angle = (-45 * Math.PI) / 180;
  const fontSize = 20;
  const scale = 0.5;

  const canvas = createCanvas(size, size, 'svg');
  const ctx = canvas.getContext('2d');

  ctx.strokeStyle = '#f00';
  ctx.strokeRect(0, 0, size, size);

  const text = '0123456789';
  ctx.font = `regular ${fontSize}px Oswald`;
  ctx.textAlign = 'center';

  registerFont('./resources/Oswald-Light.ttf', { family: 'Oswald' });
  const textMeasure = ctx.measureText(text);

  const projectedOverhang = Math.abs(Math.cos(Math.PI / 2 - angle) * fontSize);
  const projectedWidth = Math.abs(Math.cos(angle) * textMeasure.width);
  const sizeToFit = projectedOverhang + projectedWidth;

  const glyphSize =
    textMeasure.actualBoundingBoxAscent - textMeasure.actualBoundingBoxDescent;

  ctx.translate(size / 2, size / 2);
  ctx.rotate(angle);
  ctx.scale((size / sizeToFit) * scale, (size / sizeToFit) * scale);

  ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`;
  ctx.strokeText(text, 0, glyphSize / 2);

  ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
  ctx.fillText(text, 0, glyphSize / 2);

  const outImg = await sharp(srcImg)
    .blur(10)
    .composite([
      {
        input: canvas.toBuffer(),
        blend: 'overlay',
        tile: true,
        gravity: 'northwest',
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
