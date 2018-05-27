import './src/com';
import Express from "express";
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser'
import http from 'http';

/*
(function () {
  var Imap = require('imap'),
    inspect = require('util').inspect;

  var imap = new Imap({user: 'iray100200@hotmail.com', password: 'lming%1oo200', host: 'imap-mail.outlook.com', port: 993, tls: true});

  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  imap
    .once('ready', function () {
      openInbox(function (err, box) {
        if (err)
          throw err;
        var f = imap
          .seq
          .fetch('1:3', {
            bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
            struct: true
          });
        f.on('message', function (msg, seqno) {
          console.log('Message #%d', seqno);
          var prefix = '(#' + seqno + ') ';
          msg.on('body', function (stream, info) {
            var buffer = '';
            stream.on('data', function (chunk) {
              buffer += chunk.toString('utf8');
            });
            stream.once('end', function () {
              console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
            });
          });
          msg.once('attributes', function (attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          msg.once('end', function () {
            console.log(prefix + 'Finished');
          });
        });
        f.once('error', function (err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function () {
          console.log('Done fetching all messages!');
          imap.end();
        });
      });
    });

  imap.once('error', function (err) {
    console.log(err);
  });

  imap.once('end', function () {
    console.log('Connection ended');
  });

  imap.connect();
})()

*/

const Router = Express.Router;
const app = Express();

const corsOptions = {
  origin: [
    /localhost:[0-9]{2,5}/, /127.0.0.1:[0-9]{2,5}/
  ],
  optionsSuccessStatus: 200,
  credentials: true
};

fs.readdir("./src/controllers", (err, p) => {
  if (err) {
    console.error(err);
    return;
  }
  p.forEach(f => {
    try {
      fs.stat(`./src/controllers/${f}`, (err, stat) => {
        if (err) {
          console.error(err);
          return;
        }
        if (stat.isDirectory()) {
          const router = Router();
          const _ctrl = require(`./src/controllers/${f}/index`);
          if (!_ctrl.hasOwnProperty('default')) {
            console.error(`Module should have a default exported class.`)
            return;
          }
          const ctrl = new _ctrl.default(router);
          ctrl.register();
          app.use(`/${f}`, router);
        }
      });
    } catch (e) {
      console.log(e);
    }
  });
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors(corsOptions));

http
  .createServer(app)
  .listen(3000, () => {
    console.log("Server is listening at port 3000");
  });
