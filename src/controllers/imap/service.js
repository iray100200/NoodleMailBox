import Imap from 'imap'
import conf from '../../config/imap.conf'
import { Mail } from '../../com/mail'
import logger from '../../com/logger'
import uuidv1 from 'uuid/v1'
import uuidv5 from 'uuid/v5'

export class ImapAccount {
  user
  password
  host
  port
  tls
  imap
  _uuid
  static connections = {}
  constructor(user, password, host, port) {
    this.user = user
    this.password = password
    if (conf.hasOwnProperty(host)) {
      this.host = conf[host].host
      this.port = conf[host].port
    } else {
      this.host = host
      this.port = port || 993
    }
    this.imap = new Imap({ user: this.user, password: this.password, host: this.host, port: this.port, tls: true })
    ImapAccount.connections[this.uuid] = this.imap
  }
  static create(imapAccount) {
    return new ImapAccount({ user: imapAccount.user, password: imapAccount.password, host: conf.hotmail, port: imapAccount.port, tls: true })
  }
  get uuid() {
    return this._uuid ? this._uuid : (() => {
      this._uuid = uuidv5(this.user, uuidv1())
      return this._uuid
    })()
  }
  openInbox(cb) {
    this.imap.openBox('INBOX', true, cb)
  }
  static fetchDetails(params) {
    let { list, uuid } = params
    let parsed = {}, raw = {}, imap = ImapAccount.connections[uuid]
    if (!(list instanceof Array)) {
      return Promise.reject('Invalid parameter!')
    }
    if (!list.length) {
      imap.end()
      return Promise.resolve({
        result: []
      })
    }
    return new Promise((resolve, reject) => {
      logger.info('...Start fetching details')
      if (!imap) reject('...Connection does not exist!')
      imap.fetch(list, { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], struct: true })
        .on('message', (msg, seqno) => {
          logger.info('...Start fetching detail on message', seqno)
          raw[seqno] = {}
          msg.on('body', (stream, info) => {
            let msgText = '', header = ''
            stream.on('data', chunk => {
              if (info.which === 'TEXT') {
                msgText += chunk.toString('utf8')
              } else {
                header += chunk.toString('utf8')
              }
            })
            stream.once('end', () => {
              if (info.which === 'TEXT') {
                raw[seqno].body = msgText
              } else {
                raw[seqno].header = header
              }
            })
          })
          msg.once('attributes', attrs => {
            raw[seqno].attributes = attrs
          })
          msg.once('end', () => {
            let r = raw[seqno]
            let mail = new Mail(r.body, r.attributes.struct)
            let t = mail.parse()
            parsed[seqno] = {
              header: Imap.parseHeader(r.header),
              attributes: r.attributes,
              body: t
            }
          })
        })
        .once('error', err => {
          reject(err)
        })
        .once('end', () => {
          resolve({ result: parsed })
          imap.end()
        })
    })
  }
  fetchList(params) {
    let imap = this.imap
    let { scope, condition, date, rows } = params
    return new Promise((resolve, reject) => {
      logger.info('...Start fetching list')
      imap.once('ready', () => {
        this.openInbox(err => {
          if (err) {
            return reject(err)
          }
          imap.search([scope || 'ALL', [condition || 'SINCE', date || new Date()]], (err, result) => {
            if (err) {
              return reject(err)
            }
            let [...map] = result;
            result.reverse()
            result.length > rows ? result.length = rows : null
            resolve({ result, map, uuid: this.uuid })
          })
        })
      })

      imap.once('error', function (err) {
        reject(err)
      })

      imap.once('end', function () {
        logger.info('...Imap connection ended!')
      })

      imap.connect()
    })
  }
}
