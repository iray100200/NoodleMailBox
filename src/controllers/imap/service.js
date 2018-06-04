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
    if (conf.hasOwnProperty(host)) {
      this.host = conf[host].host;
      this.port = conf[host].port;
    } else {
      this.host = host;
      this.port = port || 993;
    }
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
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        this.openInbox((err, box) => {
          if (err) {
            return reject(err);
          }
          imap.search(["ALL", ["SINCE", IMAP_DATE.LAST_7_DAYS]], (err, results) => {
            if (err) {
              return reject(err);
            }
            let parsed = {};
            let f = imap.fetch(results, { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], struct: true });
            f.on("message", (msg, seqno) => {
              let html, text, header = '', attributes;
              parsed[seqno] = {};
              msg.on("body", (stream, info) => {
                let msgText = '';
                stream.on('data', (chunk) => {
                  if (info.which === 'TEXT') {
                    msgText += chunk.toString('utf8');
                  } else {
                    header += chunk.toString('utf8');
                  }
                });
                let end = stream.once('end', () => {
                  if (info.which === 'TEXT') {
                    let mail = new Mail(msgText);
                    let f = mail.parse();
                    text = f[0];
                    html = f[1];
                    parsed[seqno].body = {
                      text, html
                    }
                  } else {
                    parsed[seqno].header = header;
                  }
                });
              });
              msg.once("attributes", (attrs) => {
                parsed[seqno].attributes = attrs
              });
              msg.once("end", () => {
                console.log(`Mail ${seqno} end.`)
              });
            });
            f.once("error", (err) => {
              reject(err);
            });
            f.once("end", () => {
              resolve(parsed);
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
