import { createCanvas } from 'canvas';

type Dimensions = { width: number; height: number };
type Coordinates = { x: number; y: number };

interface Params {
  size: Dimensions;
  text: string;

  scale?: number;
  angle?: number;

  fontFamily?: string;
  fillStyle?: string;
  strokeStyle?: string;

  backgroundStyle?: string;
  borderStyle?: string;
  innerBoundsStyle?: string;
  outerBoundsStyle?: string;
}

export function textToCanvas(params: Params) {
  const {
    size,
    text,
    strokeStyle,
    fillStyle,
    fontFamily,
    angle,
    scale,
    backgroundStyle,
    borderStyle,
    innerBoundsStyle,
    outerBoundsStyle,
  } = verifyParams(params);
  const fontSize = 20; // for scale-to-fit irrelevant as we are handling vector-graphics here

  const canvas = createCanvas(size.width, size.height, 'svg');
  const ctx = canvas.getContext('2d');

  // Draw background and border
  if (backgroundStyle) {
    ctx.fillStyle = backgroundStyle;
    ctx.fillRect(0, 0, size.width, size.height);
  }
  if (borderStyle) {
    ctx.strokeStyle = borderStyle;
    ctx.strokeRect(0, 0, size.width, size.height);
  }

  // Calculate bounds
  ctx.font = `${fontSize}px "${fontFamily}"`;
  const metrics = ctx.measureText(text);
  const outer = outerBounds(metrics, fontSize);
  const inner = innerBounds(metrics);

  // Calculate scale to fit canvas
  const newScale = scaleToFit(size, outer, angle, scale);

  // Apply transform
  ctx.translate(size.width / 2, size.height / 2);
  ctx.rotate(angle);
  ctx.scale(newScale, newScale);

  // Draw bounds
  if (outerBoundsStyle) {
    ctx.strokeStyle = outerBoundsStyle;
    ctx.strokeRect(
      -outer.width / 2,
      -outer.height / 2,
      outer.width,
      outer.height
    );
  }
  if (innerBoundsStyle) {
    ctx.strokeStyle = innerBoundsStyle;
    ctx.strokeRect(
      -inner.width / 2,
      -inner.height / 2,
      inner.width,
      inner.height
    );
  }

  // Draw text and stroke
  ctx.strokeStyle = strokeStyle;
  ctx.strokeText(text, inner.width / 2, inner.height / 2);
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, inner.width / 2, inner.height / 2);

  return canvas;
}

function scaleToFit(
  outer: Dimensions,
  inner: Dimensions,
  angle: number,
  scale: number
) {
  const overhang = Math.abs(Math.cos(Math.PI / 2 - angle) * inner.height);
  const base = Math.abs(Math.cos(angle) * inner.width);
  const squareWidth = overhang + base;

  const scaleX = (outer.width / squareWidth) * scale;
  const scaleY = (outer.height / squareWidth) * scale;
  return Math.min(scaleX, scaleY);
}

function outerBounds(m: TextMetrics, fontSize: number): Dimensions {
  return {
    width: m.actualBoundingBoxLeft - m.actualBoundingBoxRight,
    height: fontSize,
  };
}

function innerBounds(m: TextMetrics): Dimensions {
  return {
    width: m.actualBoundingBoxLeft - m.actualBoundingBoxRight,
    height: m.actualBoundingBoxAscent - m.actualBoundingBoxDescent,
  };
}

function verifyParams(p: Params) {
  if (p.size.width < 1 || p.size.height < 1) {
    throw new Error(
      'Invalid dimensions! The image must at least contain one pixel.'
    );
  }

  return {
    ...p,
    fontFamily: p.fontFamily ?? 'sans-serif',
    fillStyle: p.fillStyle ?? '#fff',
    strokeStyle: p.strokeStyle ?? '#000',
    angle: (Math.PI / 180) * (p.angle ?? 0),
    scale: p.scale ?? 1,
  };
}
