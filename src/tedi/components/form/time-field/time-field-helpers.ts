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
 * Parses HH:mm time string
 */
export const parseTime = (time: string) => {
  const [h = '00', m = '00'] = (time ?? '00:00').split(':');

  return {
    hour: h.padStart(2, '0'),
    minute: m.padStart(2, '0'),
  };
};

/**
 * Returns nearest wheel index from scroll position
 */
export const snapToNearestItem = (scrollTop: number, length: number): number => {
  const index = Math.round(scrollTop / ITEM_HEIGHT);

  return Math.max(0, Math.min(index, length - 1));
};

/**
 * Returns scrollTop position for index
 */
export const getScrollTopForIndex = (index: number) => index * ITEM_HEIGHT;

/**
 * Checks if scroll correction is needed
 */
export const needsScrollCorrection = (current: number, target: number, tolerance = 1) =>
  Math.abs(current - target) > tolerance;

/**
 * Scrolls element to index
 */
export const scrollToIndex = (element: HTMLDivElement, index: number, behavior: ScrollBehavior = 'auto') => {
  element.scrollTo({
    top: getScrollTopForIndex(index),
    behavior,
  });
};

/**
 * Clears scroll timeout safely
 */
export const clearScrollTimeout = (timeout?: NodeJS.Timeout) => {
  if (timeout) clearTimeout(timeout);
};
