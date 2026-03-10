export const ITEM_HEIGHT = 40;

/**
 * Generates an array of hours (00–23)
 */
export const generateHours = (): string[] => {
  return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
};

/**
 * Generates minute values based on a step (e.g. 5, 10, 15)
 */
export const generateMinutes = (stepMinutes: number): string[] => {
  const step = Math.max(1, stepMinutes ?? 1);
  const mins: string[] = [];

  for (let i = 0; i < 60; i += step) {
    mins.push(i.toString().padStart(2, '0'));
  }

  return mins;
};

/**
 * Finds the closest available minute to a target value
 */
export const findClosestMinute = (target: string, mins: string[]): string => {
  if (!mins.length) return '00';

  const t = Number(target);
  if (isNaN(t)) return mins[0];

  return mins.reduce((best, curr) => {
    const diff = Math.abs(Number(curr) - t);
    const bestDiff = Math.abs(Number(best) - t);

    return diff < bestDiff || (diff === bestDiff && Number(curr) > Number(best)) ? curr : best;
  }, mins[0]);
};

/**
 * Parses a HH:mm time string
 */
export const parseTime = (time: string) => {
  const [h = '00', m = '00'] = (time ?? '00:00').split(':');

  return {
    hour: h.padStart(2, '0'),
    minute: m.padStart(2, '0'),
  };
};

/**
 * Returns the wheel index from scroll position
 */
export function getScrollIndex(scrollTop: number) {
  return Math.round(scrollTop / ITEM_HEIGHT);
}
