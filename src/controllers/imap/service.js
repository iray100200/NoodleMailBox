const Imap = require('imap');
const inspect = require('util').inspect;
import fs from "fs";
import conf from '../../conf/imap.conf';

function last30Days() {
  let dt = new Date();
  dt.setTime(Date.now() - 30 * 3600 * 1000 * 24);
  return dt;
}

function last7Days() {
  let dt = new Date();
  dt.setTime(Date.now() - 7 * 3600 * 1000 * 24);
  return dt;
}

export class ImapDate {
  static LAST_30_DAYS = last30Days();
  static LAST_7_DAYS = last7Days();
}

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
    this.imap = new Imap({user: this.user, password: this.password, host: this.host, port: this.port, tls: true});
  }
  static create(imapAccount) {
    return new ImapAccount({user: imapAccount.user, password: imapAccount.password, host: conf.hotmail, port: imapAccount.port, tls: true});
  }
  openInbox(cb) {
    this
      .imap
      .openBox("INBOX", true, cb);
  }
  parseDate(dateStr) {
    let year = dateStr.substr(6)
    return dateStr
      .substr(0, 6)
      .concat(",")
      .concat(year)
  }
  retrieveUnreadEmails(cb) {
    let me = this;
    this
      .imap
      .on('error', () => {
        console.log(0)
      })
    this
      .imap
      .once('ready', () => {
        console.log('---------------------')
        me.openInbox(function (err, box) {
          if (err) {
            return cb(err);
          }
          me
            .imap
            .search([
              "UNSEEN",
              ["SINCE", ImapDate.LAST_7_DAYS]
            ], function (err, results) {
              if (err) {
                cb(err);
              }
              var f = me
                .imap
                .fetch(results, {bodies: ""});
              var text = "";
              f.on("message", function (msg, seqno) {
                var prefix = '(#' + seqno + ') ';
                msg.on("body", function (stream, info) {
                  var buffer = '';
                  stream.on('data', function (chunk) {
                    buffer += chunk.toString('utf8');
                    if (info.which == "1") {
                      text += chunk.toString('utf8');
                    }
                  });
                  stream.once('end', function () {
                    console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                  });
                });
                msg.once("attributes", function (attrs) {
                  console.log(JSON.stringify(attrs));
                });
                msg.once("end", function () {
                  console.log(prefix + "Finished");
                  console.log(text);
                });
              });
              f.once("error", function (err) {
                cb(err);
                console.log("Fetch error: " + err);
              });
              f.once("end", function () {
                console.log("Done fetching all messages!");
                me
                  .imap
                  .end();
              });
            });
        });
      });

    this
      .imap
      .once('error', function (err) {
        console.log(err);
      });

    this
      .imap
      .once('end', function (chunk) {
        console.log('Connection ended');
        cb(chunk)
      });

    this
      .imap
      .connect();
  }
}
