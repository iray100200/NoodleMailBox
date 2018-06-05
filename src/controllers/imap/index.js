import { Controller } from '../base';
import { ImapAccount } from './service';
import Conf from '../../config/imap.conf';
import params from '../../com/params';

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
        let imapAccount = new ImapAccount(params.username, params.password, params.host);
        return imapAccount.retrieveUnreadEmails();
    }
}