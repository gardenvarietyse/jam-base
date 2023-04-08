export const lerp = (a: number, b: number, alpha: number) =>
  (1 - alpha) * a + alpha * b;

export const unit = (x: number) => x / Math.abs(x || 1);

export const length = (x: number, y: number) => Math.sqrt(x * x + y * y);
export const flip = (x: number) => x * -1;

export const clamp = (x: number, min: number, max: number) =>
  Math.max(Math.min(x, max), min);

export const randomSigned = () => Math.random() * 2 - 1;

export const nrandom = () => (Math.random() + Math.random()) / 2;
