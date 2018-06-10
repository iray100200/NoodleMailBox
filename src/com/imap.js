import { since } from './date'

const last = since()

export const IMAP_DATE = {
  LAST_30_DAYS: last(30),
  LAST_7_DAYS: last(7),
  LAST_3_DAYS: last(3),
  TODAY: last(1)
}

export const IMAP_FLAG = {
  ALL: 'ALL',
  ANSWERED: 'ANSWERED',
  DELETED: 'DELETED',
  DRAFT: 'DRAFT',
  FLAGGED: 'FLAGGED',
  NEW: 'NEW',
  SEEN: 'SEEN',
  RECENT: 'RECENT',
  UNANSWERED: 'UNANSWERED',
  UNDELETED: 'UNDELETED',
  UNDRAFT: 'UNDRAFT',
  UNFLAGGED: 'UNFLAGGED',
  UNSEEN: 'UNSEEN'
}
