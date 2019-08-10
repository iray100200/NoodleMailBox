import { Controller } from '../base'
import { ImapAccount } from './service'
import { IMAP_SCOPE } from '../../com/imap'
import params from '../../com/params'
import logger from '../../com/logger'

export default class ImapController extends Controller {
  register() {
    return {
      '@all->/auth': (req, res) => {
        this.auth(Object.assign(req.params, params(req)))
          .then(f => {
            res.status(200).send({
              data: f
            })
          })
          .catch(e => {
            res.status(500).send({ error: e || e.message })
          })
      },
      '@all->/receive/list/:scope': (req, res) => {
        this.receiveList(Object.assign(req.params, params(req)))
          .then(f => {
            res.status(200).send({
              data: f
            })
          })
          .catch(e => {
            res.status(500).send({ error: e || e.message })
          })
      },
      '@all->/receive/details': (req, res) => {
        this.receiveDetails(Object.assign(req.params, params(req)))
          .then(f => {
            res.status(200).send({
              data: f
            })
          })
          .catch(e => {
            res.status(500).send({ error: e || e.message })
          })
      },
      '@all->/mark/flag': (req, res) => {
        this.markSeen(Object.assign(req.params, params(req)))
          .then(f => {
            res.status(200).send({
              data: f
            })
          })
          .catch(e => {
            res.status(500).send({ error: e || e.message })
          })
      }
    }
  }
  checkAuth(username, password, host, port) {
    logger.info('...Start checking auth')
    if (!username || !password || !host) {
      return Promise.reject('Username & Password & Host are required.')
    }
    try {
      return Promise.resolve(new ImapAccount(username, password, host, port))
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
  async receiveList(params) {
    let { scope, condition, date, rows, uuid, type = "INBOX" } = params
    if (!condition) return Promise.reject('Invalid parameters. The condition\'s type is invalid.')
    if (!date) return Promise.reject('Invalid parameters. The date\'s type is invalid.')
    if (!scope || Object.keys(IMAP_SCOPE).indexOf((scope = scope.toUpperCase())) < 0) return Promise.reject('Invalid parameters. Flag is incorrect.')
    try {
      return ImapAccount.fetchList({
        scope: scope || IMAP_SCOPE.ALL,
        condition,
        date: Date.parse(date),
        rows: rows || 30,
        uuid,
        type: type.toUpperCase()
      })
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
  async receiveDetails(params) {
    try {
      return ImapAccount.fetchDetails(params)
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
  async markSeen(params) {
    try {
      return ImapAccount.markSeen(params)
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
  async auth(params) {
    let { username, password, host, port } = params
    try {
      let access = await this.checkAuth(username, password, host, port)
      return access.auth(params)
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
}
