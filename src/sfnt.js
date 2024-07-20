const CmapSubtable = {};

CmapSubtable[4] = function (dv) {
    let segCount = dv.getUint16(6) >>> 1;
    let offset = dv.byteOffset + 14;
    let endCodeOffset = 14;
    let startCodeOffset = endCodeOffset + segCount * 2 + 2;
    let idDeltaOffset = startCodeOffset + segCount * 2;
    let idRangeOffset = idDeltaOffset + segCount * 2;
    let m = new Map();
    for (let i = 0; i < segCount; ++i) {
        let s = dv.getUint16(startCodeOffset + i * 2);
        let e = dv.getUint16(endCodeOffset + i * 2);
        let d = dv.getUint16(idDeltaOffset + i * 2);
        let o = dv.getUint16(idRangeOffset + i * 2);
        if (s === 0xffff && e === 0xffff) {
            continue;
        }
        if (o === 0) {
            for (let cid = s; cid <= e; ++cid) {
                let gid = (cid + d) & 0xffff;
                m.set(cid, gid);
            }
        } else {
            offset = idRangeOffset + i * 2 + o;
            for (let cid = s; cid <= e; ++cid) {
                let gid = dv.getUint16(offset);
                offset += 2;
                m.set(cid, gid);
            }
        }
    }
    return m;
}

CmapSubtable[6] = function (dv) {
    let firstCode = dv.getUint16(6);
    let entryCount = dv.getUint16(8);
    let offset = 10;
    let m = new Map;
    for (let i = 0; i < entryCount; ++i) {
        let cid = firstCode + i;
        let gid = dv.getUint16(offset);
        offset += 2;
        m.set(cid, gid);
    }
    return m;
}

CmapSubtable[12] = function (dv) {
    let numGroups = dv.getUint32(12);
    
    let offset = 16;
    let m = new Map;
    for (let i = 0; i < numGroups; ++i) {
        let startCharCode = dv.getUint32(offset);
        offset += 4;
        let endCharCode = dv.getUint32(offset);
        offset += 4;
        let startGlyphID = dv.getUint32(offset);
        offset += 4;
        for (let cid = startCharCode; cid <= endCharCode; ++cid) {
            let gid = startGlyphID + cid - startCharCode;
            m.set(cid, gid);
        }
    }
    return m;
}

class Sfnt {
    constructor(fontBuffer) {
        this.buf = fontBuffer;
        this.dv = new DataView(this.buf);
        this.readTables();
        this.readCmap();
    }

    readTables() {
        let numTables = this.dv.getUint16(4);
        let offset = 12;
        let tables = {};
        for (let i = 0; i < numTables; ++i) {
            let tag = this.dv.getUint32(offset);
            tag = String.fromCodePoint(tag >> 24 & 0xff, tag >> 16 & 0xff, tag >> 8 & 0xff, tag & 0xff)
            let tableOffset = this.dv.getUint32(offset + 8);
            let tableLength = this.dv.getUint32(offset + 12);
            tables[tag] = {
                pos: tableOffset,
                len: tableLength,
            };
            offset += 16;
        }
        this.tables = tables;
    }

    readCmap() {
        let dv = new DataView(this.buf, this.tables['cmap'].pos, this.tables['cmap'].len);
        let numTables = dv.getUint16(2);
        let offset = 4;
        let encodingRecord = [];
        for (let i = 0; i < numTables; ++i) {
            let subtableOffset = dv.getUint32(offset + 4);
            let format = dv.getUint16(subtableOffset);
            encodingRecord.push({
                platformID: dv.getUint16(offset),
                encodingID: dv.getUint16(offset + 2),
                subtableOffset,
                format,
            });
            offset += 8;
        }
        // Find subtable
        const readPrecedence = [[0, 4], [3, 10], [0, 3], [3, 1]];
        let subtable = null;
        for (let i = 0; i < readPrecedence.length; ++i) {
            const [platformID, encodingID] = readPrecedence[i];
            let idx = encodingRecord.findIndex(o => o.platformID === platformID && o.encodingID === encodingID);
            if (idx >= 0) {
                subtable = encodingRecord[idx];
                break;
            }
        }
        if (subtable === null) {
            throw '找不到可讀取的 cmap subtable';
        }
        // Read subtable
        console.log(subtable);
        this.cmap = CmapSubtable[subtable.format](
            new DataView(dv.buffer, dv.byteOffset + subtable.subtableOffset, subtable.length)
        );
    }

    getGid(unicode) {
        return this.cmap.get(unicode) || 0;
    }
}

export default Sfnt;