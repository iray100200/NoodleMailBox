import Imap from 'imap';
import fs from "fs";
import conf from '../../conf/imap.conf';
import { inspect } from 'util';
import { Base64 } from 'js-base64';
import { Mail } from '../../com/mail';
import { IMAP_DATE } from '../../com/imap';

export class ImapAccount {
  user;
  password;
  host;
  port;
  tls;
  imap;
  constructor(user, password, host, port) {
    this.user = user;
    this.password = password;
    this.host = host || conf.hotmail.host;
    this.port = port || conf.hotmail.port;
    this.imap = new Imap({ user: this.user, password: this.password, host: this.host, port: this.port, tls: true });
  }
  static create(imapAccount) {
    return new ImapAccount({ user: imapAccount.user, password: imapAccount.password, host: conf.hotmail, port: imapAccount.port, tls: true });
  }
  openInbox(cb) {
    this.imap.openBox("INBOX", true, cb);
  }
  imapOnError() {
    return this.imap.on('error', (err) => {
      console.log(err);
    });
  }
  connectImap() {
    this.imap.connect();
  }
  retrieveUnreadEmails(cb) {
    let imap = this.imap;
    let result = [];
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        this.openInbox((err, box) => {
          if (err) {
            return reject(err);
          }
          imap.search(["UNSEEN", ["SINCE", IMAP_DATE.LAST_7_DAYS]], (err, results) => {
            if (err) {
              return reject(err);
            }
            let f = imap.fetch(results, { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], struct: true });
            f.on("message", (msg, seqno) => {
              let html, text, header = '', attributes;
              msg.on("body", (stream, info) => {
                var msgText = '';
                stream.on('data', (chunk) => {
                  if (info.which === 'TEXT') {
                    msgText += chunk.toString('utf8');
                  } else {
                    header += chunk.toString('utf8');
                  }
                });
                stream.once('end', () => {
                  if (info.which === 'TEXT') {
                    let mail = new Mail(msgText);
                    let f = mail.parse();
                    text = f[0];
                    html = f[1];
                  }
                });
              });
              msg.once("attributes", (attrs) => {
                attributes = attrs
              });
              msg.once("end", () => {
                result.push({
                  header, attributes, body: {
                    text, html
                  }
                })
              });
            });
            f.once("error", (err) => {
              reject(err);
            });
            f.once("end", () => {
              resolve(result);
              imap.end();
            });
          });
        });
      });

      imap.once('error', function (err) {
        reject(err)
      });

      imap.once('end', function (chunk) {
        console.log('Imap connection ended!');
      });

      imap.connect();
    });
  }
}
