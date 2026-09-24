/**
 * Automatic Delivery Date Calculation Utility
 * Automatically sets and calculates delivery timelines and arrival dates
 * based on order date, transit buffers, and Indian pincode serviceability zones.
 */

export interface DeliveryEstimate {
  estimatedDate: string; // e.g. "Friday, 26 Sep"
  fullEstimatedDate: string; // e.g. "Friday, 26 September 2026"
  dateRange: string; // e.g. "25 Sep - 28 Sep"
  minDays: number;
  maxDays: number;
  isExpress: boolean;
}

/**
 * Adds business days to a date (skipping Sundays for courier operations)
 */
function addDeliveryDays(startDate: Date, daysToAdd: number): Date {
  const result = new Date(startDate.getTime());
  let added = 0;
  while (added < daysToAdd) {
    result.setDate(result.getDate() + 1);
    // Courier operates 6 days a week, Sunday (0) is typically off for final doorstep delivery
    if (result.getDay() !== 0) {
      added++;
    }
  }
  return result;
}

/**
 * Formats a Date object into human-friendly Indian e-commerce delivery strings
 */
export function formatDeliveryDate(date: Date, includeYear = false): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  };
  return date.toLocaleDateString('en-IN', options);
}

export function formatFullDeliveryDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Automatically computes delivery date by itself for a given pincode or zone.
 * Default standard delivery: 4 to 6 business days.
 * Metro / Express delivery: 2 to 4 business days.
 */
export function calculateDeliveryEstimate(
  isMetro = false,
  baseDate: Date = new Date(),
  customMinDays?: number,
  customMaxDays?: number
): DeliveryEstimate {
  const minDays = customMinDays ?? (isMetro ? 2 : 4);
  const maxDays = customMaxDays ?? (isMetro ? 4 : 6);

  const minDate = addDeliveryDays(baseDate, minDays);
  const maxDate = addDeliveryDays(baseDate, maxDays);

  const minDateStr = minDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const maxDateStr = maxDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return {
    estimatedDate: formatDeliveryDate(maxDate),
    fullEstimatedDate: formatFullDeliveryDate(maxDate),
    dateRange: `${minDateStr} – ${maxDateStr}`,
    minDays,
    maxDays,
    isExpress: isMetro,
  };
}

/**
 * Calculates delivery date from an existing order createdAt ISO string
 */
export function getOrderEstimatedDelivery(orderCreatedAt: string, isMetro = false): string {
  try {
    const createdDate = new Date(orderCreatedAt);
    if (isNaN(createdDate.getTime())) {
      return calculateDeliveryEstimate(isMetro).estimatedDate;
    }
    return calculateDeliveryEstimate(isMetro, createdDate).estimatedDate;
  } catch {
    return calculateDeliveryEstimate(isMetro).estimatedDate;
  }
}
