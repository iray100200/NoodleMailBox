let map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

let Base64 = {
    encode(str) {
        let len = str.length;
        let estr = '', result = '';
        for (var i = 0; i < str.length; i++) {
            let asc = str[i].charCodeAt();
            let _nbit = '0000'.concat(asc.toString(2));
            let _8bit = _nbit.substr(_nbit.length - 8, _nbit.length);
            estr = estr.concat(_8bit);
        }
        for (var i = 0; i < estr.length / 6; i++) {
            let s = estr.substring(i * 6, (i + 1) * 6);
            let f = 6 - s.length, g = '';
            if (f > 0) {
                s = s.concat.apply(s, Array.apply(this, { length: f }).map(() => '0'));
                g = f === 2 ? '=' : f === 4 ? '==' : '';
            }
            let p = parseInt(s, 2);
            let d = map[p];
            result = result.concat.call(result, d, g);
        }
        return result;
    },
    decode(str) {
        let end = str.replace(/([^\=]*)([\=]*)$/, '$2');
        let endl = end.length * 2;
        let t = '', r = '';
        str = str.replace(/\=*$/, '');
        for (var i = 0; i < str.length; i++) {
            let p = map.indexOf(str.charAt(i));
            let f = ('00000' + p.toString(2));
            let g = f.substring(f.length - 6, f.length);
            t = t.concat(g);
        }
        t = t.substr(0, t.length - endl);
        for (var i = 0; i < t.length / 8; i++) {
            let a = parseInt(t.substr(i * 8, 8), 2);
            let b = String.fromCharCode(a);
            r = r.concat(b);
        }
        return r;
    }
}

export default Base64