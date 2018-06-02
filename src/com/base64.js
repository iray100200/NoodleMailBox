let map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

module.exports = Base64 = function (str) {
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
}