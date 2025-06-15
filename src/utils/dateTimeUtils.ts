import { DateTime } from 'luxon';

/*
 * Returns a date that is n days in the future
 */
export function dateAdd(n: number): Date;
export function dateAdd(date: Date, n: number): Date;
export function dateAdd(dateOrn: Date | number, n: number = 1): Date {
  let d: Date;
  if (typeof dateOrn === 'number') {
    d = new Date();
    n = dateOrn as number;
  } else {
    d = dateOrn as Date;
  }
  d.setDate(d.getDate() + n);
  return d;
}

/*
 * Returns a date that is n days in the future, but excludes weekends
 */
export function dateAddWorkDays(date: Date, n: number): Date {
  if (n > 0) {
    for (let i = n; i > 0; ) {
      date.setDate(date.getDate() + 1);
      if (![0, 6].includes(date.getUTCDay())) {
        i--;
      }
    }
  } else if (n < 0) {
    for (let i = n; i < 0; ) {
      date.setDate(date.getDate() - 1);
      if (![0, 6].includes(date.getUTCDay())) {
        i++;
      }
    }
  }
  // handle the fractional part of the number, if any
  const frac: number = n - Math.floor(n);
  if (frac !== 0) {
    date.setDate(date.getDate() + frac);
  }

  return date;
}

export function formatDateDDMMYY(date: Date | undefined | null): string | undefined {
  if (date === undefined || date === null) return undefined;

  const day = date.getDate(); // Gets the day of the month
  const month = date.getMonth() + 1; // Gets the month (0-based, hence +1)
  const year = date.getFullYear(); // Gets the year

  return `${month}/${day}/${year}`;
}

export function convertToTimeZone(inputDate: Date, timeZoneIdentifier: string = 'America/Chicago'): Date {
  return DateTime.fromJSDate(inputDate).setZone(timeZoneIdentifier).toJSDate();
}

export function createDateForTimeZone(timeZoneIdentifier: string = 'America/Chicago'): Date {
  return DateTime.fromJSDate(new Date()).setZone(timeZoneIdentifier).toJSDate();
}

export function formatDateToYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  // Convert month and day to string and prepend zero if below 10
  const mmStr = mm < 10 ? '0' + mm : mm.toString();
  const ddStr = dd < 10 ? '0' + dd : dd.toString();

  return `${yyyy}-${mmStr}-${ddStr}`;
}

export function formatDateToYYMMDD(date: Date): string {
  const yy = date.getFullYear().toString().slice(2);
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  // Convert month and day to string and prepend zero if below 10
  const mmStr = mm < 10 ? '0' + mm : mm.toString();
  const ddStr = dd < 10 ? '0' + dd : dd.toString();

  return `${yy}-${mmStr}-${ddStr}`;
}

// const myDate = new Date();
// console.log(formatDateToYYYYMMDD(myDate));  // Outputs something like "2023-10-06"

export function addHoursToTime(inputTime: Date, hoursToAdd: number): Date {
  const newTime = new Date(inputTime);
  newTime.setHours(newTime.getHours() + hoursToAdd);
  return newTime;
}
