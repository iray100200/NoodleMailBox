function _Mail(str) {
    let raw = str.replace(/\"([\w\W]*)\"/, '$1');
    return function(cb) {
        let parsed = cb.apply(this, [raw].concat(Array.from(arguments)));
        return function(fn) {
            return fn(parsed);
        }
    }
}

export class Mail {
    mail;
    constructor(str) {
        this.mail = _Mail(str);
    }
    parse(fn) {
        let f = this.mail(r => {
            return r.split(/\-\-\S*[\n\r]/).slice(1, 3);
        });
        return f(fn || (p => p));
    }
}