import iconv from 'iconv-lite';

export class Mail {
    raw;
    structure;
    constructor(str, _struct) {
        this.raw = str.replace(/\"([\w\W]*)\"/, '$1');
        this.structure = _struct;
    }
    parse() {
        switch (this.structure.length) {
            case 1:
                let { encoding, type, subtype } = this.structure[0];
                const buf = Buffer.from(this.raw, encoding);
                let text = iconv.decode(buf, 'gbk');
                return {
                    type, subtype, text
                }
                break;
        }
    }
}