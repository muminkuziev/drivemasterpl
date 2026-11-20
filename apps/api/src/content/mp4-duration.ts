import { closeSync, fstatSync, openSync, readSync } from 'fs';

/**
 * MP4 (ISO BMFF) davomiyligini millisekundda qaytaradi: top-level boxlarni aylanib `moov` -> `mvhd` ni o'qiydi.
 * Butun faylni o'qimaydi (faqat box sarlavhalari), `moov` fayl oxirida bo'lsa ham ishlaydi.
 * Format tanilmasa yoki buzilgan bo'lsa null qaytaradi.
 */
export function readMp4DurationMs(filePath: string): number | null {
  let fd: number;
  try {
    fd = openSync(filePath, 'r');
  } catch {
    return null;
  }
  try {
    const size = fstatSync(fd).size;
    const moov = findBox(fd, 0, size, 'moov');
    if (!moov) return null;
    const mvhd = findBox(fd, moov.dataStart, moov.end, 'mvhd');
    if (!mvhd) return null;
    const buf = Buffer.alloc(32);
    readSync(fd, buf, 0, 32, mvhd.dataStart);
    const version = buf[0];
    let timescale: number;
    let duration: number;
    if (version === 1) {
      timescale = buf.readUInt32BE(20);
      duration = Number(buf.readBigUInt64BE(24));
    } else {
      timescale = buf.readUInt32BE(12);
      duration = buf.readUInt32BE(16);
    }
    if (!timescale || !duration) return null;
    return Math.round((duration / timescale) * 1000);
  } catch {
    return null;
  } finally {
    closeSync(fd);
  }
}

interface Box {
  dataStart: number;
  end: number;
}

function findBox(fd: number, start: number, end: number, type: string): Box | null {
  const head = Buffer.alloc(16);
  let pos = start;
  while (pos + 8 <= end) {
    readSync(fd, head, 0, 16, pos);
    let boxSize = head.readUInt32BE(0);
    const boxType = head.toString('latin1', 4, 8);
    let header = 8;
    if (boxSize === 1) {
      boxSize = Number(head.readBigUInt64BE(8));
      header = 16;
    } else if (boxSize === 0) {
      boxSize = end - pos;
    }
    if (boxSize < header) return null;
    if (boxType === type) return { dataStart: pos + header, end: Math.min(pos + boxSize, end) };
    pos += boxSize;
  }
  return null;
}
