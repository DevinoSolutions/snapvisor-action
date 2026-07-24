// Generates deterministic solid-color PNGs (no external deps) for the action's
// self-test. Usage: node gen-screenshots.mjs <outfile> <colorName>
import zlib from "node:zlib"
import { writeFileSync } from "node:fs"

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "latin1"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function makePng(w, h, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: truecolor RGB
  const stride = w * 3
  const raw = Buffer.alloc((stride + 1) * h)
  for (let y = 0; y < h; y++) {
    const off = y * (stride + 1)
    raw[off] = 0 // filter: none
    for (let x = 0; x < w; x++) {
      const p = off + 1 + x * 3
      raw[p] = r
      raw[p + 1] = g
      raw[p + 2] = b
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))])
}

const COLORS = {
  steelblue: [70, 130, 180],
  seagreen: [46, 139, 87],
}

const [, , outfile, colorName] = process.argv
const color = COLORS[colorName]
if (!outfile || !color) {
  console.error(`Usage: node gen-screenshots.mjs <outfile> <${Object.keys(COLORS).join("|")}>`)
  process.exit(1)
}
writeFileSync(outfile, makePng(200, 100, color))
console.log(`wrote ${outfile} (${colorName})`)
