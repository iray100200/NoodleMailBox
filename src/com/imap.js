import date from './date';

const dt = date();

export const IMAP_DATE = {
  LAST_30_DAYS: dt(30),
  LAST_7_DAYS: dt(7),
  LAST_3_DAYS: dt(3)
}