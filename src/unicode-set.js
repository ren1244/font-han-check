function getHex(code) {
    code = code.toString(16).toUpperCase();
    if (code.length < 4) {
        code = '0'.repeat(4 - code.length);
    }
    return code;
}

class UnicodeSet {
    constructor(iter, decoderLabel) {
        let buf = new ArrayBuffer(2);
        let dv = new DataView(buf);
        let rd = new TextDecoder(decoderLabel, { fatal: true });
        let u2c = {}; // unicode => code
        let c2u = {}; // code => unicode
        for (let code = iter(); code !== null; code = iter()) {
            dv.setUint16(0, code);
            let uni = rd.decode(buf).codePointAt(0);
            if (u2c[uni] !== undefined) {
                throw `unicode ${getHex(uni)} 重複編碼 ${getHex(u2c[uni])}, ${getHex(code)}`;
            }
            if (c2u[code] !== undefined) {
                throw `code ${getHex(code)} 重複編碼 ${getHex(c2t[code])}, ${getHex(uni)}`;
            }
            u2c[uni] = code;
            c2u[code] = uni;
        }
        this.u2c = u2c;
        this.c2u = c2u;
    }

    static unionArray(arrCollect) {
        let dict = {};
        arrCollect.forEach((arr, idx) => {
            arr.forEach(x => {
                if (dict[x] === undefined) {
                    dict[x] = idx;
                } else {
                    dict[x] = Math.min(idx, dict[x]);
                }
            });
        });
        let arr = Object.keys(dict).map(x => parseInt(x, 10));
        arr.sort((a, b) => {
            return a - b;
        });
        return arr;
    }
}

export { UnicodeSet, getHex };