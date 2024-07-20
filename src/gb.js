function valid(code) {
    let l = code & 0xff;
    let h = code >> 8;
    if(
        0xa1 <= h && h <= 0xfe &&
        0xa1 <= l && l <= 0xfe
    ) {
        return true;
    }
    return false;
}

function iter(startCode, endCode) {
    if(!valid(startCode) || !valid(endCode) || startCode > endCode) {
        throw 'gb2312 編碼區間錯誤';
    }
    let x = startCode;
    return function () {
        if (x > endCode) {
            return null;
        }
        let l = x & 0xff;
        let h = x >> 8;
        if (l === 0xfe) {
            l = 0xa1;
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
