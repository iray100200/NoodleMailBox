import { Controller } from '../base'
import { ImapAccount } from './service'
import { IMAP_SCOPE } from '../../com/imap'
import params from '../../com/params'
import logger from '../../com/logger'
import { SmtpService } from './service'

export default class SmtpController extends Controller {
  register() {
    return {
      '@all->/send': (req, res) => {
        this.send(Object.assign(req.params, params(req)))
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
  async send(params) {
    try {
      let service = new SmtpService({ user: params.username, pass: params.password })
      return service.send({
        to: 'tb100200@outlook.com',
        subject: '测试邮件主题',
        html: '<div>测试邮件一</div>'
      })
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
}
