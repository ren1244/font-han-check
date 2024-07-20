function valid(code) {
    let l = code & 0xff;
    let h = code >> 8;
    if(
        0x81 <= h && h <= 0xfe &&
        (0x40 <= l && l <= 0x7e || 0xa1 <= l && l <= 0xfe)
    ) {
        return true;
    }
    return false;
}

function iter(startCode, endCode) {
    if(!valid(startCode) || !valid(endCode) || startCode > endCode) {
        throw 'big5 編碼區間錯誤';
    }
    let x = startCode;
    return function () {
        if (x > endCode) {
            return null;
        }
        let l = x & 0xff;
        let h = x >> 8;
        if (l === 0x7e) {
            l = 0xa1;
        } else if (l === 0xfe) {
            l = 0x40;
            ++h;
        } else {
            ++l;
        }
        let tmp = x;
        x = h << 8 | l;
        return tmp;
    }
}

export default iter;
