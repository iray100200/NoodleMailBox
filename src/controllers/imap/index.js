import { Controller } from '../base';
import { ImapAccount } from './service';

export default class ImapController extends Controller {
    register() {
        this.Router.all('/receive', (req, res) => {
            this.receive(res);
        })
    }
    receive(res) {
        let imapAccount = new ImapAccount('iray100200@hotmail.com', 'lming%1oo200');
        imapAccount.retrieveUnreadEmails((prefix) => {
            res.status(200, {
                "Content-Type": "application/json"
            }).send({
                data: prefix
            })
        });
    }
}