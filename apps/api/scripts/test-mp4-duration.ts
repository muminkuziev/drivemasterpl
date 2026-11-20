/**
 * mp4 davomiylik parseri va video oynasi hisobini sintetik fayllar bilan sinaydi:
 *   npx ts-node scripts/test-mp4-duration.ts
 */
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { readMp4DurationMs } from '../src/content/mp4-duration';
import { questionTiming, videoWindowMs } from '../src/exam/exam-rules';

const box = (type: string, payload: Buffer) => {
  const b = Buffer.alloc(8 + payload.length);
  b.writeUInt32BE(8 + payload.length, 0);
  b.write(type, 4, 'latin1');
  payload.copy(b, 8);
  return b;
};
const mvhdV0 = (timescale: number, duration: number) => {
  const p = Buffer.alloc(100);
  p[0] = 0;
  p.writeUInt32BE(timescale, 12);
  p.writeUInt32BE(duration, 16);
  return box('mvhd', p);
};
const mvhdV1 = (timescale: number, duration: bigint) => {
  const p = Buffer.alloc(112);
  p[0] = 1;
  p.writeUInt32BE(timescale, 20);
  p.writeBigUInt64BE(duration, 24);
  return box('mvhd', p);
};
const ftyp = box('ftyp', Buffer.from('isom0000isomiso2', 'latin1'));
const mdat = box('mdat', Buffer.alloc(200_000, 7));

const dir = mkdtempSync(join(tmpdir(), 'mp4t-'));
let failures = 0;
const check = (name: string, ok: boolean) => {
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}`);
};

try {
  const a = join(dir, 'a.mp4');
  writeFileSync(a, Buffer.concat([ftyp, box('moov', mvhdV0(1000, 7340))]));
  check('moov at front, v0 -> 7340 ms', readMp4DurationMs(a) === 7340);

  const b = join(dir, 'b.mp4');
  writeFileSync(b, Buffer.concat([ftyp, mdat, box('moov', Buffer.concat([box('free', Buffer.alloc(12)), mvhdV0(90000, 585000)]))]));
  check('moov at END after mdat, timescale 90000 -> 6500 ms', readMp4DurationMs(b) === 6500);

  const c = join(dir, 'c.mp4');
  writeFileSync(c, Buffer.concat([ftyp, box('moov', mvhdV1(600, 4200n))]));
  check('mvhd version 1 -> 7000 ms', readMp4DurationMs(c) === 7000);

  const d = join(dir, 'd.bin');
  writeFileSync(d, Buffer.alloc(5000, 1));
  check('garbage -> null', readMp4DurationMs(d) === null);
  check('missing file -> null', readMp4DurationMs(join(dir, 'nope.mp4')) === null);

  check('window = duration + 0.5s buffer (6500 -> 7000)', videoWindowMs(6500) === 7000);
  check('unknown duration -> default 10s', videoWindowMs(null) === 10000);
  check('absurd long video capped at 60s', videoWindowMs(300000) === 60000);
  const t = questionTiming('basic', 'video', 6500);
  check('basic video total = 20 + 7 + 15 s', t.videoMs === 7000 && t.totalMs === 42000);
  check('photo ignores duration', questionTiming('basic', 'photo', 6500).videoMs === 0);
  check('specialist ignores video window', questionTiming('specialist', 'video', 6500).totalMs === 50000);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
console.log(failures === 0 ? 'ALL OK' : `${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
