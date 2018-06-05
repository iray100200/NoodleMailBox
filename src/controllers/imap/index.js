import { Controller } from '../base';
import { ImapAccount } from './service';
import { IMAP_DATE, IMAP_FLAG } from '../../com/imap';
import { since } from '../../com/date';
import Conf from '../../config/imap.conf';
import params from '../../com/params';

const last = since();

export default class ImapController extends Controller {
    register() {
        this.Router.all('/receive/:flag/:days', (req, res) => {
            this.receive(Object.assign(req.params, params(req))).then(f => {
                res.status(200).send({
                    data: f
                })
            }).catch(e => {
                res.status(500).send({ error: e });
            });
        })
    }
    receive(params) {
        let { flag, days } = params;
        let imapAccount = new ImapAccount(params.username, params.password, params.host);
        if (!days || !Number(days)) return Promise.reject('Invalid parameters. The days must be a number.');
        if (!flag || Object.keys(IMAP_FLAG).indexOf(flag = flag.toUpperCase()) < 0) return Promise.reject('Invalid parameters. Flag is incorrect.')
        return imapAccount.retrieveUnreadEmails({
            flag: flag || IMAP_FLAG.ALL,
            since: last(Number(days)) || IMAP_DATE.LAST_30_DAYS
        });
    }
}