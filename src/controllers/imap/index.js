import { Controller } from '../base'
import { ImapAccount } from './service'
import { IMAP_DATE, IMAP_SCOPE } from '../../com/imap'
import { since } from '../../com/date'
import Conf from '../../config/imap.conf'
import params from '../../com/params'

const last = since()

export default class ImapController extends Controller {
  register() {
    this.Router.all('/receive/:scope', (req, res) => {
      this.receive(Object.assign(req.params, params(req)))
        .then(f => {
          res.status(200).send({
            data: f
          })
        })
        .catch(e => {
          res.status(500).send({ error: e })
        })
    })
  }
  receive(params) {
    let { scope, condition, date, username, password, host, rows } = params
    if (!username || !password || !host) {
      return Promise.reject('Username & Password & Host are required.')
    }
    let imapAccount = new ImapAccount(username, password, host)
    if (!condition) return Promise.reject('Invalid parameters. The condition\'s type is invalid.')
    if (!date) return Promise.reject('Invalid parameters. The date\'s type is invalid.')
    if (!scope || Object.keys(IMAP_SCOPE).indexOf((scope = scope.toUpperCase())) < 0) return Promise.reject('Invalid parameters. Flag is incorrect.')
    return imapAccount.retrieveUnreadEmails({
      scope: scope || IMAP_SCOPE.ALL,
      condition,
      date: Date.parse(date),
      rows: rows || 30
    })
  }
}
