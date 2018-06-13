import iconv from 'iconv-lite'
import traverse from './traverse'
import quotedPrintable from 'quoted-printable'

let encodings = ['ascii', 'utf8', 'utf16le', 'ucs2', 'base64', 'latin1', 'binary', 'hex']

export class Mail {
  raw
  structure
  constructor(str, _struct) {
    this.raw = str.replace(/^\"([\w\W]*)\"$/, '$1')
    this.structure = _struct
  }
  decode(str, _struct) {
    let { encoding, type, params } = _struct
    let buf
    switch (type) {
      case 'text':
        try {
          if (encodings.indexOf(encoding) > -1) {
            buf = Buffer.from(str, encoding)
          } else {
            switch (encoding) {
              case 'quoted-printable':
                buf = quotedPrintable.decode(str)
                break
              default:
                return str
            }
          }
        } catch (e) {
          console.log(e)
        }
        if (buf) return iconv.decode(buf, params.charset || 'gb2312')
      default:
        return str
    }
  }
  parse() {
    switch (this.structure.length) {
      case 1:
        let struct = this.structure[0]
        let text = this.decode(this.raw, struct)
        return {
          text,
          struct
        }
      default:
        let _this = this
        let f = traverse(this.structure)
        let k = f
          .filter(o => {
            return o.params && o.params.boundary
          })
          .map(o => {
            return o.params.boundary
          })
        let r = []
        let c = f
          .filter(o => {
            return o.size
          })
          .forEach(o => {
            let t = []
            let pids = o.partID.split('.').map(o => {
              return Number(o)
            })
            pids.forEach((o, i) => {
              let _t = i < 1 ? this.raw : t[i - 1]
              t[i] = _t.split(`--${k[i]}\r\n`)[o].replace(new RegExp(`[\-]*${k[i]}[\-]*`), '')
            })
            r.push({
              text: t[pids.length - 1],
              struct: o
            })
          })
        let q = r.map(f => {
          f.text = this.decode(f.text.split(/\r\n\r\n/)[1].trim(), f.struct)
          return f
        })
        let hmlIdx = q.findIndex(o => {
          return o.struct.subtype === 'html'
        })
        let imgs = q.filter(o => {
          return o.struct.type === 'image'
        })
        imgs.forEach(o => {
          let imgId = o.struct.id
          q[hmlIdx].text = q[hmlIdx].text.replace(`cid:${imgId.substring(1, imgId.length - 1)}`, `data:image/${o.struct.subtype};base64,${o.text}`)
        })
        return q
    }
  }
}
