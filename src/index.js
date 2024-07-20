import big5Iterator from './big5.js';
import gbIterator from './gb.js';
import { UnicodeSet, getHex } from './unicode-set.js';
import Sfnt from './sfnt.js';

const big5Set = new UnicodeSet(big5Iterator(0xa440, 0xc67e), 'big5');
const gbkSet = new UnicodeSet(gbIterator(0xb0a1, 0xd7f9), 'gbk');
const unicodes = UnicodeSet.unionArray([Object.keys(big5Set.u2c), Object.keys(gbkSet.u2c)]);

function update(fontBuf) {
    let font = new Sfnt(fontBuf);
    let result = '序號\tunicode\t文字\tbig5\tgbk\n';
    result += '-------------------------------------\n';
    let count = 0;
    unicodes.forEach(uni => {
        if (font.getGid(uni) === 0) {
            let code0 = getHex(uni);
            let str = String.fromCharCode(uni);
            let code1 = big5Set.u2c[uni] !== undefined ? getHex(big5Set.u2c[uni]) : '';
            let code2 = gbkSet.u2c[uni] !== undefined ? getHex(gbkSet.u2c[uni]) : '';
            result += `${++count}\t${code0}\t${str}\t${code1}\t${code2}\n`
        }
    });
    document.querySelector('pre').textContent = result;
}

document.querySelector('#file-input').addEventListener('change', evt => {
    let frd = new FileReader();
    frd.onload = function() {
        update(this.result);
    }
    frd.readAsArrayBuffer(evt.target.files[0]);
});


