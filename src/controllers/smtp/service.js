import logger from '../../com/logger'
import nodemailer from 'nodemailer'
import config from '../../config/smtp.conf'
import { resolve } from 'url'

const MAIL_REG = /[0-9a-zA-z_]*\@([\S]*)\.com/

export class SmtpService {
  transporter = null
  constructor(auth, opts) {
    let options = { ...opts }
    let host = auth.user.match(MAIL_REG)[1]
    let conf = config[host]
    this.transporter = nodemailer.createTransport({
      host: options.host || conf.host,
      port: options.port || conf.port || 25,
      secure: options.secure || false,
      auth: auth,
      tls: options.tls || { ciphers: 'SSLv3' }
    })
  }
  send(options) {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        cc: options.cc,
        bcc: options.bcc,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      }, function (err, info) {
        if (err) {
          logger.info('Error: ' + err)
          reject(err)
        } else {
          logger.info(info)
          resolve(info)
        }
      })
    })
  }
}